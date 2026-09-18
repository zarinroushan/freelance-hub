import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { API_BASE_URL, getAuthToken } from '../../services/api';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/StateComponents';
import { CheckCircle, Clock, XCircle, FileText, ShieldAlert } from 'lucide-react';

interface Application {
  id: number;
  gig_id: number;
  proposed_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  gig?: {
    title: string;
    budget: number;
  };
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'accepted' | 'rejected'
  >('all');

  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const [filledGigIds, setFilledGigIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data);

          // Collect gig IDs of accepted applications (filled gigs)
          const acceptedIds = data
            .filter((a: Application) => a.status === 'accepted')
            .map((a: Application) => a.gig_id);
          setFilledGigIds(acceptedIds);
        } else {
          console.error('Failed to fetch applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    // Hide applications for gigs that already have an accepted applicant (freelancer view)
    if (!isClient && filledGigIds.includes(app.gig_id)) {
      return false;
    }
    if (activeTab === 'all') {
      return true;
    }

    return app.status === activeTab;
  });

  const displayCount = filteredApps.length + (isClient ? 0 : filledGigIds.length);

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} className="text-[var(--color-success)]" />;
      case 'pending':
        return <Clock size={20} className="text-[var(--color-warning)]" />;
      case 'rejected':
        return <XCircle size={20} className="text-[var(--color-error)]" />;
      case 'withdrawn':
        return <FileText size={20} className="text-[var(--color-text-muted)]" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: Application['status']) => {
    const baseClass = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending':
        return `${baseClass} bg-[var(--color-warning-bg)] text-[var(--color-warning)]`;
      case 'accepted':
        return `${baseClass} bg-[var(--color-success-bg)] text-[var(--color-success)]`;
      case 'rejected':
        return `${baseClass} bg-[var(--color-error-bg)] text-[var(--color-error)]`;
      case 'withdrawn':
        return `${baseClass} bg-[var(--color-border)] text-[var(--color-text-muted)]`;
      default:
        return baseClass;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-[var(--color-text)] mb-3">My Applications</h1>
            <p className="text-lg text-[var(--color-text-secondary)]">Track and manage your gig applications</p>
          </div>
          <SkeletonGrid columns={1} count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-[var(--color-text)] mb-3">My Applications</h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Track and manage your gig applications ({displayCount} total)
            </p>
          </div>
          <Link to="/gigs" className="mt-6 md:mt-0">
            <Button size="md">
              Browse More Gigs
            </Button>
          </Link>
        </div>

        {/* Notice: some gigs already filled */}
        {filledGigIds.length > 0 && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning)] text-[var(--color-warning)]">
            <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Some gigs you applied to already have an accepted applicant</p>
              <p className="text-sm mt-1 text-[var(--color-text-secondary)]">
                Those applications are no longer visible.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-text)] mb-2">
                  {applications.length}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Total Applications
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-warning)] mb-2">
                  {applications.filter((app) => app.status === 'pending').length}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-success)] mb-2">
                  {applications.filter((app) => app.status === 'accepted').length}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Accepted
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-error)] mb-2">
                  {applications.filter((app) => app.status === 'rejected').length}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Rejected
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} />}
            title={activeTab === 'all' ? "No applications yet" : `No ${activeTab} applications`}
            description={
              activeTab === 'all'
                ? "Start by browsing gigs and submitting applications"
                : `Check your other applications or browse new gigs`
            }
            action={
              <Link to="/gigs">
                <Button size="md">Browse Gigs</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 line-clamp-2">
                            {app.gig?.title || `Gig #${app.gig_id}`}
                          </h3>
                          <div className={getStatusBadgeClass(app.status)}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[var(--color-text-muted)] mb-1">Proposed Price</p>
                          <p className="font-semibold text-[var(--color-primary)]">₹{app.proposed_price}</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-text-muted)] mb-1">Budget</p>
                          <p className="font-semibold text-[var(--color-text)]">
                            ₹{app.gig?.budget || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--color-text-muted)] mb-1">Applied</p>
                          <p className="font-semibold text-[var(--color-text)]">
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--color-text-muted)] mb-1">Difference</p>
                          <p className={`font-semibold ${
                            (app.gig?.budget ?? 0) - app.proposed_price >= 0
                              ? 'text-[var(--color-success)]'
                              : 'text-[var(--color-error)]'
                          }`}>
                            ₹{((app.gig?.budget ?? 0) - app.proposed_price) > 0 ? '+' : ''}
                            {(app.gig?.budget ?? 0) - app.proposed_price}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-shrink-0">
                      <Link to={`/gigs/${app.gig_id}`}>
                        <Button variant="secondary" size="md">
                          View Gig
                        </Button>
                      </Link>

                      {app.status === 'pending' && (
                        <Button variant="ghost" size="md">
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}