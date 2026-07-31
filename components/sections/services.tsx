'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wind, Flame, Sparkles, Wrench, ArrowRight, Check } from 'lucide-react';
import type { Service } from '@/lib/types';

const iconMap: Record<string, any> = { Wind, Flame, Sparkles, Wrench };

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            AC Services We Offer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional AC services with transparent pricing. All services include a 10% discount on the displayed MRP.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = iconMap[service.icon || 'Wind'] || Wind;
            const mrp = Math.round(service.price / 0.9);
            const discount = mrp - service.price;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="group glass overflow-hidden border-0 shadow-soft hover:shadow-premium transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:scale-110 transition-transform duration-500" />
                    <Icon className="w-20 h-20 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-soft">
                      10% OFF
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-bold text-foreground">₹{service.price}</span>
                      <span className="text-lg text-muted-foreground line-through">₹{mrp}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-sm text-emerald-600">
                      <Check className="w-4 h-4" />
                      Save ₹{discount} on this service
                    </div>
                    <Link href={`/book?service=${service.slug}`} className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90 group">
                        Book This Service
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
