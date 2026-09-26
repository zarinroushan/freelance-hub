import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DollarSign, TrendingUp, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface Payment {
  id: number;
  contract_id: number;
  amount: number;
  status: 'pending' | 'released' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  released_at?: string;
  created_at: string;
  is_sender?: boolean;
}

interface Earnings {
  total_earned: number;
  pending: number;
  completed_count: number;
}

const STATUS_CONFIG = {
  released: {
    label: 'Released',
    classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    icon: Clock,
    iconColor: 'text-amber-500',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  refunded: {
    label: 'Refunded',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    icon: RefreshCw,
    iconColor: 'text-gray-400',
  },
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({
    total_earned: 0,
    pending: 0,
    completed_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const [paymentsRes, earningsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/payments/earnings`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (paymentsRes.ok) setPayments(await paymentsRes.json());
        if (earningsRes.ok) setEarnings(await earningsRes.json());
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <RefreshCw className="animate-spin" size={20} />
          <span className="font-medium">Loading payments…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">Payments & Earnings</h1>
        <p className="text-[var(--color-text-muted)] text-sm">
          Track all your payment activity and earnings in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {/* Total Earned */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Earned
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[var(--color-text)]">₹{earnings.total_earned.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Total released to you</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-xl">
                <Clock className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Pending
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[var(--color-text)]">₹{earnings.pending.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Awaiting release</p>
          </CardContent>
        </Card>

        {/* Completed Contracts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Completed
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[var(--color-text)]">{earnings.completed_count}</p>
            <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Paid contracts</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-bold text-base text-[var(--color-text)]">Payment Methods</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
                <CreditCard size={22} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--color-text)]">Card Payments</p>
                <p className="text-xs text-[var(--color-text-muted)]">Demo mode — no real charges</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              ✓ Active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-base text-[var(--color-text)]">Transaction History</h3>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-surface-alt)] rounded-2xl flex items-center justify-center">
                <DollarSign size={32} className="text-[var(--color-text-muted)] opacity-40" />
              </div>
              <p className="font-semibold text-[var(--color-text)] mb-1">No transactions yet</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Complete contracts to see payments here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => {
                const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const isIncoming = !payment.is_sender;
                const DirectionIcon = isIncoming ? ArrowDownLeft : ArrowUpRight;

                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors group"
                  >
                    {/* Direction indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isIncoming ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-blue-100 dark:bg-blue-950'
                    }`}>
                      <DirectionIcon size={18} className={isIncoming ? 'text-emerald-600' : 'text-blue-600'} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-[var(--color-text)]">
                          Contract #{payment.contract_id}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {payment.payment_method && <span className="mr-2">via {payment.payment_method}</span>}
                        {payment.released_at
                          ? new Date(payment.released_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </p>
                      {payment.transaction_id && (
                        <p className="text-[10px] font-mono text-[var(--color-text-muted)] opacity-60 mt-0.5 truncate">
                          Ref: {payment.transaction_id.slice(0, 20)}…
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-base font-extrabold ${isIncoming ? 'text-emerald-600' : 'text-[var(--color-text)]'}`}>
                        {isIncoming ? '+' : '-'}₹{payment.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <StatusIcon size={12} className={cfg.iconColor} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}