'use client';

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Which areas do you serve in Delhi?', a: 'We currently provide AC services within a 10 KM radius of Dwarka Mor, Delhi. You can check service availability using our location picker during booking.' },
  { q: 'How do I book an AC service?', a: 'Simply click the Book Now button, select your AC type and service, pick a date and time slot, enter your address and location, and confirm. You will receive a Booking ID instantly.' },
  { q: 'How can I track my booking?', a: 'Go to the Track Booking page, enter your mobile number and Booking ID. You will see the current status of your booking without needing any OTP.' },
  { q: 'Do you offer any discounts?', a: 'Yes! Every service has a 10% discount on the displayed MRP. The offer runs in cycles with a countdown timer. The final payable amount equals the original service price.' },
  { q: 'Can I book service for multiple ACs?', a: 'Absolutely. Use the "Add Another AC" button during booking to add multiple ACs with different services and quantities, all under a single booking.' },
  { q: 'What payment methods do you accept?', a: 'Currently, we accept cash and UPI payments after the service is completed. Online payment integration is coming soon.' },
  { q: 'Is there a warranty on the service?', a: 'Yes, all our installations and repairs come with a service warranty. If you face any issue related to the service within the warranty period, we will fix it free of cost.' },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">Got questions? We have answers.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="glass rounded-2xl px-6 shadow-soft border-0"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
