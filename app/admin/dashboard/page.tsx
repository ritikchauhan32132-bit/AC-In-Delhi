'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LayoutDashboard, Calendar, Users, Star, Wrench, Tag, BarChart3, Settings,
  LogOut, Search, Trash2, Edit, Eye, Check, X, Plus, Download, TrendingUp,
  DollarSign, Clock, CheckCircle2, Phone, Mail, MapPin, Wind, Bell, ExternalLink,
  Save, BadgeCheck, Menu
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { STATUS_LABELS, STATUS_COLORS, type Booking, type Review, type Service, type BookingStatus } from '@/lib/types';
import { format } from 'date-fns';

type Tab = 'dashboard' | 'bookings' | 'customers' | 'reviews' | 'services' | 'offers' | 'analytics' | 'notifications' | 'settings';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function sendStatusEmail(booking: Booking, status: BookingStatus) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        type: 'status_update',
        bookingId: booking.booking_id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        address: booking.address,
        status: STATUS_LABELS[status],
      }),
    });
  } catch { }
}

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin');
  };

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-primary text-white z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AC In Delhi</h1>
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === item.id ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <Button onClick={handleSignOut} variant="ghost" className="w-full mt-8 text-white/70 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b">
          <button
            className="p-2 bg-blue-500 rounded-lg"
            onClick={() => {
              alert("MENU CLICK");
              setSidebarOpen(true);
            }}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-lg font-bold text-primary capitalize">{tab}</h2>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {tab === 'dashboard' && <DashboardView />}
              {tab === 'bookings' && <BookingsView />}
              {tab === 'customers' && <CustomersView />}
              {tab === 'reviews' && <ReviewsView />}
              {tab === 'services' && <ServicesView />}
              {tab === 'offers' && <OffersView />}
              {tab === 'analytics' && <AnalyticsView />}
              {tab === 'notifications' && <NotificationsView />}
              {tab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView() {
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, completed: 0, revenue: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count: total } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { count: todayCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', today);
      const { count: pending } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'technician_assigned', 'on_the_way', 'work_started']);
      const { count: completed } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { data: completedBookings } = await supabase.from('bookings').select('total_amount').eq('status', 'completed');
      const revenue = completedBookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
      const { data: recentData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5);
      setStats({ total: total || 0, today: todayCount || 0, pending: pending || 0, completed: completed || 0, revenue });
      setRecent(recentData || []);
    })();
  }, []);

  const cards = [
    { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: "Today's Bookings", value: stats.today, icon: Clock, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Pending Jobs', value: stats.pending, icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
    { label: 'Completed Jobs', value: stats.completed, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-primary to-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="glass shadow-soft p-5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-primary">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Card>
        ))}
      </div>

      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">Recent Bookings</h3>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm text-primary">{b.booking_id}</p>
                  <p className="text-xs text-muted-foreground">{b.name} - {b.phone}</p>
                </div>
                <Badge className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// --- Bookings View ---
function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    if (search) q = q.or(`booking_id.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
    const { data } = await q.limit(100);
    setBookings(data || []);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const viewBooking = async (b: Booking) => {
    setSelected(b);
    const { data } = await supabase.from('booking_items').select('*').eq('booking_id', b.id);
    setItems(data || []);
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    setSaving(true);
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    const updated = bookings.find(b => b.id === id);
    if (updated) {
      await sendStatusEmail(updated, status);
    }
    await load();
    if (selected?.id === id) {
      setSelected({ ...selected, status });
      await viewBooking({ ...selected, status });
    }
    setSaving(false);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    await supabase.from('bookings').delete().eq('id', id);
    load();
    setSelected(null);
  };

  const saveTechnician = async (id: string, name: string) => {
    await supabase.from('bookings').update({ technician_name: name, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const saveNotes = async (id: string, notes: string) => {
    await supabase.from('bookings').update({ admin_notes: notes, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const exportCSV = () => {
    const headers = ['Booking ID', 'Name', 'Phone', 'Email', 'Address', 'Date', 'Slot', 'Status', 'Total'];
    const rows = bookings.map(b => [b.booking_id, b.name, b.phone, b.email || '', b.address, b.preferred_date || '', b.preferred_slot || '', b.status, b.total_amount]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookings.csv'; a.click();
  };

  const mapsLink = (b: Booking) =>
    b.latitude && b.longitude
      ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
      : `https://www.google.com/maps?q=${encodeURIComponent(b.address)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, phone..." className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={exportCSV} variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      <Card className="glass shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">Booking ID</th>
                <th className="text-left p-3 font-semibold">Customer</th>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Total</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium text-primary">{b.booking_id}</td>
                  <td className="p-3"><div>{b.name}</div><div className="text-xs text-muted-foreground">{b.phone}</div></td>
                  <td className="p-3">{b.preferred_date ? format(new Date(b.preferred_date), 'dd MMM') : '-'}<div className="text-xs text-muted-foreground">{b.preferred_slot || ''}</div></td>
                  <td className="p-3"><Badge className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</Badge></td>
                  <td className="p-3 font-medium">₹{b.total_amount}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => viewBooking(b)} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => deleteBooking(b.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Booking Details - {selected.booking_id}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <strong>{selected.name}</strong></div>
                <div><span className="text-muted-foreground">Phone:</span> <strong>{selected.phone}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> <strong>{selected.email || '-'}</strong></div>
                <div><span className="text-muted-foreground">Distance:</span> <strong>{selected.distance_km?.toFixed(2) || '-'} KM</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <strong>{selected.address}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>{selected.preferred_date ? format(new Date(selected.preferred_date), 'dd MMM yyyy') : '-'}</strong></div>
                <div><span className="text-muted-foreground">Slot:</span> <strong>{selected.preferred_slot || '-'}</strong></div>
                <div><span className="text-muted-foreground">Total:</span> <strong>₹{selected.total_amount}</strong></div>
                <div><span className="text-muted-foreground">Booked On:</span> <strong>{format(new Date(selected.created_at), 'dd MMM yyyy, hh:mm a')}</strong></div>
              </div>

              {/* Google Maps link */}
              <a href={mapsLink(selected)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary font-medium">
                <ExternalLink className="w-4 h-4" /> Open Customer Location in Google Maps
              </a>

              <div>
                <h4 className="font-semibold text-primary mb-2">AC Items</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b">
                    <span>{item.quantity}x {item.ac_type} - {item.service}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div>
                <Label className="mb-2 block">Update Status</Label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as BookingStatus)} disabled={saving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                {saving && <p className="text-xs text-muted-foreground mt-1">Saving & sending email notification...</p>}
              </div>
              <div>
                <Label className="mb-2 block">Technician Name</Label>
                <Input
                  defaultValue={selected.technician_name || ''}
                  onBlur={(e) => saveTechnician(selected.id, e.target.value)}
                  placeholder="Assign technician"
                />
              </div>
              <div>
                <Label className="mb-2 block">Admin Notes</Label>
                <Textarea
                  defaultValue={selected.admin_notes || ''}
                  onBlur={(e) => saveNotes(selected.id, e.target.value)}
                  placeholder="Internal notes..."
                />
              </div>
              <Button onClick={() => window.print()} variant="outline" className="w-full">Print Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// --- Customers View ---
function CustomersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let q = supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    q.limit(100).then(({ data }) => setCustomers(data || []));
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="pl-10 max-w-md" />
      </div>
      <Card className="glass shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Email</th><th className="text-left p-3">Address</th><th className="text-left p-3">Joined</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium text-primary">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.email || '-'}</td>
                  <td className="p-3 max-w-xs truncate">{c.address || '-'}</td>
                  <td className="p-3">{format(new Date(c.created_at), 'dd MMM yyyy')}</td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// --- Reviews View ---
function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(100);
    setReviews(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    await supabase.from('reviews').update({ is_approved: approved }).eq('id', id);
    load();
  };
  const toggleVerified = async (id: string, verified: boolean) => {
    await supabase.from('reviews').update({ is_verified: verified }).eq('id', id);
    load();
  };
  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <Card key={r.id} className="glass shadow-soft p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-primary">{r.name}</span>
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-accent text-accent' : 'text-muted'}`} />)}</div>
                {r.is_approved ? <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge> : <Badge className="bg-amber-100 text-amber-700">Pending</Badge>}
                {r.is_verified && <Badge className="bg-blue-100 text-blue-700">Verified</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{r.review}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'dd MMM yyyy')}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggleApproval(r.id, !r.is_approved)} className="p-2 rounded hover:bg-emerald-50 text-emerald-600" title={r.is_approved ? 'Unapprove' : 'Approve'}>
                {r.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => toggleVerified(r.id, !r.is_verified)} className="p-2 rounded hover:bg-blue-50 text-blue-600" title="Toggle verified">
                <BadgeCheck className="w-4 h-4" />
              </button>
              <button onClick={() => deleteReview(r.id)} className="p-2 rounded hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </Card>
      ))}
      {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews yet.</p>}
    </div>
  );
}

// --- Services View ---
function ServicesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('services').update({ is_active: active }).eq('id', id);
    load();
  };
  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreating(true)} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} className="glass shadow-soft p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-primary">{s.name}</h3>
                <p className="text-lg font-bold">₹{s.price}</p>
              </div>
              <Switch checked={s.is_active} onCheckedChange={(v) => toggleActive(s.id, v)} />
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(s)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => deleteService(s.id)} className="text-rose-500"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {(editing || creating) && (
        <ServiceDialog
          service={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={async (data) => {
            if (editing) {
              await supabase.from('services').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id);
            } else {
              await supabase.from('services').insert({ ...data, slug: data.name.toLowerCase().replace(/\s+/g, '-') });
            }
            load();
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ServiceDialog({ service, onClose, onSave }: { service: Service | null; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(service?.name || '');
  const [price, setPrice] = useState(service?.price || 0);
  const [category, setCategory] = useState(service?.category || 'general');
  const [description, setDescription] = useState(service?.description || '');
  const [icon, setIcon] = useState(service?.icon || 'Wind');
  const [sortOrder, setSortOrder] = useState(service?.sort_order || 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{service ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Price (₹)</Label><Input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} /></div>
            <div><Label className="mb-1.5 block">Category</Label>
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="installation">Installation</SelectItem><SelectItem value="uninstall">Uninstall</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="general">General</SelectItem>
              </SelectContent></Select>
            </div>
          </div>
          <div><Label className="mb-1.5 block">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Icon</Label>
              <Select value={icon} onValueChange={setIcon}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="Wind">Wind</SelectItem><SelectItem value="Flame">Flame</SelectItem><SelectItem value="Sparkles">Sparkles</SelectItem><SelectItem value="Wrench">Wrench</SelectItem>
              </SelectContent></Select>
            </div>
            <div><Label className="mb-1.5 block">Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} /></div>
          </div>
          <Button onClick={() => onSave({ name, price, category, description, icon, sort_order: sortOrder, is_active: true })} className="w-full bg-primary">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Offers View ---
function OffersView() {
  const [offer, setOffer] = useState({ enabled: true, activeDurationHours: 6, gapDurationHours: 48 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'offer').maybeSingle().then(({ data }) => {
      if (data?.value) setOffer(data.value);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from('settings').update({ value: offer, updated_at: new Date().toISOString() }).eq('key', 'offer');
    setSaving(false);
  };

  return (
    <Card className="glass shadow-soft p-6 max-w-lg">
      <h3 className="font-bold text-primary mb-4">Offer Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Offers</Label>
          <Switch checked={offer.enabled} onCheckedChange={(v) => setOffer({ ...offer, enabled: v })} />
        </div>
        <div><Label className="mb-1.5 block">Active Duration (hours)</Label><Input type="number" value={offer.activeDurationHours} onChange={(e) => setOffer({ ...offer, activeDurationHours: parseInt(e.target.value) || 6 })} /></div>
        <div><Label className="mb-1.5 block">Gap Duration (hours)</Label><Input type="number" value={offer.gapDurationHours} onChange={(e) => setOffer({ ...offer, gapDurationHours: parseInt(e.target.value) || 48 })} /></div>
        <Button onClick={save} disabled={saving} className="w-full bg-primary">{saving ? 'Saving...' : 'Save Settings'}</Button>
      </div>
    </Card>
  );
}

// --- Analytics View ---
function AnalyticsView() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    (async () => {
      const { data: bookings } = await supabase.from('bookings').select('status, total_amount, created_at');
      const { data: services } = await supabase.from('booking_items').select('service, quantity');
      const { data: customers } = await supabase.from('customers').select('*');

      const totalRevenue = bookings?.filter((b: any) => b.status === 'completed').reduce((s: number, b: any) => s + b.total_amount, 0) || 0;
      const topServices: Record<string, number> = {};
      services?.forEach((s: any) => { topServices[s.service] = (topServices[s.service] || 0) + s.quantity; });
      const topServicesArr = Object.entries(topServices).sort((a, b) => b[1] - a[1]).slice(0, 5);

      const last7Days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        last7Days[key] = 0;
      }
      bookings?.forEach((b: any) => {
        const key = b.created_at.split('T')[0];
        if (key in last7Days) last7Days[key]++;
      });

      setData({ totalRevenue, topServices: topServicesArr, totalCustomers: customers?.length || 0, last7Days });
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass shadow-soft p-5"><DollarSign className="w-8 h-8 text-primary mb-2" /><p className="text-2xl font-bold text-primary">₹{data.totalRevenue?.toLocaleString('en-IN') || 0}</p><p className="text-sm text-muted-foreground">Total Revenue</p></Card>
        <Card className="glass shadow-soft p-5"><Users className="w-8 h-8 text-secondary mb-2" /><p className="text-2xl font-bold text-primary">{data.totalCustomers || 0}</p><p className="text-sm text-muted-foreground">Total Customers</p></Card>
        <Card className="glass shadow-soft p-5"><TrendingUp className="w-8 h-8 text-accent mb-2" /><p className="text-2xl font-bold text-primary">{Object.values(data.last7Days || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)}</p><p className="text-sm text-muted-foreground">Bookings (7 days)</p></Card>
      </div>

      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">Top Services</h3>
        {data.topServices?.length ? data.topServices.map(([name, count]: any) => (
          <div key={name} className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">{name}</span>
            <Badge className="bg-primary/10 text-primary">{count} bookings</Badge>
          </div>
        )) : <p className="text-muted-foreground text-sm">No data yet.</p>}
      </Card>

      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">Bookings - Last 7 Days</h3>
        <div className="flex items-end gap-2 h-40">
          {Object.entries(data.last7Days || {}).map(([date, count]: any) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all" style={{ height: `${count * 40 + 4}px` }} />
              <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- Notifications View ---
function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_id, name, phone, status, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(20);
      const notifs = (bookings || []).map((b: any) => ({
        id: b.booking_id,
        title: `Booking ${b.booking_id} - ${STATUS_LABELS[b.status as BookingStatus]}`,
        message: `${b.name} (${b.phone}) - Status: ${STATUS_LABELS[b.status as BookingStatus]}`,
        time: b.updated_at,
        status: b.status,
      }));
      setNotifications(notifs);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="glass shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-primary">Recent Activity</h3>
        </div>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${n.status === 'completed' ? 'bg-emerald-500' : n.status === 'cancelled' ? 'bg-rose-500' : 'bg-primary'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.time), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// --- Settings View ---
function SettingsView() {
  const [contact, setContact] = useState({ phone: '', email: '', whatsapp: '', address: '' });
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '' });
  const [adminEmail, setAdminEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      data?.forEach((s) => {
        if (s.key === 'contact') setContact(s.value);
        if (s.key === 'seo') setSeo(s.value);
        if (s.key === 'admin_notification') setAdminEmail(s.value?.email || '');
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from('settings').update({ value: contact, updated_at: new Date().toISOString() }).eq('key', 'contact'),
      supabase.from('settings').update({ value: seo, updated_at: new Date().toISOString() }).eq('key', 'seo'),
      supabase.from('settings').update({ value: { email: adminEmail }, updated_at: new Date().toISOString() }).eq('key', 'admin_notification'),
    ]);
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Phone</Label><Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">Support Email</Label><Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">WhatsApp Number</Label><Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">Address</Label><Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
        </div>
      </Card>
      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">Admin Notification Email</h3>
        <p className="text-sm text-muted-foreground mb-3">Booking notifications and status updates are sent to this email address.</p>
        <div><Label className="mb-1.5 block">Admin Email</Label><Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" /></div>
      </Card>
      <Card className="glass shadow-soft p-6">
        <h3 className="font-bold text-primary mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Meta Title</Label><Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">Meta Description</Label><Textarea value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">Keywords</Label><Input value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} /></div>
        </div>
      </Card>
      <Button onClick={save} disabled={saving} className="w-full bg-primary">
        {saving ? <><Clock className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save All Settings</>}
      </Button>
    </div>
  );
}
