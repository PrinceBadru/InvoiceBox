// ── Seed Data Generator for InvoiceBox ───────────────────────────────────────
// Generates: 412 providers, 176 purchasers, 1 admin, 12,719 invoices

const RNG = (() => {
  let seed = 42;
  return {
    next: () => { seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF; return (seed >>> 0) / 0xFFFFFFFF; },
    int: (min, max) => { const r = RNG.next(); return Math.floor(r * (max - min + 1)) + min; },
    pick: (arr) => arr[RNG.int(0, arr.length - 1)],
    pickN: (arr, n) => { const s = [...arr]; const r = []; for (let i = 0; i < n && s.length; i++) { const idx = RNG.int(0, s.length - 1); r.push(s.splice(idx, 1)[0]); } return r; },
    bool: (p = 0.5) => RNG.next() < p,
  };
})();

export const CATEGORIES = [
  'Fresh produce','Dry goods','Livestock','Dairy products','Fishery products',
  'IT equipment','Software licensing','Telecommunications','Electronics','Office equipment',
  'Freight & haulage','Warehouse storage','Vehicle hire','Fuel supply','Courier services',
  'Construction materials','Electrical supplies','Plumbing & sanitation','Hardware tools','Painting & finishes',
  'Consulting services','Legal services','Accounting & audit','Training & workshops','Marketing & advertising',
  'Medical supplies','Pharmaceutical goods','Laboratory equipment','Cleaning & hygiene','PPE & safety gear',
  'Office furniture','Stationery & printing','Uniforms & clothing','Security services','Catering & hospitality',
  'Agricultural inputs','Veterinary supplies','Irrigation equipment','Seed & fertiliser','Pest control',
  'Engineering services','Survey & mapping','Architecture & design','Environmental services','Research services',
  'Solar & renewable energy','Generator & power backup','Water treatment','Waste management','Financial services',
];

export const CURRENCIES = ['UGX', 'USD', 'LYD'];

const CURRENCY_WEIGHTS = [0.60, 0.32, 0.08];

function pickCurrency() {
  const r = RNG.next();
  let cum = 0;
  for (let i = 0; i < CURRENCIES.length; i++) {
    cum += CURRENCY_WEIGHTS[i];
    if (r < cum) return CURRENCIES[i];
  }
  return 'UGX';
}

const ugandanOrgs = [
  'Kampala','Entebbe','Jinja','Mbarara','Gulu','Lira','Mbale','Fort Portal','Arua','Soroti',
  'Masaka','Kabale','Tororo','Iganga','Hoima','Kasese','Mukono','Wakiso','Ntungamo','Bushenyi',
];
const ugandanSectors = [
  'Trading Ltd','Enterprises','Supplies Co','Solutions','Services','Group','Holdings','International',
  'Associates','Contractors','Investments','Industries','Technologies','Logistics','Ventures',
];
const ugandanFirst = [
  'Moses','Sarah','John','Grace','David','Mary','Peter','Joyce','Emmanuel','Beatrice',
  'Richard','Esther','Samuel','Agnes','Robert','Harriet','George','Immaculate','Charles','Prossy',
  'Patrick','Lydia','Daniel','Judith','Michael','Rose','Paul','Irene','James','Doreen',
  'Francis','Winnie','Joseph','Annet','Henry','Violet','Alex','Margret','Ivan','Flavia',
];
const ugandanLast = [
  'Mukasa','Nakato','Opio','Auma','Ssekandi','Nantongo','Okello','Namubiru','Kato','Namutebi',
  'Mugisha','Nassuna','Byaruhanga','Nakigozi','Tumwebaze','Nakintu','Atuhaire','Nakiganda','Ssali','Tendo',
  'Musisi','Nalwoga','Kamau','Zawedde','Otim','Namugga','Rwabwogo','Nakabugo','Ayebale','Nalubega',
];
const libyanFirst = [
  'Ahmed','Fatima','Mohammed','Khadija','Omar','Aisha','Ali','Mariam','Hassan','Zainab',
  'Khalid','Salma','Ibrahim','Nour','Yusuf','Huda','Mustafa','Layla','Tariq','Amira',
];
const libyanLast = [
  'Al-Mansouri','Al-Trabelsi','Ben Ali','Al-Warfalli','Al-Misrati','Al-Zawawi','Ben Hamid',
  'Al-Qaddafi','Al-Shaibani','Ben Younes',
];

function ugOrgName() {
  return `${RNG.pick(ugandanOrgs)} ${RNG.pick(ugandanSectors)}`;
}
function lyOrgName() {
  const fn = RNG.pick(libyanFirst);
  const ln = RNG.pick(libyanLast);
  return `${fn} ${ln} Trading`;
}
function ugPersonName() {
  return `${RNG.pick(ugandanFirst)} ${RNG.pick(ugandanLast)}`;
}
function ugEmail(name, id, role) {
  const slug = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
  return `${slug}${id}@${role === 'provider' ? 'provider' : 'purchaser'}.invoicebox.ug`;
}
function ugPhone() {
  const prefixes = ['0700','0701','0702','0703','0770','0772','0752','0753','0755'];
  return `${RNG.pick(prefixes)} ${RNG.int(100,999)} ${RNG.int(100,999)}`;
}

function randomDate(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + RNG.next() * (e - s)).toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Generate Users ────────────────────────────────────────────────────────────
export function generateUsers() {
  const users = [];

  // Admin
  users.push({
    id: 'u-admin',
    name: 'Platform Administrator',
    email: 'admin@invoicebox.ug',
    password: 'Admin@2024',
    role: 'admin',
    phone: '+256 700 000 001',
    joined: '2018-01-01',
    status: 'active',
    avatar: 'PA',
  });

  // 412 Providers
  for (let i = 1; i <= 412; i++) {
    const isOrg = RNG.bool(0.75);
    const isLibyan = RNG.bool(0.04);
    const name = isLibyan ? lyOrgName() : (isOrg ? ugOrgName() : ugPersonName());
    const id = `u-p${i}`;
    users.push({
      id,
      name,
      email: ugEmail(name, i, 'provider'),
      password: 'pass1234',
      role: 'provider',
      phone: ugPhone(),
      joined: randomDate('2018-01-01', '2024-06-01'),
      status: RNG.bool(0.93) ? 'active' : 'suspended',
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      categories: RNG.pickN(CATEGORIES, RNG.int(1, 5)),
      defaultCurrency: pickCurrency(),
    });
  }

  // 176 Purchasers
  const knownPurchasers = [
    'Makerere University','Kampala Capital City Authority','Uganda Revenue Authority',
    'Stanbic Bank Uganda','Centenary Bank','dfcu Bank',
    'National Water & Sewerage Corporation','Uganda Electricity Transmission Co',
    'Aga Khan Hospital Kampala','Mulago National Referral Hospital',
    'Equity Bank Uganda','Housing Finance Bank',
    'MTN Uganda','Airtel Uganda',
    'Uganda National Roads Authority','Civil Aviation Authority Uganda',
    'New Vision Printing & Publishing','Monitor Publications',
    'Nile Breweries Ltd','Uganda Breweries Ltd',
    'Bidco Uganda Ltd','Crown Beverages Ltd',
    'Roofings Rolling Mills','Steel & Tube Industries',
    'Uganda Clays Ltd','Hima Cement Ltd',
  ];
  for (let i = 1; i <= 176; i++) {
    const name = i <= knownPurchasers.length ? knownPurchasers[i - 1] : ugOrgName();
    const id = `u-b${i}`;
    users.push({
      id,
      name,
      email: ugEmail(name, i, 'purchaser'),
      password: 'pass1234',
      role: 'purchaser',
      phone: ugPhone(),
      joined: randomDate('2018-01-01', '2024-06-01'),
      status: RNG.bool(0.95) ? 'active' : 'suspended',
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });
  }

  return users;
}

// ── Generate Invoices ─────────────────────────────────────────────────────────
const STATUS_WEIGHTS = [
  { status: 'PAID',           w: 0.38 },
  { status: 'PENDING',        w: 0.20 },
  { status: 'ACKNOWLEDGED',   w: 0.12 },
  { status: 'PARTIALLY PAID', w: 0.13 },
  { status: 'DEFAULTED',      w: 0.07 },
  { status: 'DRAFT',          w: 0.06 },
  { status: 'CANCELLED',      w: 0.04 },
];

function pickStatus() {
  const r = RNG.next();
  let cum = 0;
  for (const s of STATUS_WEIGHTS) { cum += s.w; if (r < cum) return s.status; }
  return 'PAID';
}

function unitPrice(category, currency) {
  const ranges = {
    'Fresh produce':        [500,    8000],
    'Dry goods':            [2000,   25000],
    'Livestock':            [150000, 2000000],
    'IT equipment':         [50000,  5000000],
    'Software licensing':   [100,    5000],
    'Freight & haulage':    [200000, 3000000],
    'Construction materials':[5000,  500000],
    'Consulting services':  [50,     500],
    'Medical supplies':     [1000,   500000],
    'Fuel supply':          [5000,   20000],
  };
  const [lo, hi] = ranges[category] || [10000, 500000];
  const val = lo + RNG.next() * (hi - lo);
  if (currency === 'USD' || currency === 'LYD') return parseFloat((val / 3700).toFixed(2));
  return Math.round(val);
}

export function generateInvoices(users) {
  const providers  = users.filter(u => u.role === 'provider');
  const purchasers = users.filter(u => u.role === 'purchaser');
  const invoices   = [];

  for (let i = 1; i <= 12719; i++) {
    const provider  = RNG.pick(providers);
    const purchaser = RNG.pick(purchasers);
    const currency  = provider.defaultCurrency || pickCurrency();
    const issueDate = randomDate('2018-01-01', '2024-12-01');
    const dueDate   = addDays(issueDate, RNG.int(14, 90));
    const status    = pickStatus();

    const numItems  = RNG.int(1, 6);
    const items     = [];
    for (let j = 0; j < numItems; j++) {
      const category = RNG.pick(provider.categories || CATEGORIES);
      const qty      = RNG.int(1, 200);
      const unit     = unitPrice(category, currency);
      items.push({
        id:       `item-${i}-${j}`,
        desc:     `${category} supply — batch ${RNG.int(100,999)}`,
        category,
        qty,
        unit,
        total:    parseFloat((qty * unit).toFixed(2)),
      });
    }

    const total = parseFloat(items.reduce((s, it) => s + it.total, 0).toFixed(2));

    // Generate payments
    const payments = [];
    if (['PAID','PARTIALLY PAID'].includes(status)) {
      const numPay = status === 'PAID' ? RNG.int(1, 3) : RNG.int(1, 2);
      let remaining = total;
      for (let p = 0; p < numPay; p++) {
        const isLast  = p === numPay - 1 && status === 'PAID';
        const amount  = isLast ? remaining : parseFloat((remaining * (0.3 + RNG.next() * 0.5)).toFixed(2));
        remaining -= amount;
        payments.push({
          id:     `pay-${i}-${p}`,
          date:   addDays(issueDate, RNG.int(3, 60)),
          amount: parseFloat(amount.toFixed(2)),
          method: RNG.pick(['Bank transfer','Wire transfer','Mobile money','Cheque','Cash']),
          ref:    `REF${RNG.int(100000, 999999)}`,
        });
      }
    }

    const paid    = parseFloat(payments.reduce((s, p) => s + p.amount, 0).toFixed(2));
    const balance = parseFloat((total - paid).toFixed(2));

    invoices.push({
      id:          `INV-${String(i).padStart(5, '0')}`,
      ref:         `IB-${issueDate.slice(0,4)}-${String(i).padStart(5,'0')}`,
      providerId:  provider.id,
      purchaserId: purchaser.id,
      issueDate,
      dueDate,
      currency,
      status,
      items,
      payments,
      total,
      paid,
      balance,
      defaultReason: status === 'DEFAULTED' ? RNG.pick([
        'Budget allocation delayed to next financial year.',
        'Disputed quantity — awaiting verification from procurement team.',
        'Company under financial restructuring.',
        'Invoice not approved by board — pending re-evaluation.',
        'Project cancelled before completion of delivery.',
        'Funds released to incorrect account — reconciliation in progress.',
      ]) : null,
    });
  }

  return invoices;
}

// ── Generate Notifications ────────────────────────────────────────────────────
export function generateNotifications(users, invoices) {
  const notifications = [];
  const sample = invoices.slice(0, 800);

  sample.forEach((inv, idx) => {
    const events = [];

    if (inv.status !== 'DRAFT') {
      events.push({ type: 'assigned', userId: inv.purchaserId, msg: `New invoice ${inv.ref} assigned to you`, time: inv.issueDate });
      events.push({ type: 'assigned', userId: inv.providerId,  msg: `Invoice ${inv.ref} sent to purchaser`, time: inv.issueDate });
    }
    if (['ACKNOWLEDGED','PARTIALLY PAID','PAID','DEFAULTED'].includes(inv.status)) {
      events.push({ type: 'acknowledged', userId: inv.providerId, msg: `${inv.ref} acknowledged by purchaser`, time: addDays(inv.issueDate, 2) });
    }
    if (['PAID','PARTIALLY PAID'].includes(inv.status)) {
      inv.payments.forEach(p => {
        events.push({ type: 'payment', userId: inv.providerId, msg: `Payment received on ${inv.ref}: ${p.amount.toLocaleString()} ${inv.currency}`, time: p.date });
        events.push({ type: 'payment', userId: inv.purchaserId, msg: `Payment recorded on ${inv.ref}`, time: p.date });
      });
    }
    if (inv.status === 'DEFAULTED') {
      events.push({ type: 'default', userId: inv.providerId, msg: `Invoice ${inv.ref} has been defaulted by purchaser`, time: addDays(inv.issueDate, 10) });
    }

    events.forEach((e, eidx) => {
      notifications.push({
        id:     `notif-${idx}-${eidx}`,
        userId:  e.userId,
        type:    e.type,
        message: e.msg,
        time:    e.time,
        read:    RNG.bool(0.55),
        invoiceId: inv.id,
      });
    });
  });

  return notifications;
}

// ── Export single seeded dataset ──────────────────────────────────────────────
let _cache = null;
export function getSeedData() {
  if (_cache) return _cache;
  const users         = generateUsers();
  const invoices      = generateInvoices(users);
  const notifications = generateNotifications(users, invoices);
  _cache = { users, invoices, notifications };
  return _cache;
}
