'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReviewPage() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (!name || !review) {
      setError('Please fill in your name and review.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('reviews').insert({
      name,
      rating,
      review,
      booking_id: bookingId || null,
      is_approved: false,
      is_verified: false,
    });
    if (error) {
      setError('Failed to submit review. Please try again.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 shadow-premium text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-3">Review Submitted!</h1>
            <p className="text-muted-foreground mb-6">Thank you for your feedback. Your review will appear after admin approval.</p>
            <Button onClick={() => { setSuccess(false); setName(''); setReview(''); setBookingId(''); setRating(5); }} variant="outline" className="w-full">
              Submit Another Review
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Write a Review</h1>
          <p className="text-muted-foreground">Share your experience with AC In Delhi</p>
        </motion.div>

        <Card className="glass shadow-soft p-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Your Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRating(r)} className="transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${r <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Your Review *</Label>
              <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Tell us about your experience..." rows={4} />
            </div>
            <div>
              <Label className="mb-1.5 block">Booking ID (optional)</Label>
              <Input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="ACD-2026-000234" />
            </div>
            {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Review'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
