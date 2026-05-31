/* =============================================
   CryptoView — Main Application Logic
   ============================================= */

// Prices cache (populated after fetch)
const PRICES_USD = { btc:0, eth:0, usdt:1, bnb:0, sol:0, xrp:0 };
const FIAT_RATES  = { usd:1, eur:0.92, rub:87.5, gbp:0.79, jpy:149.5 };

/* ── SESSION CACHE (60 сек) ── */
const CACHE_TTL = 60 * 1000;
const _cache = {};

function cacheGet(key){
  const entry = _cache[key];
  if(!entry) return null;
  if(Date.now() - entry.ts > CACHE_TTL) return null;
  return entry.data;
}

function cacheSet(key, data){
  _cache[key] = { ts: Date.now(), data };
}

/* ── LOCAL ICONS ── */
// Монеты с локальными иконками в папке img/
const LOCAL_ICONS = new Set([
  'bitcoin','ethereum','tether','binancecoin','solana',
  'ripple','dogecoin','cardano','avalanche-2','chainlink',
  'usd-coin','polkadot','litecoin','tron','shiba-inu',
  'the-open-network','the-graph','wrapped-bitcoin'
]);

function coinImgHtml(coinId, apiFallback, name, size=28){
  const src = LOCAL_ICONS.has(coinId)
    ? `img/${coinId}.png`
    : (apiFallback || '');
  if(src) return `<img src="${src}" width="${size}" height="${size}" style="border-radius:50%;vertical-align:middle;display:block" alt="${name}" onerror="this.src='${apiFallback||''}';this.onerror=null">`;
  return `<span style="font-size:${size*0.6}px;line-height:${size}px">◆</span>`;
}

/* ── FORMATTERS ── */
function fmt(n, dec=2){
  if(n===undefined||n===null) return '—';
  if(Math.abs(n)>=1e12) return (n/1e12).toFixed(2)+'T';
  if(Math.abs(n)>=1e9)  return (n/1e9).toFixed(2)+'B';
  if(Math.abs(n)>=1e6)  return (n/1e6).toFixed(2)+'M';
  if(Math.abs(n)>=1e3)  return n.toLocaleString('ru-RU',{maximumFractionDigits:2});
  return n.toFixed(dec);
}

function fmtPrice(p){
  if(!p) return '—';
  if(p<0.01)   return '$'+p.toFixed(6);
  if(p<1)      return '$'+p.toFixed(4);
  if(p<1000)   return '$'+p.toFixed(2);
  return '$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function pctHtml(n){
  if(n===undefined||n===null) return '—';
  const cls = n>=0?'up':'down';
  return `<span class="${cls}">${n>=0?'+':''}${n.toFixed(2)}%</span>`;
}

/* ── TICKER ── */
function buildTicker(coins){
  const items = [...coins,...coins].map(c=>{
    const p = c.price_change_percentage_24h;
    const cl = p>=0?'var(--green)':'var(--red)';
    const src = LOCAL_ICONS.has(c.id) ? `img/${c.id}.png` : (c.image||'');
    const img = src ? `<img src="${src}" width="16" height="16" style="border-radius:50%;vertical-align:middle" alt="${c.name}" onerror="this.src='${c.image||''}';this.onerror=null">` : '◆';
    return `<span class="ticker-item">${img} <b>${c.symbol.toUpperCase()}</b> ${fmtPrice(c.current_price)} <span style="color:${cl}">${p>=0?'+':''}${p?.toFixed(2)||0}%</span></span>`;
  }).join('');
  const el = document.getElementById('ticker');
  if(el) el.innerHTML = items;
}

/* ── MARKET API (с кэшем) ── */
async function fetchMarket(force=false){
  const key = 'market';
  if(!force){
    const cached = cacheGet(key);
    if(cached) return cached;
  }
  const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d');
  if(!r.ok) throw new Error('API error '+r.status);
  const data = await r.json();
  cacheSet(key, data);
  return data;
}

async function fetchGlobal(force=false){
  const key = 'global';
  if(!force){
    const cached = cacheGet(key);
    if(cached) return cached;
  }
  const r = await fetch('https://api.coingecko.com/api/v3/global');
  if(!r.ok) throw new Error('API error '+r.status);
  const data = await r.json();
  cacheSet(key, data);
  return data;
}

async function fetchChart(id, days, force=false){
  const key = `chart_${id}_${days}`;
  if(!force){
    const cached = cacheGet(key);
    if(cached) return cached;
  }
  const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
  if(!r.ok) throw new Error('API error '+r.status);
  const data = await r.json();
  cacheSet(key, data);
  return data;
}

/* ── PRICE CACHE UPDATE ── */
function updatePriceCache(coins){
  ['btc','eth','bnb','sol','xrp'].forEach(sym=>{
    const c = coins.find(x=>x.symbol===sym);
    if(c) PRICES_USD[sym] = c.current_price;
  });
}

/* ── CONVERTER LOGIC ── */
function calcConvert(){
  const amountEl = document.getElementById('conv-amount');
  const fromEl   = document.getElementById('conv-from');
  const toEl     = document.getElementById('conv-to');
  const resultEl = document.getElementById('conv-result');
  const labelEl  = document.getElementById('conv-result-label');
  if(!amountEl||!fromEl||!toEl||!resultEl) return;

  const amount  = parseFloat(amountEl.value)||0;
  const from    = fromEl.value;
  const to      = toEl.value;
  const fromUSD = PRICES_USD[from]||1;

  let result;
  if(FIAT_RATES[to]){
    result = amount * fromUSD * FIAT_RATES[to];
  } else {
    result = amount * fromUSD / (PRICES_USD[to]||1);
  }

  const syms = {usd:'$',eur:'€',rub:'₽',gbp:'£',jpy:'¥'};
  const prefix = syms[to]||'';
  let display;
  if(result>1000)     display = prefix+result.toLocaleString('en-US',{maximumFractionDigits:2});
  else if(result>1)   display = prefix+result.toFixed(4);
  else                display = prefix+result.toFixed(8);

  resultEl.textContent = display||'—';
  if(labelEl) labelEl.textContent = `${amount} ${from.toUpperCase()} =`;
}

function swapCurrencies(){
  const fromEl = document.getElementById('conv-from');
  const toEl   = document.getElementById('conv-to');
  const fromVal = fromEl.value;
  const toOpts  = Array.from(toEl.options).map(o=>o.value);
  if(toOpts.includes(fromVal)){
    const toVal   = toEl.value;
    const fromOpts = Array.from(fromEl.options).map(o=>o.value);
    if(fromOpts.includes(toVal)){
      fromEl.value = toVal;
      toEl.value   = fromVal;
      calcConvert();
    }
  }
}

function updateConverterRates(){
  const el = document.getElementById('conv-rates-list');
  if(!el) return;
  const rows = [
    {sym:'BTC', label:'Bitcoin',      key:'btc'},
    {sym:'ETH', label:'Ethereum',     key:'eth'},
    {sym:'BNB', label:'Binance Coin', key:'bnb'},
    {sym:'SOL', label:'Solana',       key:'sol'},
  ];
  el.innerHTML = rows.map(r=>`
    <div class="conv-rate-row">
      <span style="color:var(--muted)">${r.sym} <small>${r.label}</small></span>
      <span class="num-mono">$${PRICES_USD[r.key]?PRICES_USD[r.key].toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}</span>
    </div>`).join('');
}
