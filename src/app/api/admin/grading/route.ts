export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET all grading systems
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('grading_systems')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gradingSystems: data });
  } catch (err) {
    console.error('Grading systems fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch grading systems' }, { status: 500 });
  }
}

// POST create a new grading system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, thresholds, is_default } = body;

    if (!name || !thresholds || !Array.isArray(thresholds)) {
      return NextResponse.json(
        { error: 'Name and thresholds array are required' },
        { status: 400 }
      );
    }

    // Validate thresholds
    for (const t of thresholds) {
      if (t.min === undefined || t.max === undefined || !t.grade) {
        return NextResponse.json(
          { error: 'Each threshold must have min, max, and grade' },
          { status: 400 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabaseAdmin
        .from('grading_systems')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('grading_systems')
      .insert({
        name,
        description: description || '',
        thresholds,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gradingSystem: data }, { status: 201 });
  } catch (err) {
    console.error('Grading system creation error:', err);
    return NextResponse.json({ error: 'Failed to create grading system' }, { status: 500 });
  }
}

// PUT update a grading system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Grading system ID is required' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await supabaseAdmin
        .from('grading_systems')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('grading_systems')
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

    return NextResponse.json({ gradingSystem: data });
  } catch (err) {
    console.error('Grading system update error:', err);
    return NextResponse.json({ error: 'Failed to update grading system' }, { status: 500 });
  }
}

// DELETE a grading system
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Grading system ID is required' }, { status: 400 });
    }

    // Check if any schools reference this grading system
    const { count } = await supabaseAdmin
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('grading_system_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete: this grading system is used by one or more schools' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('grading_systems')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Grading system deleted successfully' });
  } catch (err) {
    console.error('Grading system deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete grading system' }, { status: 500 });
  }
}
