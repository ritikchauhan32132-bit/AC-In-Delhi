'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Calendar, Wrench, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: MousePointerClick, title: 'Choose Service', desc: 'Select your AC type and the service you need from our catalog.' },
  { icon: Calendar, title: 'Pick Date & Slot', desc: 'Choose a preferred date and time slot that works for you.' },
  { icon: Wrench, title: 'Technician Arrives', desc: 'Our verified technician arrives at your doorstep on time.' },
  { icon: CheckCircle2, title: 'Service Done', desc: 'Get your AC serviced with quality guaranteed. Track anytime.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Book in 4 Simple Steps
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From booking to service completion, we make AC servicing effortless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative text-center"
            >
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-full bg-white shadow-premium flex items-center justify-center relative z-10">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center z-20 shadow-soft">
                  {idx + 1}
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
