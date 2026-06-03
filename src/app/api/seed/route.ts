import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST() {
  try {
    // Seed default grading systems
    const { error: gsError } = await supabaseAdmin
      .from('grading_systems')
      .upsert(
        [
          {
            id: 'g1',
            name: 'CBC (Competency Based Curriculum)',
            description: 'Kenya CBC grading for primary schools',
            is_default: true,
            thresholds: [
              { min: 90, max: 100, grade: 'EE1', points: 12 },
              { min: 75, max: 89, grade: 'EE2', points: 11 },
              { min: 58, max: 74, grade: 'ME1', points: 10 },
              { min: 41, max: 57, grade: 'ME2', points: 9 },
              { min: 31, max: 40, grade: 'AE1', points: 8 },
              { min: 21, max: 30, grade: 'AE2', points: 7 },
              { min: 11, max: 20, grade: 'BE1', points: 6 },
              { min: 0, max: 10, grade: 'BE2', points: 5 },
            ],
          },
          {
            id: 'g2',
            name: 'KCSE Secondary',
            description: 'Kenya secondary school KCSE grading',
            is_default: false,
            thresholds: [
              { min: 81, max: 100, grade: 'A', points: 12 },
              { min: 75, max: 80, grade: 'A-', points: 11 },
              { min: 69, max: 74, grade: 'B+', points: 10 },
              { min: 61, max: 68, grade: 'B', points: 9 },
              { min: 54, max: 60, grade: 'B-', points: 8 },
              { min: 48, max: 53, grade: 'C+', points: 7 },
              { min: 42, max: 47, grade: 'C', points: 6 },
              { min: 36, max: 41, grade: 'C-', points: 5 },
              { min: 30, max: 35, grade: 'D+', points: 4 },
              { min: 24, max: 29, grade: 'D', points: 3 },
              { min: 18, max: 23, grade: 'D-', points: 2 },
              { min: 0, max: 17, grade: 'E', points: 1 },
            ],
          },
        ],
        { onConflict: 'id' }
      );

    if (gsError) {
      console.error('Grading systems seed error:', gsError);
    }

    // Seed default plans
    const { error: plansError } = await supabaseAdmin
      .from('plans')
      .upsert(
        [
          {
            id: 'p1',
            name: 'Free',
            description: 'Perfect for individual teachers getting started with automated grading',
            price_kes: 0,
            duration_months: 12,
            max_uploads_per_month: 5,
            max_students_per_upload: 50,
            max_file_size_mb: 5,
            includes_pdf_report: false,
            includes_excel_report: true,
            includes_advanced_analytics: false,
            includes_school_branding: false,
            includes_priority_support: false,
            is_default: true,
            is_active: true,
            sort_order: 0,
          },
          {
            id: 'p2',
            name: 'Premium',
            description: 'Full-featured plan for schools with unlimited uploads and branded reports',
            price_kes: 1000,
            duration_months: 1,
            max_uploads_per_month: null,
            max_students_per_upload: 500,
            max_file_size_mb: 20,
            includes_pdf_report: true,
            includes_excel_report: true,
            includes_advanced_analytics: true,
            includes_school_branding: true,
            includes_priority_support: true,
            is_default: false,
            is_active: true,
            sort_order: 1,
          },
          {
            id: 'p3',
            name: 'Enterprise',
            description: 'For school chains and districts with custom grading and API access',
            price_kes: 5000,
            duration_months: 1,
            max_uploads_per_month: null,
            max_students_per_upload: null,
            max_file_size_mb: 50,
            includes_pdf_report: true,
            includes_excel_report: true,
            includes_advanced_analytics: true,
            includes_school_branding: true,
            includes_priority_support: true,
            is_default: false,
            is_active: true,
            sort_order: 2,
          },
        ],
        { onConflict: 'id' }
      );

    if (plansError) {
      console.error('Plans seed error:', plansError);
    }

    // Seed admin user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: 'a1',
          email: 'kalinimedia001@gmail.com',
          full_name: 'JARED ANDIKA',
          role: 'admin',
        },
        { onConflict: 'id' }
      );

    if (userError) {
      console.error('User seed error:', userError);
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      errors: {
        gradingSystems: gsError?.message || null,
        plans: plansError?.message || null,
        user: userError?.message || null,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
