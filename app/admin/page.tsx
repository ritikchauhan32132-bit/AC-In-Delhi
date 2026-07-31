'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wind, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, loading, signIn } = useAuth();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) router.push('/admin/dashboard');
  }, [session, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setSubmitting(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient pt-20">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-premium p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-premium">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>Admin Login</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in to manage your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label className="mb-1.5 block">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
              </div>
              {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : <><Lock className="w-4 h-4 mr-2" /> Sign In</>}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Authorized personnel only. Contact support if you need access.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
