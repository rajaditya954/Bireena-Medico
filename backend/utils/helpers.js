export const calculateBillingTotal = (items, taxRate = 0.05, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

export const calculateDiscountPercentage = (original, discounted) => {
  return parseFloat((((original - discounted) / original) * 100).toFixed(2));
};

export const applyDiscount = (amount, discountPercent) => {
  return parseFloat((amount - (amount * discountPercent) / 100).toFixed(2));
};
