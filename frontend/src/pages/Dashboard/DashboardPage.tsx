import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { gigService } from '../../services/gigs';
import type { Gig } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid, Skeleton } from '../../components/ui/Skeleton';
import { Briefcase, DollarSign, TrendingUp, Star, Plus, FileText, MessageSquare } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch stats - handle missing endpoint gracefully
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/users/me/stats`, {
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
            },
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          } else {
            // If stats endpoint doesn't exist, use default stats
            setStats({ active_contracts: 0, completed_contracts: 0, average_rating: 0, total_earned: 0 });
          }
        } catch {
          // Default stats if endpoint fails
          setStats({ active_contracts: 0, completed_contracts: 0, average_rating: 0, total_earned: 0 });
        }

        // Fetch recent gigs - for clients, fetch their own gigs; for students, fetch all open gigs
        let gigs: Gig[] = [];
        if (user?.role === 'client') {
          // Clients see their own posted gigs
          gigs = await gigService.getMyGigs();
        } else {
          // Students see all open gigs
          gigs = await gigService.getGigs({ limit: 6 });
        }
        setRecentGigs(gigs);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  const isStudent = user?.role === 'student';

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-12">
            <Skeleton width="40%" height={40} className="mb-3" />
            <Skeleton width="60%" height={24} />
          </div>

          {/* Stats skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton height={32} width="60%" className="mb-4" />
                  <Skeleton height={16} width="80%" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent gigs skeleton */}
          <SkeletonGrid columns={3} count={3} />
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
            <h1 className="text-5xl font-bold text-[var(--color-text)] mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {isStudent ? "Find your next opportunity and grow your skills" : "Manage your gigs and hire talented students"}
            </p>
          </div>
          {isStudent ? (
            <Link to="/gigs" className="mt-6 md:mt-0">
              <Button size="md">
                <Briefcase className="w-5 h-5 mr-2" />
                Find Gigs
              </Button>
            </Link>
          ) : (
            <Link to="/gigs/new" className="mt-6 md:mt-0">
              <Button size="md">
                <Plus className="w-5 h-5 mr-2" />
                Post a Gig
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isStudent ? (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                      <Briefcase className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.active_contracts || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Active Contracts
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.completed_contracts || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                      <Star className="w-6 h-6 text-[var(--color-warning)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.average_rating || '—'}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Avg Rating
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        ₹{stats?.total_earned || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Total Earned
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                      <FileText className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.active_gigs || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Active Gigs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                      <Briefcase className="w-6 h-6 text-[var(--color-success)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.completed_contracts || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-[var(--color-warning)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        {stats?.total_proposals_received || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Total Proposals
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-text)]">
                        ₹{stats?.total_spent || 0}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Total Spent
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Links and Recent Gigs */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <Card className="md:row-span-1">
            <CardHeader className="px-6 pt-6">
              <h3 className="text-xl font-bold text-[var(--color-text)]">Quick Links</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Link to="/gigs" className="block">
                <Button variant="secondary" fullWidth size="md">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Browse Gigs
                </Button>
              </Link>
              <Link to="/applications" className="block">
                <Button variant="secondary" fullWidth size="md">
                  <FileText className="w-5 h-5 mr-2" />
                  My Applications
                </Button>
              </Link>
              <Link to="/messages" className="block">
                <Button variant="secondary" fullWidth size="md">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Messages
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Gigs */}
          <Card className="md:col-span-2">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--color-text)]">
                  {isStudent ? "Recently Posted Gigs" : "Your Recent Gigs"}
                </h3>
                <Link to="/gigs">
                  <Button variant="ghost" size="sm">
                    View All →
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {recentGigs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--color-text-muted)] mb-4">No gigs found</p>
                  <Link to="/gigs">
                    <Button size="md">Browse Gigs</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentGigs.map((gig) => (
                    <Link key={gig.id} to={`/gigs/${gig.id}`}>
                      <Card className="hover:shadow-md hover:border-[var(--color-primary)] transition-all h-full">
                        <CardContent className="p-5">
                          <div className="mb-3">
                            <div className="text-sm font-bold text-[var(--color-primary)] mb-2">
                              ₹{gig.budget}
                            </div>
                            <h4 className="font-semibold text-[var(--color-text)] line-clamp-2">
                              {gig.title}
                            </h4>
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {gig.application_count} proposals
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}