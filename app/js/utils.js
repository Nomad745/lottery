export function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function csvFromRecords(records) {
  const header = ['date','time','type','amount','note'];
  const lines = records.map(r => [r.record_date, r.record_time || '', r.type, r.amount, (r.note||'').replace(/\n/g,' ')].join(','));
  return [header.join(','), ...lines].join('\n');
}

export function setActive(btn, groupSelector) {
  document.querySelectorAll(groupSelector).forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

export function computeStats(records) {
  let income = 0, expense = 0;
  for (const r of records) {
    const amt = Number(r.amount) || 0;
    if (r.type === 'income') income += amt; else if (r.type === 'expense') expense += amt;
  }
  return { income, expense, balance: income - expense };
}

export function getQuickRange(range) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  const firstDayOfWeek = (d) => {
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    const res = new Date(d);
    res.setDate(d.getDate() - diff);
    return res;
  };

  if (range === 'today') {
    return { start: formatDate(now), end: formatDate(now) };
  } else if (range === 'week') {
    const s = firstDayOfWeek(now);
    return { start: formatDate(s), end: formatDate(now) };
  } else if (range === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: formatDate(s), end: formatDate(now) };
  } else if (range === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const s = new Date(now.getFullYear(), q * 3, 1);
    return { start: formatDate(s), end: formatDate(now) };
  } else if (range === 'year') {
    const s = new Date(now.getFullYear(), 0, 1);
    return { start: formatDate(s), end: formatDate(now) };
  }
  return { start: formatDate(start), end: formatDate(end) };
}
