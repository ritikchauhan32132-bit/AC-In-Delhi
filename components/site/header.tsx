'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Wind, Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PHONE_NUMBER } from '@/lib/constants';

const navLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/#why-us', label: 'Why Us' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
  { href: '/track', label: 'Track Booking' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-soft py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-bold text-lg ${scrolled ? 'text-primary' : 'text-white'}`}>
              AC In Delhi
            </span>
            <span className={`text-[10px] ${scrolled ? 'text-muted-foreground' : 'text-white/80'}`}>
              Doorstep AC Service
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10 ${
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 text-sm font-medium text-primary">
            <Phone className="w-4 h-4" />
            {PHONE_NUMBER}
          </a>
          <Link href="/book">
            <Button className="bg-accent hover:bg-accent/90 text-white shadow-premium ripple">
              Book Now
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden glass mt-2 mx-4 rounded-2xl p-4 animate-scale-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)}>
              <Button className="w-full mt-2 bg-accent hover:bg-accent/90 text-white">Book Now</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
