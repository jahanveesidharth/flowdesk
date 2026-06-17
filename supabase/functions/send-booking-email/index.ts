/* eslint-disable */
// @ts-nocheck
/**
 * Supabase Edge Function: send-booking-email
 *
 * Triggered by a database webhook on bookings INSERT/UPDATE.
 * Uses Resend (free tier: 3000 emails/month) for transactional email.
 *
 * Deploy with:
 *   supabase functions deploy send-booking-email
 *
 * Set secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')  || '';
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')    || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const FROM_EMAIL      = 'DeskFlow <noreply@yourdomain.com>';  // Change this

serve(async (req) => {
  const payload = await req.json();
  const { type, record, old_record } = payload;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', record.user_id)
    .single();

  if (!profile?.email) return new Response('No profile', { status: 200 });

  // Check user preferences for email reminders
  const { data: prefs } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', record.user_id)
    .single();

  const emailReminders = (prefs?.preferences as Record<string, unknown>)?.emailReminders !== false;
  if (!emailReminders) return new Response('Reminders disabled', { status: 200 });

  let subject = '';
  let html    = '';

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t: string) => t.slice(0, 5);

  // Determine email type
  if (type === 'INSERT' && record.status === 'confirmed') {
    subject = `✅ Booking Confirmed – ${record.resource_type} on ${formatDate(record.date)}`;
    html = bookingConfirmationEmail(profile.name, record, formatDate, formatTime);
  } else if (type === 'UPDATE' && record.status === 'cancelled' && old_record?.status !== 'cancelled') {
    subject = `❌ Booking Cancelled – ${formatDate(record.date)}`;
    html = bookingCancelledEmail(profile.name, record, formatDate, formatTime);
  } else if (type === 'UPDATE' && record.status === 'checked_in') {
    // No email for check-in, handle via push notification instead
    return new Response('OK', { status: 200 });
  } else {
    return new Response('No email needed', { status: 200 });
  }

  // Send via Resend (free tier)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [profile.email],
      subject,
      html,
    }),
  });

  const result = await res.json();
  return new Response(JSON.stringify(result), { status: 200 });
});

function bookingConfirmationEmail(
  name: string,
  booking: Record<string, string>,
  fmt: (d: string) => string,
  fmtTime: (t: string) => string,
) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Inter, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: #f04a16; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🎉 Booking Confirmed!</h1>
      </div>
      <div style="padding: 28px;">
        <p style="color: #374151; font-size: 16px;">Hi ${name},</p>
        <p style="color: #6b7280;">Your booking has been confirmed.</p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #9ca3af; font-size: 13px; padding: 6px 0;">Resource</td><td style="color: #111827; font-weight: 600; text-transform: capitalize;">${booking.resource_type}</td></tr>
            <tr><td style="color: #9ca3af; font-size: 13px; padding: 6px 0;">Date</td><td style="color: #111827; font-weight: 600;">${fmt(booking.date)}</td></tr>
            <tr><td style="color: #9ca3af; font-size: 13px; padding: 6px 0;">Time</td><td style="color: #111827; font-weight: 600;">${fmtTime(booking.start_time)} – ${fmtTime(booking.end_time)}</td></tr>
            ${booking.title ? `<tr><td style="color: #9ca3af; font-size: 13px; padding: 6px 0;">Title</td><td style="color: #111827;">${booking.title}</td></tr>` : ''}
          </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Remember to check in within the check-in window. No-shows are auto-released after 30 minutes.</p>
        <a href="${Deno.env.get('APP_URL') || 'https://yourapp.com'}/my-bookings" style="display: inline-block; background: #f04a16; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; margin-top: 12px;">
          View My Bookings →
        </a>
      </div>
      <div style="padding: 16px 28px; background: #f9fafb; border-top: 1px solid #f3f4f6;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">DeskFlow — Your office, organised. <a href="#" style="color: #9ca3af;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
  </html>`;
}

function bookingCancelledEmail(
  name: string,
  booking: Record<string, string>,
  fmt: (d: string) => string,
  fmtTime: (t: string) => string,
) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Inter, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: #ef4444; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Booking Cancelled</h1>
      </div>
      <div style="padding: 28px;">
        <p style="color: #374151;">Hi ${name},</p>
        <p style="color: #6b7280;">Your booking for ${fmt(booking.date)} has been cancelled.</p>
        ${booking.cancel_reason ? `<div style="background: #fef2f2; border-radius: 8px; padding: 12px; margin: 16px 0; color: #991b1b; font-size: 14px;">Reason: ${booking.cancel_reason}</div>` : ''}
        <a href="${Deno.env.get('APP_URL') || 'https://yourapp.com'}/floor-map" style="display: inline-block; background: #f04a16; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600;">
          Book a New Space →
        </a>
      </div>
    </div>
  </body>
  </html>`;
}
