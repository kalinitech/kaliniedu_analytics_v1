'use client';

import React from 'react';
import { Check, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFeatureBullets, type Plan } from '@/lib/planFeatures';
import { formatKES } from '@/lib/utils';

interface PricingCardProps {
  plan: Plan;
  onSubscribe: (plan: Plan) => void;
  isCurrentPlan?: boolean;
}

export function PricingCard({ plan, onSubscribe, isCurrentPlan = false }: PricingCardProps) {
  const features = getFeatureBullets(plan);
  const isPremium = plan.name === 'Premium';
  const isEnterprise = plan.name === 'Enterprise';
  const isFree = plan.name === 'Free';

  return (
    <Card
      className={`relative flex flex-col transition-all duration-200 hover:shadow-lg ${
        isPremium
          ? 'border-2 border-turquoise-500 shadow-md shadow-turquoise-100 scale-[1.02]'
          : isEnterprise
          ? 'border-2 border-navy-500 bg-navy-900 text-white'
          : 'border border-gray-200'
      }`}
    >
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-turquoise-500 text-white px-3 py-1 text-xs">
            <Star className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle
          className={`text-xl font-bold ${
            isEnterprise ? 'text-white' : isPremium ? 'text-turquoise-600' : 'text-gray-900'
          }`}
        >
          {plan.name}
        </CardTitle>
        <p
          className={`text-sm ${
            isEnterprise ? 'text-gray-300' : 'text-gray-500'
          }`}
        >
          {plan.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <span
            className={`text-4xl font-bold ${
              isEnterprise ? 'text-turquoise-400' : isPremium ? 'text-turquoise-600' : 'text-gray-900'
            }`}
          >
            {plan.price_kes === 0 ? 'Free' : formatKES(plan.price_kes)}
          </span>
          {plan.price_kes > 0 && (
            <span className={`text-sm ${isEnterprise ? 'text-gray-400' : 'text-gray-500'}`}>
              /{plan.duration_months === 1 ? 'month' : `${plan.duration_months} months`}
            </span>
          )}
        </div>

        <Separator className={isEnterprise ? 'bg-navy-700' : ''} />

        <ul className="mt-4 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  isEnterprise
                    ? 'text-turquoise-400'
                    : isPremium
                    ? 'text-turquoise-500'
                    : 'text-green-500'
                }`}
              />
              <span
                className={`text-sm ${
                  isEnterprise ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button
            className="w-full"
            variant="outline"
            disabled
          >
            Current Plan
          </Button>
        ) : isFree ? (
          <Button
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            variant="outline"
            onClick={() => onSubscribe(plan)}
          >
            Get Started Free
          </Button>
        ) : isPremium ? (
          <Button
            className="w-full bg-turquoise-500 hover:bg-turquoise-600 text-white"
            onClick={() => onSubscribe(plan)}
          >
            Subscribe Now
          </Button>
        ) : (
          <Button
            className="w-full bg-navy-500 hover:bg-navy-600 text-white"
            onClick={() => onSubscribe(plan)}
          >
            Contact Sales
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
