'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero({ settings }: { settings: Record<string, any> }) {
  const branding = settings.branding || { name: 'AC In Delhi', tagline: 'Professional AC Installation, Repair & Maintenance at Your Doorstep.' };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient pt-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white text-sm mb-6"
          >
            <MapPin className="w-4 h-4 text-accent" />
            Serving within 10 KM of Dwarka Mor, Delhi
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {branding.tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
          >
            Book professional AC installation, repair, gas refill and cleaning services online.
            Verified technicians, transparent pricing, doorstep service across Dwarka Mor, Delhi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Link href="/book">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white text-lg px-8 h-14 shadow-premium ripple group">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Track Booking
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-8 text-white"
          >
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span className="text-sm">Verified Technicians</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-sm">Doorstep Service</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,60 C320,120 720,0 1440,60 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
