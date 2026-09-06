import React from 'react';
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
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
      <CardContent className="p-0">

        {/* Gig Image */}
        <div
          className="h-48 bg-cover bg-center rounded-t-xl"
          style={{
            backgroundImage: `url(${gigImages[gig.id % gigImages.length]})`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center">
            <span className="text-6xl opacity-50">💼</span>
          </div>
        </div>

        <div className="p-5">

          {/* Budget */}
          <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">
            ₹{gig.budget}
          </div>

          {/* Title */}
          <Link to={`/gigs/${gig.id}`}>
            <h3 className="font-semibold text-lg text-[var(--color-text)] mb-2 hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {gig.title}
            </h3>
          </Link>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)] mb-4">

            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{gig.delivery_days} days</span>
            </div>

            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{gig.application_count} proposals</span>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">

            <Link
              to={`/gigs/${gig.id}`}
              className="text-[var(--color-primary)] font-medium hover:underline text-sm"
            >
              View Details →
            </Link>

            <button
              onClick={() => onSave?.(gig.id)}
              className="p-2 hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors"
            >
              <Bookmark
                size={18}
                className="text-[var(--color-text-muted)]"
              />
            </button>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}