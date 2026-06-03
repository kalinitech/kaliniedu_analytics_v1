'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'free' | 'pending'>('success');
  const reference = searchParams.get('reference');
  const plan = searchParams.get('plan');

  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      if (plan === 'free') {
        setStatus('free');
      } else {
        setStatus('success');
      }
      setVerifying(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [plan]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-turquoise-500 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-navy-700">KalinEdu</h1>
          <p className="text-xs text-turquoise-500">Analytics</p>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {verifying ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-turquoise-500 animate-spin" />
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                {status === 'free' ? 'Account Created!' : 'Payment Successful!'}
              </h2>
              <p className="text-gray-500">
                {status === 'free'
                  ? 'Your free plan is now active. Start uploading your marksheets to get instant analytics.'
                  : 'Your subscription is now active. You have full access to all plan features.'}
              </p>

              {reference && (
                <p className="text-xs text-gray-400">
                  Reference: {reference}
                </p>
              )}

              <div className="w-full pt-4">
                <Link href="/" className="block">
                  <Button className="w-full bg-turquoise-500 hover:bg-turquoise-600 text-white">
                    Start Using KalinEdu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} KALINITECH SYSTEMS • kalinimedia001@gmail.com
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-turquoise-500 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
