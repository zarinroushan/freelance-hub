import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gigService } from '../../services/gigs';
import type { Gig } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Clock, DollarSign, FileText, User, CheckCircle } from 'lucide-react';

export function GigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const data = await gigService.getGig(Number(id));
        setGig(data);
      } catch (error) {
        console.error('Error fetching gig:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

  const handleApply = () => {
    setShowApplyModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading gig details...</div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Gig not found</h1>
        <Link to="/gigs">
          <Button>← Back to Gigs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/gigs" className="text-[var(--color-primary)] hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Back to Gigs
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Image */}
          <div className="h-64 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 rounded-2xl flex items-center justify-center">
            <span className="text-8xl opacity-50">🌸</span>
          </div>

          {/* Title & Budget */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium rounded-full">
                Design
              </span>
              <span className="text-[var(--color-text-muted)] text-sm">
                Posted 2 days ago
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">
              {gig.title}
            </h1>
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              ₹{gig.budget}
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                Description
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text)] whitespace-pre-line">
                {gig.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {gig.requirements && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-lg">Requirements</h2>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text)]">{gig.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {gig.deliverables && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-lg">Deliverables</h2>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text)]">{gig.deliverables}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-sm text-[var(--color-text-muted)] mb-1">Budget</div>
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  ₹{gig.budget}
                </div>
              </div>

              <div>
                <div className="text-sm text-[var(--color-text-muted)] mb-1">Delivery Time</div>
                <div className="flex items-center text-[var(--color-text)]">
                  <Clock size={16} className="mr-2" />
                  {gig.delivery_days} days
                </div>
              </div>

              <div>
                <div className="text-sm text-[var(--color-text-muted)] mb-1">Proposals</div>
                <div className="flex items-center text-[var(--color-text)]">
                  <User size={16} className="mr-2" />
                  {gig.application_count} students applied
                </div>
              </div>

              <Button fullWidth size="lg" onClick={handleApply}>
                Apply for this Gig
              </Button>

              <Button variant="outline" fullWidth>
                Save Gig
              </Button>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Client Information</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="font-medium text-[var(--color-text)]">College Event Team</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Member since 2025</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)]">Payment verified</span>
                <CheckCircle size={16} className="text-[var(--color-success)]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal gigId={gig.id} onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
}

// Apply Modal Component
function ApplyModal({ gigId, onClose }: { gigId: number; onClose: () => void }) {
  const navigate = useNavigate();
  const [proposedPrice, setProposedPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          gig_id: gigId,
          proposed_price: Number(proposedPrice),
          delivery_days: Number(deliveryDays),
          cover_letter: coverLetter,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          navigate('/applications');
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to apply');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-surface)] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Application Sent!
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Your proposal has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">
          Submit Your Proposal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Your Price (₹)
            </label>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              placeholder="Enter amount"
              required
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Delivery Time (days)
            </label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              placeholder="e.g., 5"
              required
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the client why you're the best fit..."
              required
              rows={6}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


