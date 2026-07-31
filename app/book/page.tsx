'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, MapPin, Calendar as CalIcon, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, DWARKA_MOR, SERVICE_RADIUS_KM } from '@/lib/supabase';
import { AC_TYPES, TIME_SLOTS, type Service } from '@/lib/types';
import { GoogleMapsPicker } from '@/components/site/google-maps-picker';
import { format } from 'date-fns';

type ACItem = { ac_type: string; service: string; quantity: number; price: number };

export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Customer info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState('');

  // AC items
  const [items, setItems] = useState<ACItem[]>([{ ac_type: 'Split AC', service: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setServices(data);
      const slug = searchParams.get('service');
      if (slug && data) {
        const svc = data.find((s) => s.slug === slug);
        if (svc) {
          setItems([{ ac_type: 'Split AC', service: svc.name, quantity: 1, price: svc.price }]);
        }
      }
    });
  }, [searchParams]);

  const addItem = () => setItems([...items, { ac_type: 'Split AC', service: '', quantity: 1, price: 0 }]);
  const removeItem = (idx: number) => items.length > 1 && setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ACItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'service') {
      const svc = services.find((s) => s.name === value);
      updated[idx].price = svc?.price || 0;
    }
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validateStep1 = () => {
    if (items.some((i) => !i.service)) {
      setError('Please select a service for each AC item.');
      return false;
    }
    setError('');
    setStep(2);
  };

  const validateStep2 = () => {
    if (!name || !phone || !address) {
      setError('Please fill in your name, phone, and address.');
      return false;
    }
    if (distance === null || distance > SERVICE_RADIUS_KM) {
      setError('Please set your location within 10 KM of Dwarka Mor, Delhi to continue.');
      return false;
    }
    if (!date || !slot) {
      setError('Please select a preferred date and time slot.');
      return false;
    }
    setError('');
    setStep(3);
  };

  const generateBookingId = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const seq = String((count || 0) + 1).padStart(6, '0');
    return `ACD-${year}-${seq}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const bookingId = await generateBookingId();

      // Create or find customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      let customerId = existingCustomer?.id;
      if (!customerId) {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({ name, phone, email, address, latitude: lat, longitude: lng })
          .select('id')
          .single();
        customerId = newCustomer?.id;
      }

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_id: bookingId,
          customer_id: customerId,
          name,
          phone,
          email,
          address,
          latitude: lat,
          longitude: lng,
          distance_km: distance,
          preferred_date: date ? format(date, 'yyyy-MM-dd') : null,
          preferred_slot: slot,
          total_amount: total,
          status: 'pending',
        })
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      // Insert booking items
      const itemInserts = items.map((item) => ({
        booking_id: booking.id,
        ac_type: item.ac_type,
        service: item.service,
        quantity: item.quantity,
        price: item.price,
      }));
      await supabase.from('booking_items').insert(itemInserts);

      // Trigger email notification via edge function
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({
            type: 'booking_created',
            bookingId,
            name,
            phone,
            email,
            address,
            date: date ? format(date, 'yyyy-MM-dd') : '',
            slot,
            items,
            total,
          }),
        });
      } catch {}

      router.push(`/book/success?id=${bookingId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Book AC Service
          </h1>
          <p className="text-muted-foreground">Fill in the details below to book your AC service.</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-primary text-white shadow-premium' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass shadow-soft p-6">
                <h2 className="text-xl font-bold text-primary mb-4">Select AC Services</h2>
                {items.map((item, idx) => (
                  <div key={idx} className="glass rounded-xl p-4 mb-4 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-primary">AC #{idx + 1}</span>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="mb-1.5 block text-sm">AC Type</Label>
                        <Select value={item.ac_type} onValueChange={(v) => updateItem(idx, 'ac_type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {AC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm">Service</Label>
                        <Select value={item.service} onValueChange={(v) => updateItem(idx, 'service', v)}>
                          <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                          <SelectContent>
                            {services.map((s) => <SelectItem key={s.id} value={s.name}>{s.name} - ₹{s.price}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm">Quantity</Label>
                        <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} />
                      </div>
                    </div>
                    {item.service && (
                      <div className="mt-3 text-sm text-emerald-600 font-medium">
                        Subtotal: ₹{item.price * item.quantity}
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addItem} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Another AC
                </Button>
                <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-primary/5">
                  <span className="font-bold text-primary text-lg">Total Amount</span>
                  <span className="font-bold text-primary text-2xl">₹{total}</span>
                </div>
                {error && <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                <Button onClick={validateStep1} className="w-full mt-4 bg-primary hover:bg-primary/90">Continue</Button>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass shadow-soft p-6">
                <h2 className="text-xl font-bold text-primary mb-4">Your Details & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="mb-1.5 block">Full Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Mobile Number *</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" maxLength={10} />
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="mb-1.5 block">Email (optional)</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="mb-4">
                  <Label className="mb-1.5 block">Complete Address *</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House no, Street, Area, Delhi"
                  />
                </div>

                {/* Location picker - Google Maps */}
                <div className="mb-4">
                  <GoogleMapsPicker
                    onLocationSelect={(latVal, lngVal, addr, dist) => {
                      setLat(latVal);
                      setLng(lngVal);
                      setDistance(dist);
                      if (addr) setAddress(addr);
                    }}
                    initialAddress={address}
                    initialLat={lat}
                    initialLng={lng}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="mb-1.5 block">Preferred Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalIcon className="w-4 h-4 mr-2" />
                          {date ? format(date, 'dd MMM yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Preferred Time Slot *</Label>
                    <Select value={slot} onValueChange={setSlot}>
                      <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={validateStep2} className="flex-1 bg-primary hover:bg-primary/90">Continue</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass shadow-soft p-6">
                <h2 className="text-xl font-bold text-primary mb-4">Review & Confirm</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span className="font-medium">{phone}</span></div>
                  {email && <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{email}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Address:</span><span className="font-medium text-right max-w-[60%]">{address}</span></div>
                  {distance !== null && <div className="flex justify-between"><span className="text-muted-foreground">Distance:</span><span className="font-medium">{distance.toFixed(2)} KM</span></div>}
                  {date && <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-medium">{format(date, 'dd MMM yyyy')}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Time Slot:</span><span className="font-medium">{slot}</span></div>
                </div>
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold text-primary mb-2">AC Items</h3>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}x {item.ac_type} - {item.service}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 mb-4">
                  <span className="font-bold text-primary text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">₹{total}</span>
                </div>
                {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-accent hover:bg-accent/90 text-white">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : 'Confirm Booking'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
