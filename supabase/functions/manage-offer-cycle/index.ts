import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get offer settings
    const { data: offerSetting } = await supabase.from('settings').select('value').eq('key', 'offer').maybeSingle();
    const offer = offerSetting?.value || { enabled: true, activeDurationHours: 6, gapDurationHours: 48 };

    if (!offer.enabled) {
      return new Response(JSON.stringify({ message: "Offers disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get latest cycle
    const { data: latest } = await supabase
      .from('offer_cycles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();

    if (!latest) {
      // Create first cycle
      await supabase.from('offer_cycles').insert({
        start_at: now.toISOString(),
        end_at: new Date(now.getTime() + offer.activeDurationHours * 3600000).toISOString(),
        is_active: true,
      });
    } else {
      const endAt = new Date(latest.end_at);
      if (now > endAt) {
        // Current cycle ended, check if gap has passed
        const nextStart = new Date(endAt.getTime() + offer.gapDurationHours * 3600000);
        if (now >= nextStart) {
          // Start new cycle
          await supabase.from('offer_cycles').insert({
            start_at: now.toISOString(),
            end_at: new Date(now.getTime() + offer.activeDurationHours * 3600000).toISOString(),
            is_active: true,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
