# 智能记账账本（前端应用）

## 运行

1. 在 `js/config.js` 中填入 Supabase 配置：
```js
export const SUPABASE_URL = 'your_supabase_url'
export const SUPABASE_ANON_KEY = 'your_supabase_anon_key'
```
2. 启动本地静态服务器并访问 `app/index.html`：
```bash
python -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 数据库（Supabase）

```sql
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('income','expense')),
  amount numeric(10,2) not null,
  record_date date not null,
  record_time time,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table records enable row level security;

create policy "records_select_own" on records for select using (auth.uid() = user_id);
create policy "records_insert_own" on records for insert with check (auth.uid() = user_id);
create policy "records_delete_own" on records for delete using (auth.uid() = user_id);
```

## 功能
- 手机号 OTP 登录
- 快速记账（日期、类型二选一、金额、备注、可选时间）
- 全局筛选（日期区间、类型；含“今日/周/月/季/年/自定义”快捷）
- 日统计、区间统计（收入/支出/结余）
- 记录列表、删除
- 已取消：CSV 导出

## 部署（Vercel）
- 部署目录选择 `app/`
- 本项目在浏览器端读取 `js/config.js`，无需构建注入。
- 如需隐藏密钥，请改造为服务端代理方案。
