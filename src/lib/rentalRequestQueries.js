import {
  ACTIVE_RENTAL_REQUEST_FILTER,
  RENTAL_REQUEST_COLUMNS,
} from "./rentalDbColumns.js";

export function getActiveRentalRequests(query) {
  return query(
    `SELECT ${RENTAL_REQUEST_COLUMNS} FROM "RentalRequest"
     WHERE ${ACTIVE_RENTAL_REQUEST_FILTER}
     ORDER BY "createdAt" DESC`,
  );
}
