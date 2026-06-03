export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, fullName, schoolName, email } = body;

    if (!planId || !fullName || !schoolName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, fullName, schoolName, email' },
        { status: 400 }
      );
    }

    // Fetch the plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Invalid or inactive plan' }, { status: 400 });
    }

    // Free plan - no payment needed
    if (plan.price_kes === 0) {
      // Create or find school
      const { data: school, error: schoolError } = await supabaseAdmin
        .from('schools')
        .upsert(
          { name: schoolName },
          { onConflict: 'name', ignoreDuplicates: false }
        )
        .select()
        .single();

      // Create user
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .upsert(
          { email, full_name: fullName, role: 'teacher', school_id: school?.id },
          { onConflict: 'email' }
        )
        .select()
        .single();

      // Create subscription
      if (user) {
        await supabaseAdmin.from('subscriptions').insert({
          user_id: user.id,
          plan_id: plan.id,
          school_id: school?.id,
          status: 'active',
          amount_paid: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }

      return NextResponse.json({
        message: 'Free plan activated successfully',
        redirect: '/payment/success?plan=free',
      });
    }

    // Paid plan - initialize Paystack transaction
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: plan.price_kes * 100, // Paystack expects amount in kobo (cents)
        currency: 'KES',
        callback_url: `${APP_URL}/payment/success`,
        metadata: {
          planId: plan.id,
          fullName,
          schoolName,
          custom_fields: [
            { display_name: 'Full Name', variable_name: 'full_name', value: fullName },
            { display_name: 'School Name', variable_name: 'school_name', value: schoolName },
            { display_name: 'Plan', variable_name: 'plan', value: plan.name },
          ],
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      return NextResponse.json(
        { error: 'Failed to initialize payment. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (err) {
    console.error('Payment initialization error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
