export function calculatePriceDetails({
  geometryResult,
  materialPrice,
  quantity,
}) {
  const unitPrice = geometryResult.properties.volumeCm3 * materialPrice;
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
