import { Hero } from '@/components/sections/hero';
import { Services } from '@/components/sections/services';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { HowItWorks } from '@/components/sections/how-it-works';
import { OfferBanner } from '@/components/sections/offer-banner';
import { Reviews } from '@/components/sections/reviews';
import { FAQ } from '@/components/sections/faq';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/site/footer';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

async function getData() {
  const [servicesRes, reviewsRes, settingsRes] = await Promise.all([
    supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('settings').select('key, value'),
  ]);

  const settings: Record<string, any> = {};
  settingsRes.data?.forEach((s) => (settings[s.key] = s.value));

  return {
    services: servicesRes.data || [],
    reviews: reviewsRes.data || [],
    settings,
  };
}

export default async function Home() {
  const { services, reviews, settings } = await getData();

  return (
    <>
      <Hero settings={settings} />
      <Services services={services} />
      <OfferBanner settings={settings} />
      <WhyChooseUs />
      <HowItWorks />
      <Reviews reviews={reviews} />
      <FAQ />
      <Contact settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
