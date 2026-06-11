export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'KES 0';
  return `KES ${amount.toLocaleString()}`;
};

export const formatShortDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};