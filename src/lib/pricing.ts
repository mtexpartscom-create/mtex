import type { Profile } from '@/lib/types';

export const B2B_DISCOUNT = 0.15;
export const COMPANY_PHONE = '+359 888 123 456';

export function b2bDiscountActive(profile: Profile | null): boolean {
  return profile?.role === 'b2b' && profile.b2b_approved === true;
}

export function applyDiscount(price: number, profile: Profile | null): number {
  if (b2bDiscountActive(profile)) {
    return price * (1 - B2B_DISCOUNT);
  }
  return price;
}

export function formatBgn(price: number): string {
  return `${price.toFixed(2)} лв.`;
}