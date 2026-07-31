import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_ADMIN_EMAIL = "acwallah95@gmail.com";

function buildEmailHtml(type: string, data: any): string {
  const itemsHtml = (data.items || []).map((i: any) => `<div class="item"><span>${i.quantity}x ${i.ac_type} - ${i.service}</span><span>₹${i.price * i.quantity}</span></div>`).join('');

  if (type === 'booking_created') {
    return `<html><body><div class="container"><div class="header"><h1>AC In Delhi</h1></div><div class="content"><h2>Booking Confirmed! <span class="badge">${data.bookingId}</span></h2><p>Dear ${data.name},</p><p>Your AC service booking has been received successfully. Here are the details:</p><div class="info"><p><span class="label">Booking ID:</span> ${data.bookingId}</p><p><span class="label">Name:</span> ${data.name}</p><p><span class="label">Phone:</span> ${data.phone}</p>${data.email ? `<p><span class="label">Email:</span> ${data.email}</p>` : ''}<p><span class="label">Address:</span> ${data.address}</p><p><span class="label">Date:</span> ${data.date}</p><p><span class="label">Time Slot:</span> ${data.slot}</p></div><div class="items">${itemsHtml}</div><div class="total">Total: ₹${data.total}</div><p>Track your booking on our website using your mobile number.</p></div><div class="footer">AC In Delhi - Professional AC Service at Your Doorstep<br>Phone: 7814410991 | Email: acwallah95@gmail.com</div></div></body></html>`;
  }

  if (type === 'status_update') {
    return `<html><body><div class="container"><div class="header"><h1>AC In Delhi</h1></div><div class="content"><h2>Booking Status Updated <span class="badge">${data.bookingId}</span></h2><p>Dear ${data.name},</p><p>Your booking status has been updated to:</p><div class="info"><p><span class="label">Booking ID:</span> ${data.bookingId}</p><p><span class="label">New Status:</span> <strong>${data.status}</strong></p></div><p>Track your booking on our website using your mobile number.</p></div><div class="footer">AC In Delhi - Professional AC Service at Your Doorstep<br>Phone: 7814410991 | Email: acwallah95@gmail.com</div></div></body></html>`;
  }

  if (type === 'booking_cancelled') {
    const cancelTime = data.cancelTime ? new Date(data.cancelTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return `<html><body><div class="container"><div class="header"><h1>AC In Delhi</h1></div><div class="content"><h2>Booking Cancelled <span class="badge">${data.bookingId}</span></h2><p>Dear ${data.name},</p><p>Your booking has been <strong>cancelled</strong> as per your request. Here are the cancellation details:</p><div class="info"><p><span class="label">Booking ID:</span> ${data.bookingId}</p><p><span class="label">Customer Name:</span> ${data.name}</p><p><span class="label">Mobile Number:</span> ${data.phone}</p><p><span class="label">Service(s):</span> ${data.servicesText || itemsHtml || 'N/A'}</p><p><span class="label">Cancellation Time:</span> ${cancelTime}</p><p><span class="label">Booking Status:</span> <strong style="color:#e11d48">Cancelled</strong></p></div><p>If you did not request this cancellation or believe this is an error, please contact us immediately.</p></div><div class="footer">AC In Delhi - Professional AC Service at Your Doorstep<br>Phone: 7814410991 | Email: acwallah95@gmail.com</div></div></body></html>`;
  }

  return `<html><body><div class="container"><div class="header"><h1>AC In Delhi</h1></div><div class="content"><h2>Notification</h2><p>${JSON.stringify(data)}</p></div></div></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email to", to);
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "AC In Delhi <noreply@acindelhi.com>", to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Email send failed:", err);
    return { error: err };
  }
  return { success: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { type, bookingId, name, phone, email, address, date, slot, items, total, status, cancelTime, servicesText } = await req.json();

    // Get configurable admin notification email from settings
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: adminSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_notification')
      .maybeSingle();
    const adminEmail = adminSetting?.value?.email || DEFAULT_ADMIN_EMAIL;

    const emailData = { bookingId, name, phone, email, address, date, slot, items, total, status, cancelTime, servicesText };
    const html = buildEmailHtml(type, emailData);

    const subject = type === 'booking_created'
      ? `Booking Confirmed - ${bookingId} - AC In Delhi`
      : type === 'booking_cancelled'
      ? `Booking Cancelled - ${bookingId} - AC In Delhi`
      : `Booking Update - ${bookingId} - AC In Delhi`;

    // Send to customer if email provided
    if (email) {
      await sendEmail(email, subject, html);
    }

    // Always send to admin (configurable)
    await sendEmail(adminEmail, `[Admin] ${subject}`, html);

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
