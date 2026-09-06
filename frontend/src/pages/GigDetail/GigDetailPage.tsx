import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gigService } from '../../services/gigs';
import type { Gig } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Clock, User, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Skeleton width={120} height={20} className="mb-8" />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton height={300} radius="16px" />
              <Skeleton width="80%" height={32} className="mb-3" />
              <Skeleton width="40%" height={24} className="mb-8" />
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton height={16} />
                  <Skeleton height={16} />
                  <Skeleton height={16} width="80%" />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton height={20} />
                  <Skeleton height={20} />
                  <Skeleton height={44} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton width="40%" height={20} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton height={60} />
                  <Skeleton height={16} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">Gig not found</h1>
          <Link to="/gigs">
            <Button size="md">← Back to Gigs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Back Button */}
        <Link to="/gigs" className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Back to Gigs
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 65% width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gig Image */}
            <div className="h-80 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 rounded-xl flex items-center justify-center border border-[var(--color-border)]">
              <span className="text-8xl opacity-40">💼</span>
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full uppercase tracking-wide">
             Freelance
                </span>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  Posted recently
                </span>
              </div>
              <h1 className="text-4xl font-bold text-[var(--color-text)] mb-6">
                {gig.title}
              </h1>
              <div className="text-4xl font-bold text-[var(--color-primary)]">
                ₹{gig.budget}
              </div>
            </div>

            {/* Description */}
            {gig.description && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Description</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-[var(--color-text)] whitespace-pre-line">
                    {gig.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {gig.requirements && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Requirements</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-[var(--color-text)]">{gig.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Deliverables */}
            {gig.deliverables && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Deliverables</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-[var(--color-text)]">{gig.deliverables}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - 35% width */}
          <div className="space-y-6">
            {/* Apply Card - Sticky */}
            <Card className="sticky top-28 shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Budget Section */}
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Budget</p>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">
                    ₹{gig.budget}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                  {/* Delivery Time */}
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Delivery Time</p>
                    <div className="flex items-center gap-2 text-base font-medium text-[var(--color-text)]">
                      <Clock size={18} className="text-[var(--color-primary)]" />
                      {gig.delivery_days} days
                    </div>
                  </div>

                  {/* Proposals */}
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Proposals</p>
                    <div className="flex items-center gap-2 text-base font-medium text-[var(--color-text)]">
                      <User size={18} className="text-[var(--color-primary)]" />
                      {gig.application_count} students applied
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6 border-t border-[var(--color-border)]">
                  <Button fullWidth size="lg" onClick={handleApply}>
                    Apply for this Gig
                  </Button>
                  <Button variant="secondary" fullWidth size="md">
                    Save Gig
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-[var(--color-text)]">Client Info</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={28} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--color-text)]">College Event Team</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Member since 2025</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Payment verified</span>
                  <CheckCircle size={18} className="text-[var(--color-success)]" />
                </div>
              </CardContent>
            </Card>
          </div>
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
          'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}`,
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
        <div className="bg-[var(--color-surface)] rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
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
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Submit Your Proposal
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Your Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-[var(--color-text-muted)] font-medium">₹</span>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="Enter amount"
                required
                className="w-full pl-8 pr-4 h-11 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] font-medium placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Delivery Days Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Delivery Time
            </label>
            <div className="relative">
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="e.g., 5"
                required
                className="w-full px-4 h-11 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] font-medium placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <span className="absolute right-4 top-3 text-[var(--color-text-muted)]">days</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the client why you're the best fit for this gig..."
              required
              rows={5}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              fullWidth 
              size="md"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              fullWidth 
              size="md"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


