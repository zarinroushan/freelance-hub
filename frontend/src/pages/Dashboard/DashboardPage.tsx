import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { gigService } from '../../services/gigs';
import type { Gig } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, DollarSign, TrendingUp, Star, Plus, FileText, MessageSquare } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/users/me/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent gigs
        const gigs = await gigService.getGigs({ limit: 6 });
        setRecentGigs(gigs);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const isStudent = user?.role === 'student';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Welcome back, {user?.email}! 👋
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {isStudent ? "Find your next gig" : "Manage your posted gigs"}
          </p>
        </div>
        {isStudent ? (
          <Link to="/gigs">
            <Button>
              <Briefcase className="w-4 h-4 mr-2" />
              Find Gigs
            </Button>
          </Link>
        ) : (
          <Link to="/gigs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post a Gig
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isStudent ? (
          <>
            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.active_contracts || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Active Contracts</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.completed_contracts || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <Star className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.average_rating || '—'}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Avg Rating</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-secondary)]/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    ₹{stats?.total_earned || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Total Earned</div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <FileText className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.active_gigs || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Active Gigs</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.completed_contracts || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {stats?.total_proposals_received || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Proposals</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-secondary)]/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    ₹{stats?.total_spent || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Total Spent</div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg">Quick Actions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/gigs" className="block">
              <Button variant="outline" fullWidth>
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Gigs
              </Button>
            </Link>
            <Link to="/applications" className="block">
              <Button variant="outline" fullWidth>
                <FileText className="w-4 h-4 mr-2" />
                My Applications
              </Button>
            </Link>
            <Link to="/messages" className="block">
              <Button variant="outline" fullWidth>
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-lg">Recent Gigs</h3>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentGigs.map((gig) => (
                <Link key={gig.id} to={`/gigs/${gig.id}`}>
                  <Card className="hover:border-[var(--color-primary)] transition-colors">
                    <CardContent className="p-4">
                      <div className="text-sm text-[var(--color-primary)] font-medium mb-1">
                        ₹{gig.budget}
                      </div>
                      <h4 className="font-medium text-[var(--color-text)] mb-2 line-clamp-2">
                        {gig.title}
                      </h4>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {gig.application_count} applications
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to="/gigs">
                <Button variant="ghost">View All Gigs →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}