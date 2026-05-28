// Helpers de presentación para fechas y valores mostrados en la interfaz.
export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(dateString) {
  if (!dateString) return 'Fecha pendiente';

  const normalized = String(dateString).split('T')[0];
  const parsed = new Date(`${normalized}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
