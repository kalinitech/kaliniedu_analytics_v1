export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Total uploads
    const { count: totalUploads } = await supabaseAdmin
      .from('uploads')
      .select('*', { count: 'exact', head: true });

    // Total revenue (sum of amount_paid from active subscriptions)
    const { data: revenueData } = await supabaseAdmin
      .from('subscriptions')
      .select('amount_paid')
      .eq('status', 'active');

    const totalRevenue = (revenueData || []).reduce(
      (sum, sub) => sum + (sub.amount_paid || 0),
      0
    );

    // Active teachers
    const { count: activeTeachers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');

    // Total schools
    const { count: totalSchools } = await supabaseAdmin
      .from('schools')
      .select('*', { count: 'exact', head: true });

    // Monthly uploads (last 12 months)
    const monthlyUploads: Array<{ month: string; count: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = startOfMonth.toLocaleString('en', { month: 'short', year: '2-digit' });

      const { count } = await supabaseAdmin
        .from('uploads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      monthlyUploads.push({ month: monthLabel, count: count || 0 });
    }

    // Monthly revenue (last 12 months)
    const monthlyRevenue: Array<{ month: string; revenue: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = startOfMonth.toLocaleString('en', { month: 'short', year: '2-digit' });

      const { data: monthSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('amount_paid')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const revenue = (monthSubs || []).reduce(
        (sum, sub) => sum + (sub.amount_paid || 0),
        0
      );

      monthlyRevenue.push({ month: monthLabel, revenue });
    }

    // Recent uploads
    const { data: recentUploads } = await supabaseAdmin
      .from('uploads')
      .select('id, file_name, student_count, grading_system, created_at, users(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalUploads: totalUploads || 0,
      totalRevenue,
      activeTeachers: activeTeachers || 0,
      totalSchools: totalSchools || 0,
      monthlyUploads,
      monthlyRevenue,
      recentUploads: recentUploads || [],
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
