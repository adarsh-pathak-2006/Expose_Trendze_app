import { format } from 'date-fns';

export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(value?: string, template = 'dd MMM yyyy') {
  if (!value) {
    return 'N/A';
  }

  return format(new Date(value), template);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return 'Awaiting update';
  }

  return format(new Date(value), 'dd MMM yyyy, hh:mm a');
}

export function alpha(hex: string, opacity: number) {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
