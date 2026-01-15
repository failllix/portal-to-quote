export interface PriceDetails {
  unitPrice: number;
  subtotal: number;
  discountPercentage: number;
  discount: number;
  total: number;
}

export function calculatePriceDetails({
  volumeCm3,
  materialPrice,
  quantity,
}: {
  volumeCm3: number;
  materialPrice: number;
  quantity: number;
}): PriceDetails {
  const unitPrice = volumeCm3 * materialPrice;
  const subtotal = unitPrice * quantity;
  const discountPercentage = getDiscountRate(quantity);
  const discount = subtotal * discountPercentage;
  const total = subtotal - discount;

  return {
    unitPrice,
    subtotal,
    discountPercentage,
    discount,
    total,
  };
}

function getDiscountRate(quantity: number): number {
  if (quantity >= 5 && quantity < 10) {
    return 0.05;
  }
  if (quantity >= 10 && quantity < 25) {
    return 0.1;
  }
  if (quantity >= 25 && quantity < 50) {
    return 0.15;
  }
  if (quantity >= 50) {
    return 0.2;
  }
  return 0;
}
