export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const expectedSignature = createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success': {
        const data = event.data;
        const metadata = data.metadata || {};
        const planId = metadata.planId;
        const fullName = metadata.fullName || '';
        const schoolName = metadata.schoolName || '';
        const email = data.customer.email;
        const reference = data.reference;
        const amountPaid = data.amount / 100; // Convert from kobo to KES

        // Create or find school
        const { data: school } = await supabaseAdmin
          .from('schools')
          .upsert({ name: schoolName }, { onConflict: 'name' })
          .select()
          .single();

        // Create or find user
        const { data: user } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              full_name: fullName,
              role: 'teacher',
              school_id: school?.id,
            },
            { onConflict: 'email' }
          )
          .select()
          .single();

        if (user && planId) {
          // Fetch plan details for duration
          const { data: plan } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

          // Create or update subscription
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: user.id,
              plan_id: planId,
              school_id: school?.id,
              status: 'active',
              paystack_reference: reference,
              amount_paid: amountPaid,
              start_date: new Date().toISOString(),
              end_date: new Date(
                Date.now() + (plan?.duration_months || 1) * 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            { onConflict: 'paystack_reference' }
          );
        }

        break;
      }

      case 'subscription.create': {
        const data = event.data;
        const email = data.customer.email;
        const subscriptionCode = data.subscription_code;

        // Update subscription with code
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (user) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              paystack_subscription_code: subscriptionCode,
              status: 'active',
            })
            .eq('user_id', user.id)
            .is('paystack_subscription_code', null);
        }
        break;
      }

      case 'subscription.disable': {
        const data = event.data;
        const subscriptionCode = data.subscription_code;

        // Mark subscription as cancelled
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('paystack_subscription_code', subscriptionCode);
        break;
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Paystack sends GET requests for verification
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
