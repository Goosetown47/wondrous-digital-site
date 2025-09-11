export const TEST_SCENARIOS = {
  downgradeMaxToPro: {
    account: {
      id: 'acc-max-to-pro',
      name: 'Enterprise Corp',
      email: 'billing@enterprise.com',
      tier: 'MAX' as const,
      pending_tier_change: 'PRO' as const,
      pending_tier_change_date: '2025-09-30T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_max_pro',
      stripe_subscription_id: 'sub_test_max_pro'
    },
    currentFeatures: {
      projects: 25,
      users: 10,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    targetFeatures: {
      projects: 5,
      users: 3,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    pricing: {
      current: { amount: 997, period: 'monthly' },
      target: { amount: 397, period: 'monthly' }
    }
  },

  downgradeScaleToPro: {
    account: {
      id: 'acc-scale-to-pro',
      name: 'Growth Company',
      email: 'billing@growth.com',
      tier: 'SCALE' as const,
      pending_tier_change: 'PRO' as const,
      pending_tier_change_date: '2025-09-14T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_scale_pro',
      stripe_subscription_id: 'sub_test_scale_pro'
    },
    currentFeatures: {
      projects: 10,
      users: 5,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    targetFeatures: {
      projects: 5,
      users: 3,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    pricing: {
      current: { amount: 697, period: 'monthly' },
      target: { amount: 397, period: 'monthly' }
    }
  },

  billingYearlyToMonthly: {
    account: {
      id: 'acc-yearly-to-monthly',
      name: 'Flexible Corp',
      email: 'billing@flexible.com',
      tier: 'MAX' as const,
      pending_tier_change: 'MAX' as const,
      current_billing_period: 'yearly',
      pending_billing_period: 'monthly',
      pending_tier_change_date: '2025-09-07T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_billing_switch',
      stripe_subscription_id: 'sub_test_billing_switch'
    },
    currentFeatures: {
      projects: 25,
      users: 10,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    targetFeatures: {
      projects: 25,
      users: 10,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    pricing: {
      current: { amount: 10764, period: 'yearly' },
      target: { amount: 997, period: 'monthly' }
    }
  },

  billingMonthlyToYearly: {
    account: {
      id: 'acc-monthly-to-yearly',
      name: 'Committed Inc',
      email: 'billing@committed.com',
      tier: 'PRO' as const,
      pending_tier_change: 'PRO' as const,
      current_billing_period: 'monthly',
      pending_billing_period: 'yearly',
      pending_tier_change_date: '2025-09-01T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_monthly_yearly',
      stripe_subscription_id: 'sub_test_monthly_yearly'
    },
    currentFeatures: {
      projects: 5,
      users: 3,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    targetFeatures: {
      projects: 5,
      users: 3,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    pricing: {
      current: { amount: 397, period: 'monthly' },
      target: { amount: 4284, period: 'yearly' } // 10% discount
    }
  },

  downgradeMaxToScale: {
    account: {
      id: 'acc-max-to-scale',
      name: 'Adjusting Corp',
      email: 'billing@adjusting.com',
      tier: 'MAX' as const,
      pending_tier_change: 'SCALE' as const,
      pending_tier_change_date: '2025-10-01T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_max_scale',
      stripe_subscription_id: 'sub_test_max_scale'
    },
    currentFeatures: {
      projects: 25,
      users: 10,
      customDomains: true,
      smartMarketing: true,
      performAddon: true
    },
    targetFeatures: {
      projects: 10,
      users: 5,
      customDomains: true,
      smartMarketing: true,
      performAddon: true // Keeping addon
    },
    pricing: {
      current: { amount: 997 + 459, period: 'monthly' }, // With PERFORM addon
      target: { amount: 697 + 459, period: 'monthly' }
    }
  },

  errorRecovery: {
    account: {
      id: 'acc-error-test',
      name: 'Error Test Company',
      email: 'invalid-email', // Intentionally invalid
      tier: 'PRO' as const,
      pending_tier_change: 'BASIC' as const,
      pending_tier_change_date: '2025-09-15T00:00:00Z',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test_error',
      stripe_subscription_id: 'sub_test_error'
    },
    currentFeatures: {
      projects: 5,
      users: 3,
      customDomains: true,
      smartMarketing: true,
      performAddon: false
    },
    targetFeatures: {
      projects: 3,
      users: 1,
      customDomains: false,
      smartMarketing: false,
      performAddon: false
    },
    pricing: {
      current: { amount: 397, period: 'monthly' },
      target: { amount: 97, period: 'monthly' }
    }
  }
};

export const NOTIFICATION_WINDOWS = {
  '30_days': {
    daysOut: 30,
    subject: 'Your billing change is scheduled in 30 days',
    urgency: 'info',
    showCancelOption: true
  },
  '14_days': {
    daysOut: 14,
    subject: 'Your billing change is scheduled in 2 weeks',
    urgency: 'warning',
    showCancelOption: true
  },
  '7_days': {
    daysOut: 7,
    subject: 'Your billing change is scheduled in 1 week',
    urgency: 'warning',
    showCancelOption: true
  },
  '1_day': {
    daysOut: 1,
    subject: 'Your billing change is tomorrow',
    urgency: 'urgent',
    showCancelOption: false // Too late to cancel
  }
} as const;

export const EMAIL_TEMPLATES = {
  downgrade: {
    header: 'Upcoming Plan Change',
    bodyIntro: 'This is a reminder that your subscription plan will be changing soon.',
    featureChangeHeader: 'What changes with your new plan:',
    ctaText: 'Review Changes',
    cancelText: 'Cancel This Change'
  },
  billingSwitch: {
    header: 'Billing Frequency Change',
    bodyIntro: 'This is a reminder that your billing frequency will be changing soon.',
    featureChangeHeader: 'Your features remain the same',
    ctaText: 'Review Billing',
    cancelText: 'Cancel This Change'
  }
} as const;

export function getTestAccount(scenario: keyof typeof TEST_SCENARIOS) {
  // Use switch to avoid bracket notation
  switch (scenario) {
    case 'downgradeMaxToPro':
      return TEST_SCENARIOS.downgradeMaxToPro.account;
    case 'downgradeScaleToPro':
      return TEST_SCENARIOS.downgradeScaleToPro.account;
    case 'billingYearlyToMonthly':
      return TEST_SCENARIOS.billingYearlyToMonthly.account;
    case 'billingMonthlyToYearly':
      return TEST_SCENARIOS.billingMonthlyToYearly.account;
    case 'downgradeMaxToScale':
      return TEST_SCENARIOS.downgradeMaxToScale.account;
    case 'errorRecovery':
      return TEST_SCENARIOS.errorRecovery.account;
    default:
      return TEST_SCENARIOS.downgradeMaxToPro.account;
  }
}

export function getFeatureComparison(scenario: keyof typeof TEST_SCENARIOS) {
  // Use switch to avoid bracket notation
  let currentFeatures: typeof TEST_SCENARIOS.downgradeMaxToPro.currentFeatures;
  let targetFeatures: typeof TEST_SCENARIOS.downgradeMaxToPro.targetFeatures;
  
  switch (scenario) {
    case 'downgradeMaxToPro':
      currentFeatures = TEST_SCENARIOS.downgradeMaxToPro.currentFeatures;
      targetFeatures = TEST_SCENARIOS.downgradeMaxToPro.targetFeatures;
      break;
    case 'downgradeScaleToPro':
      currentFeatures = TEST_SCENARIOS.downgradeScaleToPro.currentFeatures;
      targetFeatures = TEST_SCENARIOS.downgradeScaleToPro.targetFeatures;
      break;
    case 'billingYearlyToMonthly':
      currentFeatures = TEST_SCENARIOS.billingYearlyToMonthly.currentFeatures;
      targetFeatures = TEST_SCENARIOS.billingYearlyToMonthly.targetFeatures;
      break;
    case 'billingMonthlyToYearly':
      currentFeatures = TEST_SCENARIOS.billingMonthlyToYearly.currentFeatures;
      targetFeatures = TEST_SCENARIOS.billingMonthlyToYearly.targetFeatures;
      break;
    case 'downgradeMaxToScale':
      currentFeatures = TEST_SCENARIOS.downgradeMaxToScale.currentFeatures;
      targetFeatures = TEST_SCENARIOS.downgradeMaxToScale.targetFeatures;
      break;
    case 'errorRecovery':
      currentFeatures = TEST_SCENARIOS.errorRecovery.currentFeatures;
      targetFeatures = TEST_SCENARIOS.errorRecovery.targetFeatures;
      break;
    default:
      currentFeatures = TEST_SCENARIOS.downgradeMaxToPro.currentFeatures;
      targetFeatures = TEST_SCENARIOS.downgradeMaxToPro.targetFeatures;
      break;
  }
  const changes: Record<string, { from: string | number | boolean; to: string | number | boolean }> = {};

  for (const [key, value] of Object.entries(currentFeatures)) {
    const targetEntry = Object.entries(targetFeatures).find(([k]) => k === key);
    if (targetEntry && value !== targetEntry[1]) {
      Object.defineProperty(changes, key, {
        value: {
          from: value,
          to: targetEntry[1]
        },
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }

  return changes;
}

export function getPricingInfo(scenario: keyof typeof TEST_SCENARIOS) {
  // Use switch to avoid bracket notation
  switch (scenario) {
    case 'downgradeMaxToPro':
      return TEST_SCENARIOS.downgradeMaxToPro.pricing;
    case 'downgradeScaleToPro':
      return TEST_SCENARIOS.downgradeScaleToPro.pricing;
    case 'billingYearlyToMonthly':
      return TEST_SCENARIOS.billingYearlyToMonthly.pricing;
    case 'billingMonthlyToYearly':
      return TEST_SCENARIOS.billingMonthlyToYearly.pricing;
    case 'downgradeMaxToScale':
      return TEST_SCENARIOS.downgradeMaxToScale.pricing;
    case 'errorRecovery':
      return TEST_SCENARIOS.errorRecovery.pricing;
    default:
      return TEST_SCENARIOS.downgradeMaxToPro.pricing;
  }
}