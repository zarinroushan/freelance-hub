import { useEffect, useState } from 'react';
import { gigService } from '../../services/gigs';
import type { Gig, Category } from '../../types';

import { GigCard } from '../../components/gigs/GigCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/StateComponents';

import { Filter, Search, SlidersHorizontal } from 'lucide-react';

export function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        const gigsData = await gigService.getGigs({ category: selectedCategory || undefined, sort: sortBy as any, page: 1, limit: 20 });
        setGigs(gigsData);
        setPage(1);
        setHasMore(gigsData.length === 20);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    gigService.getCategories()
      .then(setCategories)
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const nextGigs = await gigService.getGigs({
        category: selectedCategory || undefined,
        sort: sortBy as any,
        page: nextPage,
        limit: 20,
      });
      setGigs((current) => [...current, ...nextGigs]);
      setPage(nextPage);
      setHasMore(nextGigs.length === 20);
    } catch (error) {
      console.error('Error loading more gigs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveGig = async (gigId: number) => {
    try {
      await gigService.saveGig(gigId);
      alert('Gig saved! ✅');
    } catch (error) {
      console.error('Error saving gig:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-6 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">Explore Gigs</h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Discover freelance opportunities from fellow students
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  className="w-full pl-12 pr-4 h-12 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal size={18} />
              Filters
            </Button>
          </div>

          {/* Category Filter */}
          {showFilters && (
            <Card className="border border-[var(--color-border)]">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 h-10 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === null
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)] border border-[var(--color-border)]'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 h-10 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)] border border-[var(--color-border)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sort */}
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-[var(--color-text-muted)]" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 h-10 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="recent">Most Recent</option>
              <option value="budget_low">Budget: Low to High</option>
              <option value="budget_high">Budget: High to Low</option>
            </select>
          </div>
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <SkeletonGrid columns={3} count={6} />
        ) : gigs.length === 0 ? (
          <EmptyState
            icon={<span className="text-6xl">📋</span>}
            title="No gigs found"
            description="Try adjusting your filters or check back later"
            action={
              <Button onClick={() => { setSelectedCategory(null); setSortBy('recent'); }} size="md">
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} onSave={handleSaveGig} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && gigs.length > 0 && hasMore && (
          <div className="mt-12 text-center">
            <Button variant="secondary" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More Gigs'}
            </Button>
          </div>
        )}
        {!loading && gigs.length > 0 && !hasMore && (
          <p className="mt-12 text-center text-[var(--color-text-muted)]">No more gigs available.</p>
        )}
      </div>
    </div>
  );
}