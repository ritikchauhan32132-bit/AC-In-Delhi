'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, AlertCircle, MapPin, Calendar, Clock, Phone, Mail, ChevronRight, ArrowLeft, ExternalLink, Wrench, XCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STATUS_LABELS, STATUS_COLORS, type Booking, type BookingItem, type BookingStatus } from '@/lib/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CANCELLABLE_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

async function sendCancellationEmail(booking: Booking, items: BookingItem[]) {
  const servicesText = items.map((i) => `${i.quantity}x ${i.ac_type} - ${i.service}`).join(', ');
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        type: 'booking_cancelled',
        bookingId: booking.booking_id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        address: booking.address,
        servicesText,
        cancelTime: new Date().toISOString(),
        status: 'Cancelled',
      }),
    });
  } catch {}
}

export default function TrackPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [selectedItems, setSelectedItems] = useState<BookingItem[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleTrack = async () => {
    setLoading(true);
    setError('');
    setBookings([]);
    setSelected(null);
    setSelectedItems([]);
    setSearched(false);

    const trimmed = phone.trim();
    if (!/^[6-9]\d{9}$/.test(trimmed)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from('bookings')
      .select('*')
      .eq('phone', trimmed)
      .order('created_at', { ascending: false });

    setSearched(true);

    if (queryError || !data || data.length === 0) {
      setError('No booking found with this mobile number.');
      setLoading(false);
      return;
    }

    setBookings(data as Booking[]);
    setLoading(false);
  };

  const viewDetails = async (b: Booking) => {
    setSelected(b);
    const { data } = await supabase.from('booking_items').select('*').eq('booking_id', b.id);
    setSelectedItems(data || []);
  };

  const handleCancelBooking = async () => {
    if (!selected) return;
    setCancelling(true);
    setCancelError('');
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: now })
      .eq('id', selected.id);
    if (updateError) {
      setCancelError('Failed to cancel booking. Please try again or contact support.');
      setCancelling(false);
      return;
    }
    await sendCancellationEmail(selected, selectedItems);
    const updatedBooking = { ...selected, status: 'cancelled' as BookingStatus, updated_at: now };
    setSelected(updatedBooking);
    setBookings((prev) => prev.map((b) => (b.id === selected.id ? updatedBooking : b)));
    setShowCancelDialog(false);
    setCancelling(false);
    setCancelSuccess(true);
    setTimeout(() => setCancelSuccess(false), 5000);
  };

  const statusSteps = ['pending', 'confirmed', 'technician_assigned', 'on_the_way', 'work_started', 'completed'];

  const mapsLink = (b: Booking) =>
    b.latitude && b.longitude
      ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
      : `https://www.google.com/maps?q=${encodeURIComponent(b.address)}`;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Track Your Booking
          </h1>
          <p className="text-muted-foreground">Enter your registered mobile number to check your bookings.</p>
        </motion.div>

        {/* Search card - always visible at top */}
        <Card className="glass shadow-soft p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Mobile Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="98XXXXXXXX"
                maxLength={10}
              />
            </div>
            {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            <Button onClick={handleTrack} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tracking...</> : <><Search className="w-4 h-4 mr-2" /> Track Booking</>}
            </Button>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {/* Details view for a single booking */}
          {selected && (
            <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="glass shadow-soft p-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-primary mb-4 hover:text-secondary transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to bookings
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="text-xl font-bold text-primary">{selected.booking_id}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>

                {/* Status timeline */}
                {selected.status !== 'cancelled' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded" />
                      <div
                        className="absolute top-5 left-0 h-1 bg-primary rounded transition-all"
                        style={{ width: `${(statusSteps.indexOf(selected.status) / (statusSteps.length - 1)) * 100}%` }}
                      />
                      {statusSteps.map((s, idx) => (
                        <div key={s} className="relative z-10 flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusSteps.indexOf(selected.status) >= idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="text-[10px] text-center w-16 text-muted-foreground">{STATUS_LABELS[s as BookingStatus]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-secondary" />
                    <span>{selected.phone}</span>
                  </div>
                  {selected.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-secondary" />
                      <span className="truncate">{selected.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm md:col-span-2">
                    <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                    <span className="flex-1">{selected.address}</span>
                    <a href={mapsLink(selected)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary flex items-center gap-1 flex-shrink-0">
                      <ExternalLink className="w-3 h-3" /> Map
                    </a>
                  </div>
                  {selected.preferred_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span>{new Date(selected.preferred_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {selected.preferred_slot && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{selected.preferred_slot}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>Booked: {format(new Date(selected.created_at), 'dd MMM yyyy')}</span>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2"><Wrench className="w-4 h-4" /> Service Items</h3>
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span>{item.quantity}x {item.ac_type} - {item.service}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-primary mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{selected.total_amount}</span>
                    </div>
                  </div>
                )}

                {selected.technician_name && (
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">
                    Assigned Technician: <strong>{selected.technician_name}</strong>
                  </div>
                )}

                {selected.admin_notes && (
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                    <strong>Note:</strong> {selected.admin_notes}
                  </div>
                )}

                {/* Cancellation section */}
                {cancelSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Your booking has been cancelled successfully.
                  </div>
                )}
                {cancelError && (
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {cancelError}
                  </div>
                )}
                {CANCELLABLE_STATUSES.includes(selected.status) ? (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                  </Button>
                ) : selected.status === 'cancelled' ? null : (
                  <div className="p-3 rounded-lg bg-muted text-muted-foreground text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> This booking can no longer be cancelled because the service has already been assigned or started.
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* List view for multiple bookings */}
          {!selected && bookings.length > 0 && (
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">
                {bookings.length} booking{bookings.length > 1 ? 's' : ''} found for {phone}
              </p>
              {bookings.map((b) => (
                <Card key={b.id} className="glass shadow-soft p-4 hover:shadow-premium transition-all cursor-pointer" onClick={() => viewDetails(b)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary">{b.booking_id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booked on {format(new Date(b.created_at), 'dd MMM yyyy')}
                      </p>
                      {b.preferred_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service date: {new Date(b.preferred_date).toLocaleDateString('en-IN')} {b.preferred_slot}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* No results */}
          {!selected && searched && bookings.length === 0 && !loading && !error && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass shadow-soft p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No booking found with this mobile number.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancellation confirmation dialog */}
        <Dialog open={showCancelDialog} onOpenChange={(open) => { setShowCancelDialog(open); if (!open) setCancelError(''); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" /> Cancel Booking?
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {cancelError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {cancelError}
              </div>
            )}
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1"
              >
                No, Keep Booking
              </Button>
              <Button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {cancelling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</> : 'Yes, Cancel Booking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
