// ============================================================
// VELONTRI API CLIENT
// ============================================================
const API_URL  = process.env.VELONTRI_API_URL || 'https://velontri.onrender.com/api/v1';
const TIMEOUT  = parseInt(process.env.VELONTRI_TIMEOUT_MS || '15000'); // 15 seconds timeout

// ── Currency formatter ────────────────────────────────────────
const CURRENCY_SYMBOLS = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: '₵',
  KES: 'KSh', ZAR: 'R', EGP: '£E', TZS: 'TSh', UGX: 'USh',
  XOF: 'CFA', XAF: 'FCFA', MAD: 'MAD', DZD: 'DA', ETB: 'Br',
  ZMW: 'ZK', MWK: 'MK', MZN: 'MT', AOA: 'Kz', RWF: 'RF',
};

function formatPrice(amount, currency) {
  const c   = (currency || 'NGN').toUpperCase();
  const sym = CURRENCY_SYMBOLS[c] || c + ' ';
  const num = Number(amount);
  if (isNaN(num)) return `${sym}–`;
  return sym + num.toLocaleString('en-US');
}

// ── Seller display name ───────────────────────────────────────
// API has no seller name field — only seller_id UUID.
// We generate a consistent readable name from the UUID so the
// same seller always shows the same name.
const ADJS  = ['Quick','Smart','Trusted','Prime','Top','Fresh','Bold','Sharp','Swift','Clear','Bright','Solid'];
const NOUNS = ['Store','Market','Hub','Deals','Trader','Shop','Outlet','Sales','Vendor','Trade'];

function sellerName(sellerId) {
  if (!sellerId) return 'Velontri Seller';
  let h = 0;
  for (let i = 0; i < sellerId.length; i++) h = (h * 31 + sellerId.charCodeAt(i)) >>> 0;
  const adj    = ADJS[h % ADJS.length];
  const noun   = NOUNS[Math.floor(h / ADJS.length) % NOUNS.length];
  const suffix = sellerId.replace(/-/g, '').slice(-4).toUpperCase();
  return `${adj} ${noun} ${suffix}`;
}

// ── Fetch with timeout + 1 retry ─────────────────────────────
async function apiFetch(path, params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const url = `${API_URL}${path}${qs ? '?' + qs : ''}`;
  for (let attempt = 0; attempt <= 1; attempt++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const r = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!r.ok) throw new Error(`API ${r.status}`);
      return await r.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === 1) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ── Map raw listing to clean shape ────────────────────────────
// Works for both list endpoint (no seller name/phone) and
// detail endpoint (has seller_name, whatsapp_number, contact_phone)
function mapListing(raw) {
  const id       = raw.id;
  const sid      = raw.seller_id;
  const currency = (raw.currency || 'NGN').toUpperCase();
  const price    = Number(raw.price) || 0;

  // Real seller name from detail endpoint, fallback to generated name
  const realSellerName = raw.seller_name || null;

  // Real WhatsApp number from detail endpoint
  // Stored as bare international digits e.g. "2349158200927"
  const waRaw = raw.whatsapp_number || raw.contact_phone || null;
  const listing_url = `https://velontri.pxxl.click/listings/${id}`;
  const seller_profile_url = sid
    ? `https://velontri.pxxl.click/sellers/${sid}`
    : null;

  const contact_url = waRaw ? buildWALink(waRaw, raw.title) : null;

  return {
    id,
    title:           (raw.title || '').trim(),
    description:     raw.description || '',
    price,
    currency,
    formatted_price: formatPrice(price, currency),
    category:        raw.category || '',
    condition:       raw.condition || '',
    listing_type:    raw.listing_type || 'physical',
    state:           raw.state || '',
    city:            raw.city || '',
    country:         raw.country || 'NG',
    image_url:       raw.image_url || null,
    avg_rating:      raw.avg_rating || 0,
    review_count:    raw.review_count || 0,
    verified:        !!raw.seller_verified,
    seller_id:       sid,
    seller_name:     realSellerName || sellerName(sid),
    seller_profile_url,
    is_negotiable:   !!(raw.is_negotiable || raw.negotiable),
    listing_url,
    contact_url,
    seller_contact_fallback: listing_url,
    created_at:      raw.created_at || null,
    // Flag to know if this has been enriched with real seller data
    _enriched:       !!(realSellerName && waRaw),
  };
}

// ── Enrich listings with real seller data from detail endpoint ─
// The list endpoint omits seller_name and whatsapp_number.
// The detail endpoint includes them. We fetch all in parallel.
// OPTIMIZED: Only fetch first 5 to reduce response time
async function enrichListings(listings) {
  // Only enrich first 5 listings for speed
  const toEnrich = listings.slice(0, 5);
  const rest = listings.slice(5);
  
  const results = await Promise.allSettled(
    toEnrich.map(l => apiFetch(`/listings/${l.id}`))
  );
  
  const enriched = toEnrich.map((l, i) => {
    const res = results[i];
    if (res.status === 'fulfilled') {
      const detail = res.value?.data || res.value || {};
      if (detail.id) return mapListing(detail);
    }
    return l; // keep original if detail fetch failed
  });
  
  return [...enriched, ...rest];
}

// ── Build WhatsApp direct link ────────────────────────────────
function buildWALink(phone, title) {
  if (!phone) return null;
  let n = String(phone).replace(/[^\d+]/g, '');
  if (n.startsWith('0')) n = '+234' + n.slice(1);
  if (!n.startsWith('+')) n = '+' + n;
  const msg = encodeURIComponent(
    `Hi! I found your listing on Velontri: "${(title || '').trim()}" — I'm interested. Please share more details.`
  );
  return `https://wa.me/${n.replace('+', '')}?text=${msg}`;
}

// ── Text relevance filter ─────────────────────────────────────
const STOP = new Set([
  'i','me','my','we','you','a','an','the','some','any',
  'please','find','show','get','search','need','want','buy',
  'for','in','at','of','and','or','with','is','are','all',
  'every','everything','items','listings','stuff','things','products','car','vehicle',
]);

function filterByText(listings, query, brand = null) {
  if (!query) return listings;
  const words = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
  if (!words.length) return listings;
  
  // If a specific brand is provided, REQUIRE it in the title
  if (brand) {
    const brandLower = brand.toLowerCase();
    const brandMatched = listings.filter(l => {
      const title = l.title.toLowerCase();
      return title.includes(brandLower);
    });
    // If we found brand matches, only return those
    if (brandMatched.length > 0) return brandMatched;
  }
  
  // Otherwise, require ALL query words to be in title or description
  const matched = listings.filter(l => {
    const hay = `${l.title} ${l.category} ${l.description}`.toLowerCase();
    return words.every(w => hay.includes(w)); // Changed from .some() to .every()
  });
  
  // Fall back to partial matches if no exact matches
  if (matched.length === 0) {
    const partialMatched = listings.filter(l => {
      const hay = `${l.title} ${l.category} ${l.description}`.toLowerCase();
      return words.some(w => hay.includes(w));
    });
    return partialMatched.length > 0 ? partialMatched : listings;
  }
  
  return matched;
}

// ── Main search ───────────────────────────────────────────────
async function searchListings({ query, category, condition, min_price, max_price, location, sort, page, verified, brand } = {}) {
  const params = { limit: 20 };
  if (category)  params.category  = category;
  if (condition) params.condition = condition;
  if (sort)      params.sort      = sort;
  if (page)      params.page      = page;

  const raw  = await apiFetch('/listings', params);
  let items  = (raw.data || []).map(mapListing).filter(l => l.title);

  // Client-side filters (API ignores most params)
  if (min_price) items = items.filter(l => l.price >= min_price);
  if (max_price) items = items.filter(l => l.price <= max_price);
  if (verified)  items = items.filter(l => l.verified);  // Filter for verified sellers
  if (location) {
    const loc = location.toLowerCase();
    const filtered = items.filter(l =>
      l.state.toLowerCase().includes(loc) || l.city.toLowerCase().includes(loc)
    );
    if (filtered.length) items = filtered; // relax location if empty
  }
  if (query) items = filterByText(items, query, brand);

  if (sort === 'price_asc')  items.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  if (sort === 'newest')     items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Enrich with real seller name + WhatsApp from detail endpoint
  // Run in parallel — all detail fetches fire at once
  items = await enrichListings(items);

  return { listings: items, total: items.length };
}

module.exports = { searchListings, sellerName };
