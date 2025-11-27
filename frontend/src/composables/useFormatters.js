export function useFormatters() {
  const formatPrice = (price, suffix = "₺") =>
    `${Number(price || 0).toFixed(2)}${suffix}`;

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("tr-TR", {
      dateStyle: "short",
    });

  return {
    formatPrice,
    formatDate,
    formatDateTime,
  };
}
