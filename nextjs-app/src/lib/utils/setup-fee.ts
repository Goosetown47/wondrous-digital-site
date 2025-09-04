import { differenceInDays } from 'date-fns';

/**
 * Determines if a setup fee should be charged based on the 60-day rule
 * 
 * Rules:
 * - If never paid before: charge setup fee
 * - If paid < 60 days ago: don't charge (still within grace period)
 * - If paid > 60 days ago: charge again (platform likely deprecated)
 * 
 * @param hasPaidBefore - Whether the account has ever paid the setup fee
 * @param paidAt - The timestamp when the setup fee was last paid
 * @returns Whether to show/charge the setup fee
 */
export function shouldChargeSetupFee(
  hasPaidBefore: boolean | null | undefined,
  paidAt: string | null | undefined
): boolean {
  // Never paid before - charge setup fee
  if (!hasPaidBefore) {
    return true;
  }

  // Paid before but no timestamp - be conservative and don't charge
  if (!paidAt) {
    console.warn('Setup fee paid but no timestamp found - not charging setup fee');
    return false;
  }

  // Calculate days since setup fee was paid
  const paidDate = new Date(paidAt);
  const today = new Date();
  const daysSincePaid = differenceInDays(today, paidDate);

  // If more than 60 days, charge setup fee again (platform deprecated)
  // If 60 days or less, don't charge (within grace period)
  return daysSincePaid > 60;
}

/**
 * Helper to format the setup fee message
 * @param amount - The setup fee amount in dollars
 * @param platformName - The name of the platform (e.g., "Smart Marketing Platform")
 * @returns Formatted setup fee message
 */
export function formatSetupFeeMessage(amount: number, platformName: string): string {
  return `+ $${amount.toLocaleString()} one-time ${platformName} setup fee`;
}