import { PriceBreakdown } from '../types';
import { daysInclusive } from './date';

/**
 * Platform-wide floor for a listing's daily rate, in rupees. ₹30/day is the
 * bare minimum a lender may charge (PROJECT_PLAN §11.2).
 */
export const MIN_PRICE_PER_DAY = 30;

/** True when `n` is a usable daily rate at or above the platform minimum. */
export const isValidDayRate = (n: number): boolean =>
  Number.isFinite(n) && n >= MIN_PRICE_PER_DAY;

/**
 * Booking price = (pricePerDay × billable days) + refundable deposit.
 * Deposit is always shown separately from the rental fee (PROJECT_PLAN §14).
 */
export const computePrice = (
  pricePerDay: number,
  deposit: number,
  startISO: string,
  endISO: string
): PriceBreakdown => {
  const days = daysInclusive(startISO, endISO);
  const rentalFee = pricePerDay * days;
  return { days, rentalFee, deposit, total: rentalFee + deposit };
};
