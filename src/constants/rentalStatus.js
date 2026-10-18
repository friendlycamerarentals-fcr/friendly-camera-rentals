export const RENTAL_STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Approved", "Rejected", "Cancelled"],
  Confirmed: ["Picked Up", "Returned", "Completed", "Rejected", "Cancelled"],
  Approved: [
    "Confirmed",
    "Picked Up",
    "Returned",
    "Completed",
    "Rejected",
    "Cancelled",
  ],
  "Picked Up": ["Returned", "Completed", "Cancelled"],
  Returned: ["Completed", "Cancelled"],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

export const isRentalStatus = (status) =>
  Object.prototype.hasOwnProperty.call(RENTAL_STATUS_TRANSITIONS, status);

export const canTransitionRentalStatus = (currentStatus, nextStatus) =>
  currentStatus === nextStatus ||
  RENTAL_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) === true;
