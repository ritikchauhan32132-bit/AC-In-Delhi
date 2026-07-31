'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Quote } from 'lucide-react';
import type { Review } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Reviews({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Customer Reviews</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-lg font-bold text-primary">{avgRating}</span>
            <span className="text-muted-foreground">from {reviews.length}+ reviews</span>
          </div>
        </motion.div>

        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No reviews yet. Be the first to review us!</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {visible.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="glass rounded-2xl p-6 shadow-soft hover:shadow-premium transition-all"
                >
                  <Quote className="w-8 h-8 text-secondary/30 mb-3" />
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 line-clamp-4">"{review.review}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm text-primary">{review.name}</span>
                        {review.is_verified && <BadgeCheck className="w-4 h-4 text-secondary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="text-center mt-8">
              <Link href="/review">
                <Button variant="outline" className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                  Write a Review
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
