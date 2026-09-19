import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { useAuth } from '../../services/context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, Clock, DollarSign, CheckCircle, Package } from 'lucide-react';

interface Contract {
  id: number;
  gig_id: number;
  client_id: number;
  freelancer_id: number;
  agreed_budget: number;
  status: 'pending' | 'active' | 'submitted' | 'revision_requested' | 'completed' | 'cancelled';
  created_at: string;
  delivery_deadline: string;
  reviewed_by_me?: boolean;
  revision_feedback?: string | null;
}

export function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contracts`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setContracts(data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'revision_requested': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeliver = async (contractId: number) => {
    const description = prompt('Enter delivery description:');
    if (!description) return;

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          description,
          submission_message: 'Work completed and ready for review',
        }),
      });

      if (response.ok) {
        alert('Work submitted successfully! ✅');
        // Refresh contracts
        const contracts = await fetch(`${API_BASE_URL}/contracts`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (contracts.ok) {
          setContracts(await contracts.json());
        }
      } else {
        alert('Failed to submit work');
      }
    } catch (error) {
      console.error('Error delivering:', error);
      alert('Failed to submit work');
    }
  };

  const handleRequestRevision = async (contractId: number) => {
    const feedback = prompt('Describe the changes needed:')?.trim();
    if (!feedback) return;

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/request-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ feedback }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to request revision');
      }
      setContracts((current) => current.map((contract) => (
        contract.id === contractId
          ? { ...contract, status: 'revision_requested', revision_feedback: feedback }
          : contract
      )));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to request revision');
    }
  };

  const handleApprove = async (contractId: number) => {
    if (!confirm('Approve this work and release payment?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        alert('Work approved! Payment released. 🎉');
        // Refresh contracts
        const contracts = await fetch(`${API_BASE_URL}/contracts`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (contracts.ok) {
          setContracts(await contracts.json());
        }
      } else {
        alert('Failed to approve');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve');
    }
  };

  const handleReview = async (contractId: number) => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          contract_id: contractId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit review');
      }
      setContracts((current) => current.map((contract) => (
        contract.id === contractId ? { ...contract, reviewed_by_me: true } : contract
      )));
      setReviewingId(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">My Contracts</h1>
        <p className="text-[var(--color-text-muted)]">
          Manage your active contracts and deliverables
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-[var(--color-text)]">{contracts.length}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'submitted').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contracts.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No contracts yet</h3>
            <p className="text-[var(--color-text-muted)]">
              When you accept a gig or post one, contracts will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Briefcase size={24} className="text-[var(--color-primary)]" />
                    <div>
                      <h3 className="font-semibold text-lg text-[var(--color-text)]">
                        Contract #{contract.id}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Created: {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={18} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Budget</p>
                      <p className="font-medium text-[var(--color-text)]">₹{contract.agreed_budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Deadline</p>
                      <p className="font-medium text-[var(--color-text)]">
                        {new Date(contract.delivery_deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package size={18} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Gig ID</p>
                      <p className="font-medium text-[var(--color-text)]">#{contract.gig_id}</p>
                    </div>
                  </div>
                </div>
                {contract.status === 'revision_requested' && contract.revision_feedback && (
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
                    <p className="font-semibold">Revision feedback</p>
                    <p className="mt-1">{contract.revision_feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-[var(--color-border)]">
                  {(contract.status === 'active' || contract.status === 'revision_requested') && user?.role === 'student' && (
                    <Button onClick={() => handleDeliver(contract.id)}>
                      {contract.status === 'revision_requested' ? 'Resubmit Work' : 'Submit Work'}
                    </Button>
                  )}
                  {contract.status === 'submitted' && user?.role === 'client' && (
                    <>
                      <Button variant="secondary" onClick={() => handleRequestRevision(contract.id)}>
                        Request Revision
                      </Button>
                      <Button onClick={() => handleApprove(contract.id)}>
                        <CheckCircle size={16} className="mr-2" />
                        Approve & Pay
                      </Button>
                    </>
                  )}
                  {user?.role === 'student' && contract.freelancer_id === user.id && contract.status === 'completed' && (
                    contract.reviewed_by_me ? (
                      <span className="inline-flex items-center text-sm text-[var(--color-success)]">Review submitted</span>
                    ) : (
                      <Button variant="secondary" onClick={() => setReviewingId(reviewingId === contract.id ? null : contract.id)}>
                        Leave a Review
                      </Button>
                    )
                  )}
                  <Button variant="secondary">View Details</Button>
                </div>
                {reviewingId === contract.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
                    <div>
                      <label htmlFor={`rating-${contract.id}`} className="block text-sm font-medium text-[var(--color-text)] mb-1">Rating</label>
                      <select
                        id={`rating-${contract.id}`}
                        value={reviewRating}
                        onChange={(event) => setReviewRating(Number(event.target.value))}
                        className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                      </select>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder="Share an optional comment"
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
                    />
                    <Button onClick={() => handleReview(contract.id)} disabled={reviewLoading}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}