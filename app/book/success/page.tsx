'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || '';
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 shadow-premium text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your AC service booking has been placed successfully. A confirmation email has been sent.
          </p>

          <div className="bg-primary/5 rounded-2xl p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Booking ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-primary tracking-wider">{bookingId}</span>
              <button onClick={copyId} className="text-primary hover:text-secondary transition-colors">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-sm text-amber-700">
            Please save your Booking ID. You can track your booking status using this ID and your mobile number.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/track" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">Track Booking</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
