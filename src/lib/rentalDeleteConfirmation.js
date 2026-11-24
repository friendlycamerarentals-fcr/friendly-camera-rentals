export function dismissRentalDeleteConfirmation({ deleting, onCancel }) {
  if (deleting) return false;
  onCancel?.();
  return true;
}
