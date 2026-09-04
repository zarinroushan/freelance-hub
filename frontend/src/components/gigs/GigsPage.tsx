import React, { useEffect, useState } from 'react';
import { gigService } from '../../services/gigs';import type { Gig, Category } from '../../types';

import { GigCard } from '../../components/gigs/GigCard';

import { Card, CardContent } from '../../components/ui/Card';

import { Input } from '../../components/ui/Input';

import { Button } from '../../components/ui/Button';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Find Gigs</h1>
        <p className="text-[var(--color-text-muted)]">
          Discover freelance opportunities from fellow students
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
              <input
                type="text"
                placeholder="Search gigs..."
                className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
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
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="budget_low">Budget: Low to High</option>
            <option value="budget_high">Budget: High to Low</option>
          </select>
        </div>
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-[var(--color-text-muted)]">Loading gigs...</div>
        </div>
      ) : gigs.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No gigs found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              Try adjusting your filters or check back later
            </p>
            <Button onClick={() => { setSelectedCategory(null); setSortBy('recent'); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
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
          <Button variant="outline" size="lg">
            Load More Gigs
          </Button>
        </div>
      )}
    </div>
  );
}