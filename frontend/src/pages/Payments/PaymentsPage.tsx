import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { Clock } from 'lucide-react';
interface Payment {
  id: number;
  contract_id: number;
  amount: number;
  status: 'pending' | 'released' | 'failed' | 'refunded';
  released_at?: string;
  created_at: string;
  is_sender?: boolean;
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState({
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
          fetch(`${API_BASE_URL}/payments`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/payments/earnings`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }

        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings(earningsData);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Payments & Earnings</h1>
        <p className="text-[var(--color-text-muted)]">
          Track your earnings and payment history
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-4 bg-green-100 rounded-lg">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Total Earned</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">₹{earnings.total_earned}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-4 bg-yellow-100 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Pending</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">₹{earnings.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-4 bg-blue-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Completed</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">{earnings.completed_count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-lg">Payment Methods</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <CreditCard size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Bank Transfer</p>
                <p className="text-sm text-[var(--color-text-muted)]">Add your bank account</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Add Account</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-lg">Transaction History</h3>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-20 text-center text-[var(--color-text-muted)]">
              <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
              <p>No transactions yet</p>
              <p className="text-sm mt-2">Complete contracts to see payments here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'released' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <DollarSign size={20} className={
                        payment.status === 'released' ? 'text-green-600' : 'text-yellow-600'
                      } />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">
                        Contract #{payment.contract_id}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {payment.released_at 
                          ? new Date(payment.released_at).toLocaleDateString()
                          : 'Pending'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text)]">
                      {payment.is_sender ? '-' : '+'}₹{payment.amount}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}