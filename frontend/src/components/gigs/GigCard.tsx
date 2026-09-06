import { Link } from 'react-router-dom';
import type { Gig } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Bookmark, Clock, Users } from 'lucide-react';

// Gig images
const gigImages = [
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558655146-d09347e0b7a9?w=400&h=300&fit=crop',
];

interface GigCardProps {
  gig: Gig;
  onSave?: (gigId: number) => void;
}

export function GigCard({ gig, onSave }: GigCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">

        {/* Gig Image - Reduced height */}
        <div
          className="w-full h-40 bg-cover bg-center flex-shrink-0"
          style={{
            backgroundImage: `url(${gigImages[gig.id % gigImages.length]})`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center">
            <span className="text-5xl opacity-50">💼</span>
          </div>
        </div>

        {/* Content - Improved proportions */}
        <div className="p-5 flex flex-col flex-grow">

          {/* Budget */}
          <div className="text-xl font-bold text-[var(--color-primary)] mb-3">
            ₹{gig.budget}
          </div>

          {/* Title */}
          <Link to={`/gigs/${gig.id}`}>
            <h3 className="font-semibold text-base text-[var(--color-text)] mb-3 hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {gig.title}
            </h3>
          </Link>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4 flex-shrink-0">

            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{gig.delivery_days}d</span>
            </div>

            <div className="flex items-center gap-1">
              <Users size={13} />
              <span>{gig.application_count}</span>
            </div>

          </div>

          {/* Footer - Sticky to bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-auto">

            <Link
              to={`/gigs/${gig.id}`}
              className="text-[var(--color-primary)] font-medium hover:underline text-xs"
            >
              View Details →
            </Link>

            <button
              onClick={() => onSave?.(gig.id)}
              className="p-1.5 hover:bg-[var(--color-surface-alt)] rounded transition-colors"
              title="Save gig"
            >
              <Bookmark
                size={16}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              />
            </button>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}