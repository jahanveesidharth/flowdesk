/* eslint-disable */
// @ts-nocheck
/**
 * Supabase Edge Function: send-booking-reminder
 *
 * Invoked periodically (via pg_cron or external scheduler).
 * Fetches pending reminders atomically using the `process_booking_reminders()` database function,
 * and sends email notifications to users using Resend.
 *
 * Deploy with:
 *   supabase functions deploy send-booking-reminder
 *
 * Set secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase secrets set APP_URL=https://your-app.vercel.app
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')  || '';
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')    || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const FROM_EMAIL      = Deno.env.get('FROM_EMAIL')      || 'DeskFlow <onboarding@resend.dev>';

interface BookingReminderRow {
  out_id: string;
  out_date: string;
  out_start_time: string;
  out_end_time: string;
  out_title: string | null;
  out_resource_type: string;
  out_resource_id: string;
  out_user_name: string;
  out_user_email: string;
  out_building_name: string | null;
  out_floor_name: string | null;
  out_resource_name: string | null;
}

interface EmailTemplateProps {
  userName: string;
  resourceType: string;
  resourceName: string;
  dateStr: string;
  timeStr: string;
  location: string;
  title?: string;
  appUrl: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables.');
    return new Response(JSON.stringify({ error: 'Missing environment configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Invoke RPC function to atomically query and flag pending reminders
  const { data: bookings, error: rpcError } = await supabase.rpc('process_booking_reminders');

  if (rpcError) {
    console.error('Error calling process_booking_reminders RPC:', rpcError);
    return new Response(JSON.stringify({ error: rpcError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ message: 'No pending reminders to process.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`Processing ${bookings.length} booking reminders...`);
  const results = [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t: string) => t.slice(0, 5);

  for (const booking of (bookings as BookingReminderRow[])) {
    const {
      out_id,
      out_date,
      out_start_time,
      out_end_time,
      out_title,
      out_resource_type,
      out_resource_name,
      out_user_name,
      out_user_email,
      out_building_name,
      out_floor_name,
    } = booking;

    const locationText = out_building_name && out_floor_name
      ? `${out_floor_name}, ${out_building_name}`
      : (out_building_name || out_floor_name || 'N/A');

    const subject = `⏰ Booking Reminder: Your ${out_resource_type} starts in 30 minutes!`;
    const html = bookingReminderEmail({
      userName: out_user_name,
      resourceType: out_resource_type,
      resourceName: out_resource_name || `Unnamed ${out_resource_type}`,
      dateStr: formatDate(out_date),
      timeStr: `${formatTime(out_start_time)} – ${formatTime(out_end_time)}`,
      location: locationText,
      title: out_title || undefined,
      appUrl: Deno.env.get('APP_URL') || 'https://yourapp.com',
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [out_user_email],
          subject,
          html,
        }),
      });

      const resBody = await res.json();
      if (!res.ok) {
        console.error(`Resend API returned error for booking ${out_id}:`, resBody);
        results.push({ bookingId: out_id, status: 'failed', error: resBody });
      } else {
        console.log(`Successfully sent email to ${out_user_email} for booking ${out_id}`);
        results.push({ bookingId: out_id, status: 'sent', emailId: resBody.id });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Exception occurred while sending reminder for booking ${out_id}:`, err);
      results.push({ bookingId: out_id, status: 'error', error: errorMsg });
    }
  }

  return new Response(JSON.stringify({ processed: bookings.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

function bookingReminderEmail({
  userName,
  resourceType,
  resourceName,
  dateStr,
  timeStr,
  location,
  title,
  appUrl
}: EmailTemplateProps) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Reminder</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
      body {
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #0b0f19;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 580px;
        margin: 40px auto;
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
      }
      .header {
        background: linear-gradient(135deg, #f04a16 0%, #dc2626 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .header p {
        color: rgba(255, 255, 255, 0.85);
        margin: 8px 0 0 0;
        font-size: 16px;
        font-weight: 400;
      }
      .content {
        padding: 40px 32px;
      }
      .greeting {
        color: #ffffff;
        font-size: 18px;
        font-weight: 500;
        margin-top: 0;
        margin-bottom: 16px;
      }
      .intro {
        color: #9ca3af;
        font-size: 15px;
        line-height: 1.6;
        margin-top: 0;
        margin-bottom: 32px;
      }
      .card {
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 32px;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #2d3748;
      }
      .detail-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .detail-row:first-child {
        padding-top: 0;
      }
      .detail-label {
        color: #9ca3af;
        font-size: 14px;
        font-weight: 500;
      }
      .detail-value {
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        text-align: right;
      }
      .btn-container {
        text-align: center;
        margin-top: 32px;
        margin-bottom: 8px;
      }
      .btn-primary {
        display: inline-block;
        background: linear-gradient(135deg, #f04a16 0%, #ea580c 100%);
        color: #ffffff !important;
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
        padding: 14px 32px;
        border-radius: 12px;
        transition: all 0.2s ease;
        box-shadow: 0 10px 15px -3px rgba(240, 74, 22, 0.3);
      }
      .footer {
        padding: 24px 32px;
        background: #0d121f;
        border-top: 1px solid #1f2937;
        text-align: center;
      }
      .footer p {
        color: #4b5563;
        font-size: 12px;
        margin: 0;
        line-height: 1.5;
      }
      .footer a {
        color: #6b7280;
        text-decoration: underline;
      }
      @media (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
          border: none;
        }
        .content {
          padding: 24px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⏰ Upcoming Booking</h1>
        <p>Your ${resourceType} starts soon</p>
      </div>
      <div class="content">
        <p class="greeting">Hi ${userName},</p>
        <p class="intro">This is a reminder that your reservation starts in approximately 30 minutes. Please find the details below:</p>
        
        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Resource Type</span>
            <span class="detail-value" style="text-transform: capitalize;">${resourceType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Space/Item</span>
            <span class="detail-value">${resourceName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${dateStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Window</span>
            <span class="detail-value">${timeStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${location}</span>
          </div>
          ${title ? `
          <div class="detail-row">
            <span class="detail-label">Booking Title</span>
            <span class="detail-value">${title}</span>
          </div>
          ` : ''}
        </div>
        
        <p class="intro" style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">
          <strong>Important:</strong> Please check in within your check-in window. Unclaimed bookings will be automatically released to other team members.
        </p>

        <div class="btn-container">
          <a href="${appUrl}/my-bookings" class="btn-primary">Check In & View Booking →</a>
        </div>
      </div>
      <div class="footer">
        <p>DeskFlow — Your office workspace, organized.<br>
        <a href="${appUrl}/settings">Update notification preferences</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
}
