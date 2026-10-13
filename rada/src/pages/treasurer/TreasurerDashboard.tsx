import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Upload, Coins, CreditCard, FileText, Landmark, ArrowRight,
  TrendingUp, TrendingDown, Bell, Calendar, Wallet,
  ArrowUpRight, ArrowDownRight, Receipt, MoreHorizontal,
} from 'lucide-react';
import { mockTreasurer, mockAdmin } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import { Card, LoadingState, ErrorState } from '@/components/ui';
import { formatCurrency, initials, classNames } from '@/lib/format';
import { LineChart, DonutChart } from '@/components/Charts';
import { useAuth } from '@/auth/AuthContext';
import type { Contribution, BankTransaction } from '@/types';

const AVATAR_COLORS = [
  'bg-primary-500', 'bg-success-500', 'bg-accent-500',
  'bg-secondary-500', 'bg-error-400',
];

function MemberAvatar({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <div className={classNames(
      'w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-white',
      AVATAR_COLORS[index % AVATAR_COLORS.length],
    )}>
      {initials(name)}
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: 'Bank Import',     icon: Upload,     to: '/treasurer/bank-statement-import', accent: 'bg-success-50 text-success-600' },
  { label: 'Record Contrib.', icon: Coins,      to: '/treasurer/contributions',          accent: 'bg-primary-50 text-primary-600' },
  { label: 'Approve Payout',  icon: CreditCard, to: '/treasurer/withdrawal-approvals',   accent: 'bg-secondary-50 text-secondary-600' },
  { label: 'New Expense',     icon: Receipt,    to: '/treasurer/expenses',               accent: 'bg-error-50 text-error-500' },
  { label: 'Generate Report', icon: FileText,   to: '/treasurer/reports',                accent: 'bg-accent-50 text-accent-600' },
  { label: 'Bank Statement',  icon: Landmark,   to: '/treasurer/bank-statement',         accent: 'bg-neutral-100 text-neutral-500' },
];

const ACTIVITY_ITEMS = [
  { icon: Coins,      text: 'Contribution received',          detail: 'KSh 300 from Jane Wanjiku via M-Pesa',     time: '2 min ago',   color: 'bg-success-50 text-success-600' },
  { icon: CreditCard, text: 'Payment processed',              detail: 'KSh 600 to Mary Atieno — funeral payout', time: '12 min ago',  color: 'bg-secondary-50 text-secondary-600' },
  { icon: Landmark,   text: 'Bank statement synced',          detail: 'CB1179432 — 24 transactions imported',    time: '18 min ago',  color: 'bg-accent-50 text-accent-600' },
  { icon: TrendingUp, text: 'Member registered',              detail: 'George Mwangi joined the welfare',         time: '32 min ago',  color: 'bg-primary-50 text-primary-600' },
  { icon: TrendingDown, text: 'Funeral payout disbursed',     detail: 'KSh 50,000 to family of M. Njeri',        time: '1 hr ago',    color: 'bg-error-50 text-error-500' },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 80; const h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TreasurerDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.treasurerDashboard,
    queryFn: () => mockTreasurer.dashboard(),
  });

  const { data: contribData } = useQuery({
    queryKey: queryKeys.adminContributions({ page: 1, status: '' }),
    queryFn: () => mockAdmin.getContributions({ page: 1 }),
  });

  const { data: bankData } = useQuery({
    queryKey: queryKeys.treasurerBankStatement(1),
    queryFn: () => mockTreasurer.getBankStatement(1),
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Failed to load dashboard" onRetry={refetch} />;

  const s = stats!;
  const recentContribs: Contribution[] = contribData?.data ?? [];
  const bankTxns: BankTransaction[] = bankData?.data ?? [];
  const totalContribs = s.contributions_balance;
  const totalPayments = Math.round(totalContribs * 0.707);
  const bankBalance = s.bank_balance;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-KE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });

  const trend = s.monthly_contributions ?? [];
  const payTrend = trend.map(t => ({ label: t.month, value: Math.round(t.amount * 0.707) }));
  const sparkData = trend.map(t => t.amount);

  const monthlyAmt = Math.round(totalContribs * 0.84);
  const twoMonthAmt = Math.round(totalContribs * 0.11);
  const twelveMonthAmt = totalContribs - monthlyAmt - twoMonthAmt;

  const banks = [
    { name: 'Co-op Bank Kenya', number: '0110 1234 5678', balance: bankBalance, credits: totalContribs, debits: totalPayments, status: 'active' as const },
    { name: 'Equity Bank', number: '0123 4567 8901', balance: 0, credits: 0, debits: 0, status: 'inactive' as const },
  ];

  const adminTotalMembers = 512;

  const kpis = [
    { label: 'Total Members',       value: adminTotalMembers.toLocaleString(), delta: '+2.4%', positive: true,  icon: TrendingUp, accent: 'bg-primary-50 text-primary-600', spark: sparkData },
    { label: 'Contributions',       value: formatCurrency(totalContribs),      delta: '+18%',  positive: true,  icon: Coins,      accent: 'bg-success-50 text-success-600', spark: sparkData },
    { label: 'Payments Processed',  value: formatCurrency(totalPayments),      delta: '+22%',  positive: true,  icon: CreditCard, accent: 'bg-secondary-50 text-secondary-600', spark: payTrend.map(p => p.value) },
    { label: 'Bank Balance',        value: formatCurrency(bankBalance),        delta: 'Stable',positive: true,  icon: Landmark,   accent: 'bg-accent-50 text-accent-600', spark: [6.5, 6.7, 6.8, 6.9, 6.9, 6.92].map(v => v * 1_000_000) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Treasurer Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {dateStr} · {timeStr} · {monthStart} – {monthEnd}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
            <Bell size={18} className="text-neutral-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
              {initials(user?.name ?? 'TR')}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-neutral-800">{user?.name ?? 'Treasurer'}</p>
              <p className="text-xs text-neutral-400">Treasurer · KHWWC</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KPI ROW ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(c => (
          <div key={c.label} className="group relative bg-white rounded-n26-card border border-neutral-100 p-5 transition-all hover:shadow-float hover:border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className={classNames('w-10 h-10 rounded-xl flex items-center justify-center', c.accent)}>
                <c.icon size={20} />
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkline data={c.spark} color={c.positive ? '#22c55e' : '#ef4444'} />
                <span className={classNames(
                  'flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5',
                  c.positive ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700',
                )}>
                  {c.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {c.delta}
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 tracking-tight">{c.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ CHARTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart — 2 cols */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Contributions vs Payments</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Monthly comparison — last 6 months</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-full bg-success-500" /> Contributions
              </span>
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-500" /> Payments
              </span>
            </div>
          </div>
          <LineChart
            series={[
              { label: 'Contributions', color: '#088177', points: trend.map(t => ({ label: t.month, value: t.amount })) },
              { label: 'Payments', color: '#4881c0', points: payTrend },
            ]}
            height={220}
          />
        </Card>

        {/* Donut — contribution breakdown */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-neutral-900 mb-1">Contribution Mix</h3>
          <p className="text-xs text-neutral-400 mb-4">By payment frequency type</p>
          <div className="flex flex-col items-center">
            <DonutChart
              segments={[
                { label: 'Monthly', value: monthlyAmt, color: '#088177' },
                { label: 'Bi-monthly', value: twoMonthAmt, color: '#4881c0' },
                { label: 'Annual', value: twelveMonthAmt, color: '#f59e0b' },
              ]}
              centerLabel={formatCurrency(totalContribs).replace('KES ', 'KSh ')}
              centerSub="Total"
            />
            <div className="w-full mt-5 space-y-2.5">
              {[
                { label: 'Monthly (84%)', value: monthlyAmt, color: 'bg-primary-500' },
                { label: 'Bi-monthly (11%)', value: twoMonthAmt, color: 'bg-secondary-500' },
                { label: 'Annual (5%)', value: twelveMonthAmt, color: 'bg-accent-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={classNames('w-2.5 h-2.5 rounded-full', item.color)} />
                    <span className="text-sm text-neutral-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ QUICK ACTIONS + ACTIVITY ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-base font-bold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(a => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex flex-col items-start gap-2 p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-float transition-all"
              >
                <div className={classNames('w-9 h-9 rounded-lg flex items-center justify-center', a.accent)}>
                  <a.icon size={17} />
                </div>
                <span className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900">{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900">Recent Activity</h3>
            <Link to="/super-admin/audit-logs" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {ACTIVITY_ITEMS.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className={classNames('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', a.color)}>
                  <a.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800">{a.text}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{a.detail}</p>
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ RECENT CONTRIBUTIONS ═══ */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-neutral-900">Recent Contributions</h3>
          <Link to="/treasurer/contributions" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-1">
          {recentContribs.slice(0, 5).map((c: Contribution, i: number) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
              <MemberAvatar name={c.member_name ?? ''} index={i} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800 truncate">{c.member_name}</p>
                <p className="text-xs text-neutral-400">{c.method} · {new Date(c.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-neutral-900">{formatCurrency(c.amount)}</p>
                <span className={classNames(
                  'inline-block text-xs font-medium mt-0.5',
                  c.status === 'confirmed' ? 'text-success-600' : c.status === 'pending' ? 'text-warning-600' : 'text-error-600',
                )}>
                  {c.status === 'confirmed' ? 'Completed' : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══ BANK ACCOUNTS + TRANSACTIONS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bank accounts — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">Bank Accounts</h3>
            <Link to="/treasurer/bank-statement" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {banks.map((b, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={classNames(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    b.status === 'active' ? 'bg-primary-50' : 'bg-neutral-100',
                  )}>
                    <Landmark size={20} className={b.status === 'active' ? 'text-primary-600' : 'text-neutral-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800">{b.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{b.number}</p>
                  </div>
                </div>
                <span className={classNames(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  b.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500',
                )}>
                  <span className={classNames('w-1.5 h-1.5 rounded-full', b.status === 'active' ? 'bg-success-500' : 'bg-neutral-300')} />
                  {b.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">{formatCurrency(b.balance)}</p>
              <p className="text-xs text-neutral-400 mt-0.5 mb-4">Available Balance</p>
              {b.status === 'active' && (
                <div className="flex gap-6 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-success-50 flex items-center justify-center">
                      <ArrowUpRight size={14} className="text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{formatCurrency(b.credits)}</p>
                      <p className="text-xs text-neutral-400">Credits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-error-50 flex items-center justify-center">
                      <ArrowDownRight size={14} className="text-error-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{formatCurrency(b.debits)}</p>
                      <p className="text-xs text-neutral-400">Debits</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bank transactions — 3 cols */}
        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-neutral-900">Recent Bank Transactions</h3>
            <Link to="/treasurer/bank-statement" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['Date', 'Description', 'Type', 'Amount', 'Balance'].map((h, i) => (
                    <th key={h} className={classNames(
                      'text-left py-3 px-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider',
                      i >= 3 && 'text-right',
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {bankTxns.slice(0, 5).map((t: BankTransaction) => {
                  const runBal = bankBalance - (t.type === 'debit' ? t.amount : -t.amount);
                  return (
                    <tr key={t.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-2 text-sm text-neutral-500 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3.5 px-2">
                        <p className="text-sm font-medium text-neutral-800 max-w-[160px] truncate">{t.description}</p>
                        <p className="text-xs text-neutral-400 font-mono">{t.reference}</p>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={classNames(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          t.type === 'credit' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700',
                        )}>
                          {t.type === 'credit' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                          {t.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className={classNames(
                        'py-3.5 px-2 text-right text-sm font-semibold whitespace-nowrap',
                        t.type === 'credit' ? 'text-success-700' : 'text-error-600',
                      )}>
                        {t.type === 'debit' ? '−' : '+'}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-3.5 px-2 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                        {formatCurrency(Math.abs(runBal))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ═══ PROMO BANNER ═══ */}
      <div className="relative overflow-hidden rounded-n26-card bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-900 p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Treasurer Suite</p>
            <h2 className="text-xl font-bold text-white leading-tight">Accurate records.</h2>
            <h2 className="text-xl font-bold text-success-400 leading-tight">Better welfare.</h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-md">Manage contributions, payments, bank reconciliation and financial statements with full confidence.</p>
          </div>
          <Link
            to="/treasurer/reports"
            className="flex items-center gap-2 px-5 py-3 bg-white text-neutral-900 text-sm font-semibold rounded-n26-btn hover:bg-neutral-100 whitespace-nowrap flex-shrink-0 transition-colors"
          >
            <FileText size={16} />
            Generate Statement
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-500/10" />
        <div className="absolute -right-6 top-12 w-32 h-32 rounded-full bg-success-500/10" />
        <div className="absolute right-20 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
      </div>
    </div>
  );
}
