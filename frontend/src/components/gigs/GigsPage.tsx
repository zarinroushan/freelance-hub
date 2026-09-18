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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const [gigsData, categoriesData] = await Promise.all([
          gigService.getGigs({ category: selectedCategory || undefined, sort: sortBy as any }),
          gigService.getCategories(),
        ]);
        setGigs(gigsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [selectedCategory, sortBy]);

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
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[var(--color-text)] mb-3">Find Gigs</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Discover freelance opportunities from fellow students
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 space-y-4">
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
        {!loading && gigs.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="secondary" size="lg">
              Load More Gigs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}