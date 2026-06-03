'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { type Plan } from '@/lib/planFeatures';
import { formatKES } from '@/lib/utils';

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

export function SubscribeModal({ open, onOpenChange, plan }: SubscribeModalProps) {
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !schoolName.trim() || !email.trim()) {
      setError('All fields are required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!plan) return;

    setLoading(true);

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          fullName: fullName.trim(),
          schoolName: schoolName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to initialize payment');
        return;
      }

      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFullName('');
      setSchoolName('');
      setEmail('');
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-turquoise-600">Subscribe to {plan?.name}</DialogTitle>
          <DialogDescription>
            {plan?.price_kes === 0
              ? 'Get started with your free account'
              : `${formatKES(plan?.price_kes || 0)}/${plan?.duration_months === 1 ? 'month' : `${plan?.duration_months} months`} - Enter your details to proceed`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="e.g. Jane Wanjiru"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                placeholder="e.g. Nairobi Primary School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. teacher@school.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
            )}

            {plan && plan.price_kes > 0 && (
              <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-3">
                <p className="text-sm font-medium text-turquoise-700">Payment Summary</p>
                <p className="text-xs text-turquoise-600 mt-1">
                  Plan: {plan.name} — {formatKES(plan.price_kes)}/
                  {plan.duration_months === 1 ? 'month' : `${plan.duration_months} months`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You will be redirected to Paystack to complete payment via M-Pesa or card.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : plan?.price_kes === 0 ? (
                'Get Started'
              ) : (
                `Pay ${formatKES(plan?.price_kes || 0)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
