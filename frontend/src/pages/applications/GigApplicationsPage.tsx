import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gigService } from '../../services/gigs';
import { applicationService } from '../../services/applications';
import type { Gig, Application } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/StateComponents';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  User as UserIcon,
  FileText,
  DollarSign,
  GraduationCap,
  Star,
  Award,
  ExternalLink,
} from 'lucide-react';

export function GigApplicationsPage() {
  const { gigId } = useParams<{ gigId: string }>();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!gigId) return;
      try {
        const id = Number(gigId);
        const [gigData, appsData] = await Promise.all([
          gigService.getGig(id),
          applicationService.getGigApplications(id),
        ]);
        setGig(gigData);
        setApplications(appsData);
      } catch (error) {
        console.error('Error loading gig applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gigId]);

  const navigate = useNavigate();

  const handleAccept = async (appId: number) => {
    try {
      setActionLoadingId(appId);
      const result = await applicationService.acceptApplication(appId);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'accepted' } : app))
      );
      // Redirect client to contracts page after accepting
      if (result?.contract_id) {
        navigate('/contracts');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (appId: number) => {
    try {
      setActionLoadingId(appId);
      await applicationService.rejectApplication(appId);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'rejected' } : app))
      );
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={18} className="text-[var(--color-success)]" />;
      case 'pending':
        return <Clock size={18} className="text-[var(--color-warning)]" />;
      case 'rejected':
        return <XCircle size={18} className="text-[var(--color-error)]" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: Application['status']) => {
    const baseClass = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending':
        return `${baseClass} bg-[var(--color-warning-bg)] text-[var(--color-warning)]`;
      case 'accepted':
        return `${baseClass} bg-[var(--color-success-bg)] text-[var(--color-success)]`;
      case 'rejected':
        return `${baseClass} bg-[var(--color-error-bg)] text-[var(--color-error)]`;
      default:
        return `${baseClass} bg-[var(--color-border)] text-[var(--color-text-muted)]`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <SkeletonGrid columns={1} count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          to={gig ? `/gigs/${gig.id}` : '/gigs'}
          className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Gig Details
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full uppercase tracking-wide">
            Applications Management
          </span>
          <h1 className="text-4xl font-bold text-[var(--color-text)] mt-3 mb-2">
            Applications for {gig?.title || `Gig #${gigId}`}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Review applicant proposals, pitches, and profiles ({applications.length} submitted)
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-bold text-[var(--color-text)]">
                {applications.length}
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase">
                Total Proposals
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-bold text-[var(--color-warning)]">
                {applications.filter((a) => a.status === 'pending').length}
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase">
                Pending Review
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-bold text-[var(--color-success)]">
                {applications.filter((a) => a.status === 'accepted').length}
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase">
                Accepted
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                ₹{gig?.budget || 0}
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase">
                Gig Budget
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Tabs */}
        {applications.length > 0 && (
          <div className="flex gap-3 mb-8 border-b border-[var(--color-border)] overflow-x-auto">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab} ({applications.filter((a) => tab === 'all' || a.status === tab).length})
              </button>
            ))}
          </div>
        )}

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} />}
            title={activeTab === 'all' ? 'No applications received yet' : `No ${activeTab} applications`}
            description="When freelancers apply to this gig, their proposals and profiles will appear here."
          />
        ) : (
          <div className="space-y-6">
            {filteredApps.map((app) => {
              const profile = app.freelancer?.profile;
              const applicantName = profile?.full_name || app.freelancer?.email || `Applicant #${app.freelancer_id}`;

              return (
                <Card key={app.id} className="overflow-hidden border border-[var(--color-border)]">
                  <CardHeader className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Applicant Profile Summary */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[var(--color-primary)] overflow-hidden">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={applicantName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={24} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-3">
                            <span>{applicantName}</span>
                            <Link
                              to={`/profile/${app.freelancer_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
                            >
                              <ExternalLink size={12} />
                              View Profile
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)] mt-1">
                            {profile?.university && (
                              <span className="flex items-center gap-1">
                                <GraduationCap size={15} />
                                {profile.university}
                              </span>
                            )}
                            {profile?.average_rating !== undefined && (
                              <span className="flex items-center gap-1 text-[var(--color-warning)] font-semibold">
                                <Star size={15} className="fill-current" />
                                {profile.average_rating} / 5
                              </span>
                            )}
                            {profile?.completed_gigs_count !== undefined && (
                              <span className="flex items-center gap-1">
                                <Award size={15} />
                                {profile.completed_gigs_count} gigs completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className={getStatusBadgeClass(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="capitalize">{app.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Proposal Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm">
                      <div>
                        <span className="text-[var(--color-text-muted)] block text-xs font-semibold uppercase">Proposed Budget</span>
                        <span className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-1 mt-1">
                          <DollarSign size={18} />
                          ₹{app.proposed_price}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)] block text-xs font-semibold uppercase">Delivery Time</span>
                        <span className="text-lg font-bold text-[var(--color-text)] flex items-center gap-1 mt-1">
                          <Clock size={18} className="text-[var(--color-primary)]" />
                          {app.delivery_days || '-'} days
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)] block text-xs font-semibold uppercase">Submitted Date</span>
                        <span className="text-sm font-medium text-[var(--color-text)] block mt-1">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Proposal Pitch / Cover Letter */}
                   
                      <div>
                        <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide mb-2 flex items-center gap-2">
                          <FileText size={16} className="text-[var(--color-primary)]" />
                          Proposal Pitch / Cover Letter
                        </h4>
                        <div className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-base leading-relaxed whitespace-pre-line">
                          {app.cover_letter}
                        </div>
                      </div>
                    

                    {/* Applicant Bio & Skills */}
                    {(profile?.bio || profile?.skills_summary) && (
                      <div className="grid md:grid-cols-2 gap-4 text-sm pt-2">
                        {profile?.bio && (
                          <div className="p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                            <span className="font-semibold text-[var(--color-text)] block mb-1">About Freelancer</span>
                            <p className="text-[var(--color-text-secondary)]">{profile.bio}</p>
                          </div>
                        )}
                        {profile?.skills_summary && (
                          <div className="p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                            <span className="font-semibold text-[var(--color-text)] block mb-1">Skills</span>
                            <p className="text-[var(--color-text-secondary)]">{profile.skills_summary}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Portfolio Links */}
                    {app.portfolio_links && (
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase block mb-1">Portfolio</span>
                        <a
                          href={app.portfolio_links}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[var(--color-primary)] font-medium hover:underline text-sm"
                        >
                          <ExternalLink size={16} />
                          {app.portfolio_links}
                        </a>
                      </div>
                    )}

                    {/* Owner Action Buttons */}
                    {app.status === 'pending' && (
                      <div className="flex gap-4 pt-4 border-t border-[var(--color-border)] justify-end">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoadingId === app.id}
                        >
                          Reject Application
                        </Button>
                        <Button
                          size="md"
                          onClick={() => handleAccept(app.id)}
                          disabled={actionLoadingId === app.id}
                        >
                          {actionLoadingId === app.id ? 'Processing...' : 'Accept Proposal'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
