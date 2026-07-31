'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { PHONE_NUMBER, WHATSAPP_NUMBER } from '@/lib/constants';

export function Contact({ settings }: { settings: Record<string, any> }) {
  const contact = settings.contact || { phone: PHONE_NUMBER, email: 'acwallah95@gmail.com', whatsapp: WHATSAPP_NUMBER, address: 'Dwarka Mor, Delhi' };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Contact Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mt-2 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Get In Touch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions? Reach out to us through any of these channels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <a href={`tel:${contact.phone}`} className="glass rounded-2xl p-6 shadow-soft hover:shadow-premium transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">Call Us</h3>
                <p className="text-muted-foreground">{contact.phone}</p>
              </div>
            </a>

            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl p-6 shadow-soft hover:shadow-premium transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">WhatsApp</h3>
                <p className="text-muted-foreground">Chat with us instantly</p>
              </div>
            </a>

            <a href={`mailto:${contact.email}`} className="glass rounded-2xl p-6 shadow-soft hover:shadow-premium transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">Email Us</h3>
                <p className="text-muted-foreground break-all">{contact.email}</p>
              </div>
            </a>

            <div className="glass rounded-2xl p-6 shadow-soft flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">Service Area</h3>
                <p className="text-muted-foreground">{contact.address} (10 KM radius)</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 shadow-soft flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">Working Hours</h3>
                <p className="text-muted-foreground">Mon - Sun: 8:00 AM - 8:00 PM</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-premium min-h-[400px] glass"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.346!2d77.0318!3d28.6199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d04dfffffff%3A0x0!2sDwarka%20Mor%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dwarka Mor Service Area"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
