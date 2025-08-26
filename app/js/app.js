import { supabase, getSession, signOut, addRecord, deleteRecord, listRecords } from './database.js';
import { formatDate, formatTime, setActive, computeStats, getQuickRange } from './utils.js';

const navLogin = document.getElementById('nav-login');
const btnLogout = document.getElementById('btn-logout');

const filterQuick = document.getElementById('filter-quick');
const filterStart = document.getElementById('filter-start');
const filterEnd = document.getElementById('filter-end');
const filterType = document.getElementById('filter-type');

const qDate = document.getElementById('q-date');
const qTime = document.getElementById('q-time');
const qAmount = document.getElementById('q-amount');
const qNote = document.getElementById('q-note');

const btnExpense = document.getElementById('btn-expense');
const btnIncome = document.getElementById('btn-income');
const btnAdd = document.getElementById('btn-add');


const tbody = document.getElementById('records-body');
const statsDaily = document.getElementById('stats-daily');
const statsPeriod = document.getElementById('stats-period');

let currentType = 'income';
let currentUser = null;

function setType(type) {
  currentType = type;
  const isExpense = type === 'expense';

  if (isExpense) {
    btnExpense.classList.add('active');
    btnExpense.classList.remove('secondary');
    btnIncome.classList.remove('active');
    btnIncome.classList.add('secondary');
  } else {
    btnIncome.classList.add('active');
    btnIncome.classList.remove('secondary');
    btnExpense.classList.remove('active');
    btnExpense.classList.add('secondary');
  }

  // 可访问性状态，确保互斥
  btnExpense.setAttribute('aria-pressed', String(isExpense));
  btnIncome.setAttribute('aria-pressed', String(!isExpense));
}

function ensureTodayDefaults() {
  const today = formatDate(new Date());
  qDate.value = today;
  const range = getQuickRange('today');
  filterQuick.value = 'today';
  filterStart.value = range.start;
  filterEnd.value = range.end;
}

async function ensureAuth() {
  const session = await getSession();
  currentUser = session?.user || null;
  if (!currentUser) {
    navLogin.style.display = 'inline-flex';
    btnLogout.style.display = 'none';
  } else {
    navLogin.style.display = 'none';
    btnLogout.style.display = 'inline-flex';
  }
}

function renderStats(target, stats) {
  target.innerHTML = `
    <div>收入：<strong>￥${stats.income.toFixed(2)}</strong></div>
    <div>支出：<strong>￥${stats.expense.toFixed(2)}</strong></div>
    <div>结余：<strong>￥${stats.balance.toFixed(2)}</strong></div>
  `;
}

function renderRows(records) {
  tbody.innerHTML = '';
  for (const r of records) {
    const tr = document.createElement('tr');
    const badgeClass = r.type === 'income' ? 'badge-income' : 'badge-expense';
    tr.innerHTML = `
      <td>${r.record_date}</td>
      <td>${r.record_time || ''}</td>
      <td><span class="badge ${badgeClass}">${r.type === 'income' ? '收入' : '支出'}</span></td>
      <td>￥${Number(r.amount).toFixed(2)}</td>
      <td>${r.note || ''}</td>
      <td><button class="glass-button secondary" data-id="${r.id}">删除</button></td>
    `;
    tr.querySelector('button').addEventListener('click', async (e) => {
      try {
        await deleteRecord(r.id);
        await refresh();
      } catch (err) { alert('删除失败：' + (err.message || err)); }
    });
    tbody.appendChild(tr);
  }
}

async function refresh() {
  if (!currentUser) return;
  const params = {
    start: filterStart.value,
    end: filterEnd.value,
    type: filterType.value
  };
  const records = await listRecords(currentUser.id, params);
  renderRows(records);

  // 日统计（按 filterStart 当天）
  const daily = records.filter(r => r.record_date === filterStart.value);
  renderStats(statsDaily, computeStats(daily));
  // 区间统计
  renderStats(statsPeriod, computeStats(records));


}

btnLogout.addEventListener('click', async () => {
  await signOut();
  currentUser = null;
  await ensureAuth();
});

btnExpense.addEventListener('click', () => setType('expense'));
btnIncome.addEventListener('click', () => setType('income'));

btnAdd.addEventListener('click', async () => {
  try {
    if (!currentUser) return alert('请先登录');
    const record = {
      user_id: currentUser.id,
      type: currentType,
      amount: Number(qAmount.value || 0),
      record_date: qDate.value,
      record_time: qTime.value || null,
      note: qNote.value || null
    };
    if (!record.record_date || !record.amount || record.amount <= 0) return alert('请填写日期与正数金额');
    await addRecord(record);
    qAmount.value = '';
    qNote.value = '';
    await refresh();
  } catch (e) {
    alert('添加失败：' + (e.message || e));
  }
});

filterQuick.addEventListener('change', () => {
  const { start, end } = getQuickRange(filterQuick.value);
  filterStart.value = start; filterEnd.value = end; refresh();
});

[filterStart, filterEnd, filterType].forEach(el => el.addEventListener('change', refresh));

(async function init() {
  setType('income');
  ensureTodayDefaults();
  await ensureAuth();
  await refresh();

  supabase.auth.onAuthStateChange(async () => {
    await ensureAuth();
    await refresh();
  });
})();
