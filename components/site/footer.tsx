'use client';

import Link from 'next/link';
import { Wind, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { PHONE_NUMBER } from '@/lib/constants';

export function Footer({ settings }: { settings: Record<string, any> }) {
  const contact = settings.contact || { phone: PHONE_NUMBER, email: 'acwallah95@gmail.com', address: 'Dwarka Mor, Delhi' };

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Wind className="w-6 h-6 text-accent" />
              </div>
              <span className="font-bold text-xl">AC In Delhi</span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Professional AC Installation, Repair & Maintenance at Your Doorstep in Delhi.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="/#services" className="hover:text-accent transition-colors">Services</Link></li>
              <li><Link href="/book" className="hover:text-accent transition-colors">Book Now</Link></li>
              <li><Link href="/track" className="hover:text-accent transition-colors">Track Booking</Link></li>
              <li><Link href="/#reviews" className="hover:text-accent transition-colors">Reviews</Link></li>
              <li><Link href="/#faq" className="hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Split AC Installation</li>
              <li>Window AC Installation</li>
              <li>AC Uninstall</li>
              <li>Gas Refill</li>
              <li>AC Cleaning</li>
              <li>AC Checking</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:text-accent transition-colors">{contact.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors break-all">{contact.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                {contact.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} AC In Delhi. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <Link href="/admin" className="hover:text-accent transition-colors">Admin Login</Link>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
