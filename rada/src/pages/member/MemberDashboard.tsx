import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, BarChart3, Bell, Check, CreditCard, Download,
  FileText, HeartHandshake, History, Landmark, PiggyBank, ShieldCheck,
  User, WalletCards,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import { ErrorState, LoadingState } from '@/components/ui';
import { PaymentModal } from '@/components/PaymentModal';
import { formatCurrency } from '@/lib/format';

const MONTHLY_CONTRIBUTION = 2000;
const BANK_DETAILS = { account: 'KHWWC Welfare', accountNo: '0123 4567 8901', paybill: '522522', reference: 'CONTRIBUTION' };

const shortcuts = [
  { label: 'Contributions', path: '/member/downloads', icon: PiggyBank },
  { label: 'Penalties', path: '/member/pay-penalty', icon: ShieldCheck },
  { label: 'Welfare', path: '/member/donate', icon: HeartHandshake },
  { label: 'Fund Drive', path: '/member/donate', icon: WalletCards },
  { label: 'Statements', path: '/member/downloads', icon: FileText },
  { label: 'Member Stats', path: '/member/downloads', icon: BarChart3 },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(MONTHLY_CONTRIBUTION);
  const [paySuccess, setPaySuccess] = useState('');
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberDashboard,
    queryFn: () => mockMember.dashboard(),
  });

  if (isLoading) return <LoadingState text="Loading your member dashboard..." />;
  if (isError || !data) return <ErrorState message="We couldn't load your dashboard." onRetry={() => refetch()} />;

  const firstName = user?.name?.split(' ')[0] ?? 'Member';
  const outstanding = Math.max(data.penalties_total, 0);

  const openPayment = (amount: number) => {
    setPayAmount(amount);
    setPaymentMenuOpen(false);
    setPayOpen(true);
  };

  const handlePaySuccess = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.memberDashboard });
    setPayOpen(false);
    setPaySuccess('Payment status updated successfully.');
    window.setTimeout(() => setPaySuccess(''), 4000);
  };

  return (
    <div
      className="relative -mx-4 -my-5 min-h-[calc(100vh+5rem)] overflow-hidden bg-[#0d75d6] bg-cover bg-center text-white sm:-mx-6 lg:-mx-8 lg:-my-5"
      style={{ backgroundImage: "linear-gradient(180deg, rgba(14,120,214,.22), rgba(3,78,165,.48)), url('/images/image%20copy%202.png')" }}
    >
      <div className="relative z-10 mx-auto max-w-2xl px-5 pb-28 pt-8 sm:px-10">
        <div className="flex items-center gap-3">
          <img src="/images/image%20copy%203.png" alt="KHWWC logo" className="h-16 w-16 rounded-full bg-white object-cover shadow-lg ring-2 ring-white/70" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium text-white/90">Good morning,</p>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{firstName} {user?.name?.split(' ').slice(1).join(' ')}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-cyan-100"><span>Member account</span><span className="h-2.5 w-2.5 rounded-full bg-[#25e6a0]" />Active</p>
          </div>
          <div className="hidden h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 sm:flex">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : <User size={30} />}
          </div>
        </div>

        <section className="mt-12 text-center">
          <p className="text-5xl font-bold tracking-tight drop-shadow-[0_0_14px_rgba(255,255,255,.6)] sm:text-7xl">{formatCurrency(data.contributions_total)}</p>
          <p className="mt-2 text-xl font-medium text-cyan-100">Total contributions <span aria-hidden="true">◉</span></p>
          <div className="mx-auto mt-5 h-px max-w-md bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
        </section>

        {paySuccess && <div className="mt-4 rounded-xl border border-[#25e6a0]/50 bg-[#25e6a0]/20 px-4 py-3 text-center text-sm text-white"><Check size={16} className="mr-2 inline" />{paySuccess}</div>}

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:gap-x-20">
          {shortcuts.map(({ label, path, icon: Icon }) => (
            <Link key={label} to={path} className="group flex flex-col items-center gap-2 text-center transition-transform hover:-translate-y-1">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-100/50 bg-white/15 text-cyan-50 shadow-[0_12px_25px_rgba(0,32,105,.25)] backdrop-blur-sm transition-colors group-hover:bg-white/25 sm:h-24 sm:w-24"><Icon size={42} strokeWidth={1.6} /></span>
              <span className="text-base font-semibold sm:text-lg">{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 divide-x divide-white/50 text-center">
          <div><p className="text-2xl font-bold sm:text-3xl">{data.contributions_count}</p><p className="text-xs text-cyan-100 sm:text-sm">Contributions</p></div>
          <div><p className="text-2xl font-bold sm:text-3xl">{formatCurrency(data.donations_total)}</p><p className="text-xs text-cyan-100 sm:text-sm">Welfare</p></div>
          <div><p className="text-2xl font-bold sm:text-3xl">{data.unread_notifications}</p><p className="text-xs text-cyan-100 sm:text-sm">Pending</p></div>
        </div>

        <div className="relative mt-10">
          <button onClick={() => setPaymentMenuOpen(value => !value)} className="flex w-full items-center justify-center gap-3 rounded-full border border-cyan-100/80 bg-gradient-to-r from-[#287fe8] to-[#39cfff] px-5 py-4 text-lg font-bold shadow-[0_8px_25px_rgba(0,43,114,.3)] transition-transform hover:scale-[1.01]"><CreditCard size={22} />Make a payment<ArrowRight size={22} /></button>
          {paymentMenuOpen && (
            <div className="absolute left-1/2 top-full z-20 mt-3 w-[calc(100%-1rem)] -translate-x-1/2 rounded-2xl border border-white/50 bg-[#4d9fe8]/90 p-3 shadow-xl backdrop-blur-md">
              <button onClick={() => openPayment(outstanding || MONTHLY_CONTRIBUTION)} className="flex w-full items-center gap-3 border-b border-white/25 px-3 py-3 text-left text-sm font-semibold hover:bg-white/10"><ShieldCheck size={20} />Penalty payment<ArrowRight className="ml-auto" size={17} /></button>
              <button onClick={() => openPayment(MONTHLY_CONTRIBUTION)} className="flex w-full items-center gap-3 border-b border-white/25 px-3 py-3 text-left text-sm font-semibold hover:bg-white/10"><WalletCards size={20} />Fund drive contribution<ArrowRight className="ml-auto" size={17} /></button>
              <button onClick={() => openPayment(MONTHLY_CONTRIBUTION)} className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold hover:bg-white/10"><HeartHandshake size={20} />Welfare contribution<ArrowRight className="ml-auto" size={17} /></button>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-around rounded-3xl border border-white/20 bg-white/10 px-2 py-3 backdrop-blur-md lg:hidden">
          <Link to="/member" className="flex flex-col items-center gap-1 text-cyan-100"><Landmark size={22} /><span className="text-xs">Home</span></Link>
          <Link to="/member/downloads" className="flex flex-col items-center gap-1 text-cyan-100"><History size={22} /><span className="text-xs">History</span></Link>
          <Link to="/member/notifications" className="flex flex-col items-center gap-1 text-cyan-100"><Bell size={22} /><span className="text-xs">Notifications</span></Link>
          <Link to="/member/profile" className="flex flex-col items-center gap-1 text-cyan-100"><User size={22} /><span className="text-xs">Profile</span></Link>
        </div>
      </div>

      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} amount={payAmount} accountRef="CONTRIBUTION-member" paymentType="monthly_contribution" transactionDesc="Monthly contribution payment" bankDetails={BANK_DETAILS} onSuccess={handlePaySuccess} />
    </div>
  );
}
