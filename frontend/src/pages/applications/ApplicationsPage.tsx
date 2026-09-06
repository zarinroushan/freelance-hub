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

  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'accepted' | 'rejected'
  >('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data);
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
    if (activeTab === 'all') {
      return true;
    }

    return app.status === activeTab;
  });

  const getStatusClass = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'status status--pending';

      case 'accepted':
        return 'status status--accepted';

      case 'rejected':
        return 'status status--rejected';

      case 'withdrawn':
        return 'status status--withdrawn';

      default:
        return 'status';
    }
  };

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="applications-loading__text">
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      {/* Header */}
      <div className="applications-header">
        <div>
          <h1>My Applications</h1>

          <p>
            Track and manage your gig applications
          </p>
        </div>

        <Link to="/gigs">
          <Button variant="primary">
            Browse Gigs
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="applications-tabs">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? 'applications-tab applications-tab--active'
                  : 'applications-tab'
              }
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Applications */}
      {filteredApps.length === 0 ? (
        <Card>
          <CardContent className="applications-empty">
            <div className="applications-empty__icon">
              📝
            </div>

            <h3>
              No applications found
            </h3>

            <p>
              {activeTab === 'all'
                ? "You haven't applied to any gigs yet."
                : `No ${activeTab} applications.`}
            </p>

            {activeTab === 'all' && (
              <Link to="/gigs">
                <Button variant="primary">
                  Browse Gigs
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="applications-list">
          {filteredApps.map((app) => (
            <Card key={app.id}>
              <CardContent className="application-card">
                <div className="application-card__info">
                  <div className="application-card__title-row">
                    <h3>
                      {app.gig?.title || `Gig #${app.gig_id}`}
                    </h3>

                    <span className={getStatusClass(app.status)}>
                      {app.status}
                    </span>
                  </div>

                  <div className="application-card__details">
                    <span>
                      Proposed: ₹{app.proposed_price}
                    </span>

                    <span className="application-card__separator">
                      •
                    </span>

                    <span>
                      Applied:{' '}
                      {new Date(
                        app.created_at
                      ).toLocaleDateString()}
                    </span>

                    {app.gig?.budget !== undefined && (
                      <>
                        <span className="application-card__separator">
                          •
                        </span>

                        <span>
                          Budget: ₹{app.gig.budget}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="application-card__actions">
                  <Link to={`/gigs/${app.gig_id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      View Gig
                    </Button>
                  </Link>

                  {app.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="application-withdraw"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="applications-stats">
        <Card>
          <CardContent className="application-stat">
            <div className="application-stat__number">
              {applications.length}
            </div>

            <div className="application-stat__label">
              Total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="application-stat">
            <div className="application-stat__number application-stat__number--pending">
              {
                applications.filter(
                  (app) => app.status === 'pending'
                ).length
              }
            </div>

            <div className="application-stat__label">
              Pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="application-stat">
            <div className="application-stat__number application-stat__number--accepted">
              {
                applications.filter(
                  (app) => app.status === 'accepted'
                ).length
              }
            </div>

            <div className="application-stat__label">
              Accepted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="application-stat">
            <div className="application-stat__number application-stat__number--rejected">
              {
                applications.filter(
                  (app) => app.status === 'rejected'
                ).length
              }
            </div>

            <div className="application-stat__label">
              Rejected
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}