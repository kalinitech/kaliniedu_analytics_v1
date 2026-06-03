'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { SubscribeModal } from '@/components/SubscribeModal';
import { type Plan, DEFAULT_FREE_PLAN } from '@/lib/planFeatures';

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([DEFAULT_FREE_PLAN]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans');
      if (response.ok) {
        const data = await response.json();
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans.filter((p: Plan) => p.is_active));
        }
      }
    } catch {
      // Use default plans
      setPlans([
        DEFAULT_FREE_PLAN,
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
          is_active: true,
          is_default: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
          is_active: true,
          is_default: false,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-turquoise-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-navy-700 leading-tight">KalinEdu</h1>
                <p className="text-[10px] text-turquoise-500 -mt-0.5 leading-tight">Analytics</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From individual teachers to school districts — we have a plan that fits your needs.
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    onSubscribe={handleSubscribe}
                  />
                ))}
            </div>
          )}

          {/* FAQ / Trust Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  What payment methods do you accept?
                </h4>
                <p className="text-sm text-gray-500">
                  We accept M-Pesa (STK Push), Visa, and Mastercard through our secure
                  Paystack payment gateway. All prices are in Kenyan Shillings (KES).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Can I change my plan later?
                </h4>
                <p className="text-sm text-gray-500">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take
                  effect at the start of your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Is my data secure?
                </h4>
                <p className="text-sm text-gray-500">
                  Absolutely. Your files are processed server-side and never stored permanently.
                  We use industry-standard encryption and Supabase&apos;s secure infrastructure.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Which grading systems are supported?
                </h4>
                <p className="text-sm text-gray-500">
                  We support CBC (Competency Based Curriculum) for primary schools and KCSE
                  for secondary schools. Enterprise plans can create custom grading systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-turquoise-500 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">KalinEdu Analytics</p>
                <p className="text-xs text-gray-400">by KALINITECH SYSTEMS</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Kalinitech Systems. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <SubscribeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
