import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET all plans
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data });
  } catch (err) {
    console.error('Plans fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST create a new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price_kes,
      duration_months,
      max_uploads_per_month,
      max_students_per_upload,
      max_file_size_mb,
      includes_pdf_report,
      includes_excel_report,
      includes_advanced_analytics,
      includes_school_branding,
      includes_priority_support,
      is_active,
      is_default,
      sort_order,
    } = body;

    if (!name || price_kes === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('plans')
      .insert({
        name,
        description: description || '',
        price_kes,
        duration_months: duration_months || 12,
        max_uploads_per_month: max_uploads_per_month || null,
        max_students_per_upload: max_students_per_upload || null,
        max_file_size_mb: max_file_size_mb || 10,
        includes_pdf_report: includes_pdf_report || false,
        includes_excel_report: includes_excel_report !== false,
        includes_advanced_analytics: includes_advanced_analytics || false,
        includes_school_branding: includes_school_branding || false,
        includes_priority_support: includes_priority_support || false,
        is_active: is_active !== false,
        is_default: is_default || false,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (err) {
    console.error('Plan creation error:', err);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

// PUT update a plan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
  } catch (err) {
    console.error('Plan update error:', err);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE a plan (soft delete by setting is_active = false)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Plan deactivated successfully' });
  } catch (err) {
    console.error('Plan deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
