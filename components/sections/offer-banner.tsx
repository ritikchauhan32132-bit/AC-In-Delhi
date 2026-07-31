'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { OfferCycle } from '@/lib/types';

export function OfferBanner({ settings }: { settings: Record<string, any> }) {
  const offer = settings.offer || { enabled: true, activeDurationHours: 6, gapDurationHours: 48 };
  const [cycle, setCycle] = useState<OfferCycle | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchCycle() {
      const { data } = await supabase
        .from('offer_cycles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setCycle(data);
    }
    fetchCycle();
    const interval = setInterval(fetchCycle, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cycle) return;
    const tick = () => {
      const now = new Date();
      const end = new Date(cycle.end_at);
      const start = new Date(cycle.start_at);
      if (now >= start && now < end) {
        setIsLive(true);
        const diff = end.getTime() - now.getTime();
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setIsLive(false);
        const nextStart = new Date(end.getTime() + offer.gapDurationHours * 3600000);
        if (now < nextStart) {
          const diff = nextStart.getTime() - now.getTime();
          setTimeLeft({
            hours: Math.floor(diff / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
          });
        }
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cycle, offer.gapDurationHours]);

  if (!offer.enabled || !cycle) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-accent text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3 shadow-soft">
              <Tag className="w-4 h-4" />
              {isLive ? 'LIMITED TIME OFFER' : 'OFFER STARTING SOON'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {isLive ? '10% OFF on All AC Services!' : 'Next Offer Starts Soon'}
            </h2>
            <p className="text-white/80">
              {isLive
                ? 'Discount applied automatically. Original price stays the same — you save on the MRP.'
                : 'Our 10% off offer will be back shortly. Stay tuned!'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Timer className="w-5 h-5" />
              <span className="text-sm font-medium">{isLive ? 'Ends in' : 'Starts in'}</span>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((t) => (
                <div key={t.label} className="glass-dark rounded-xl px-4 py-3 text-center min-w-[70px]">
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {String(t.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/70 uppercase">{t.label}</div>
                </div>
              ))}
            </div>
            {isLive && (
              <Link href="/book">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-premium ripple">
                  Grab the Offer
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
