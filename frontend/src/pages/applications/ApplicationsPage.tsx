import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApps = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[var(--color-text-muted)]">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">My Applications</h1>
        <p className="text-[var(--color-text-muted)]">
          Track and manage your gig applications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[var(--color-border)]">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              No applications found
            </h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {activeTab === 'all' 
                ? "You haven't applied to any gigs yet" 
                : `No ${activeTab} applications`}
            </p>
            {activeTab === 'all' && (
              <Link to="/gigs">
                <Button>Browse Gigs</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-[var(--color-text)]">
                        Gig #{app.gig_id}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] space-x-4">
                      <span>Proposed: ₹{app.proposed_price}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link to={`/gigs/${app.gig_id}`}>
                      <Button variant="outline" size="sm">View Gig</Button>
                    </Link>
                    {app.status === 'pending' && (
                      <Button variant="ghost" size="sm" className="text-red-600">
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

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-[var(--color-text)]">{applications.length}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'accepted').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Rejected</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}