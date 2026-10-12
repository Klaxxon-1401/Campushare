import { PriceBreakdown } from '../types';
import { daysInclusive } from './date';

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
