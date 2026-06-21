
/**
 * Formats a number to Vietnamese Dong currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculates discount percentage.
 */
export const calculateDiscount = (basePrice: number, salePrice: number): number => {
  if (basePrice <= 0) return 0;
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
};

/**
 * Generates random ID.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Simple debounce function.
 */
export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout) clearTimeout(timeout);
    return new Promise(resolve => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
};
