'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Users, Award, Wallet, HeadphonesIcon } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Verified Technicians', desc: 'Background-checked, trained and certified AC service experts.' },
  { icon: Clock, title: 'On-Time Service', desc: 'Punctual arrivals within your preferred time slot, every time.' },
  { icon: Wallet, title: 'Transparent Pricing', desc: 'No hidden charges. What you see is what you pay.' },
  { icon: Award, title: 'Quality Guaranteed', desc: 'Service warranty on all installations and repairs.' },
  { icon: Users, title: '5000+ Happy Customers', desc: 'Trusted by thousands of households across Dwarka Mor.' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Call or WhatsApp us anytime for assistance.' },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            The AC In Delhi Advantage
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We deliver reliable, professional and affordable AC services right at your doorstep.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass rounded-2xl p-6 shadow-soft hover:shadow-premium transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-premium">
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
