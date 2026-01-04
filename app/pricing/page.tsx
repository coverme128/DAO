'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';
import Header from '@/components/Header';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: 'FREE' | 'PRO';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out Acoda',
    features: [
      { name: '10 voice messages per day', included: true },
      { name: 'Basic AI conversations', included: true },
      { name: 'Text chat', included: true },
      { name: 'Memory context', included: true },
      { name: 'Unlimited messages', included: false },
      { name: 'Priority support', included: false },
      { name: 'Advanced memory', included: false },
    ],
    cta: 'Current Plan',
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For power users who want unlimited access',
    features: [
      { name: 'Unlimited voice messages', included: true },
      { name: 'Unlimited AI conversations', included: true },
      { name: 'Text chat', included: true },
      { name: 'Enhanced memory context', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced features', included: true },
      { name: 'Early access to new features', included: true },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
];

export default function PricingPage() {
  const { userId, usage, setUsage } = useChatStore();
  const [currentPlan, setCurrentPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (usage) {
      setCurrentPlan(usage.plan as 'FREE' | 'PRO');
    }
  }, [usage]);

  // Check for payment success/cancel in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccess(true);
      // Refresh usage to get updated plan
      if (userId) {
        fetch(`${api.usage.check}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data) {
              setUsage(data);
              setCurrentPlan(data.plan as 'FREE' | 'PRO');
            }
          })
          .catch(console.error);
      }
      // Clean URL
      window.history.replaceState({}, '', '/pricing');
    }
  }, [userId, setUsage]);

  const handleUpgrade = async () => {
    if (!userId) {
      setError('Please sign in to upgrade');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Stripe Checkout session
      const response = await fetch(`${api.stripe.checkout}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout process');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Select the plan that works best for you
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="max-w-5xl mx-auto mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ Payment successful! Your account has been upgraded to Pro.
                </p>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan === plan.id;
              const isPro = plan.id === 'PRO';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-8 transition-all ${
                    plan.popular
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={isPro && !isCurrentPlan ? handleUpgrade : undefined}
                    disabled={isCurrentPlan || loading}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isPro
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  {isCurrentPlan && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Your current plan
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-5xl mx-auto mt-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* FAQ or Additional Info */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I switch plans later?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Yes, you can upgrade to Pro at any time. If you cancel your Pro subscription, you'll revert to the Free plan at the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We accept all major credit cards and debit cards through Stripe's secure payment processing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  The Free plan is available forever with 10 voice messages per day. You can try it out before upgrading to Pro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

