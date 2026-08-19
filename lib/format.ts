const DEFAULT_CURRENCY = "GHS";

export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GH").format(value);
}

export function formatProductPrice(product: {
  pricingMethod: string;
  displayPrice?: number;
  minEstimatedPrice?: number;
  maxEstimatedPrice?: number;
  currency: string;
}): string {
  const currency = product.currency || DEFAULT_CURRENCY;
  switch (product.pricingMethod) {
    case "fixed":
      return product.displayPrice !== undefined ? formatCurrency(product.displayPrice, currency) : "Price on request";
    case "starting_from":
      return product.minEstimatedPrice !== undefined
        ? `From ${formatCurrency(product.minEstimatedPrice, currency)}`
        : "Price on request";
    case "price_range":
      return product.minEstimatedPrice !== undefined && product.maxEstimatedPrice !== undefined
        ? `${formatCurrency(product.minEstimatedPrice, currency)} – ${formatCurrency(product.maxEstimatedPrice, currency)}`
        : "Price on request";
    default:
      return "Price on request";
  }
}
