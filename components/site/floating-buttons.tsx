'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';
import { PHONE_NUMBER, WHATSAPP_NUMBER } from '@/lib/constants';

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-primary text-white shadow-premium flex items-center justify-center hover:scale-110 transition-transform animate-fade-in"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20AC%20In%20Delhi,%20I%20want%20to%20book%20an%20AC%20service.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-premium flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-premium flex items-center justify-center hover:scale-110 transition-transform animate-float"
          aria-label="Call"
        >
          <Phone className="w-7 h-7" />
        </a>
      </div>
    </>
  );
}
