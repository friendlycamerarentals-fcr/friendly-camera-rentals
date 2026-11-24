import {
  ACTIVE_RENTAL_REQUEST_FILTER,
  RENTAL_REQUEST_COLUMNS,
} from "./rentalDbColumns.js";
import { withRentalPaymentSummary } from "./rentalPayments.js";

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

async function deleteRentalPayment(client, { id, paymentId, adminEmail }) {
  const rentalRows = await client.query(
    `SELECT ${RENTAL_REQUEST_COLUMNS}
     FROM "RentalRequest"
     WHERE "id" = $1 AND ${ACTIVE_RENTAL_REQUEST_FILTER}
     LIMIT 1
     FOR UPDATE`,
    [id],
  );
  const rental = rentalRows.rows[0];
  if (!rental) {
    throw createHttpError("Rental request not found.", 404);
  }

  const paymentRows = await client.query(
    `SELECT *
     FROM "RentalPayment"
     WHERE "id" = $1 AND "rentalRequestId" = $2
     LIMIT 1
     FOR UPDATE`,
    [paymentId, rental.requestId],
  );
  const payment = paymentRows.rows[0];
  if (!payment) {
    throw createHttpError("Payment record not found for this rental.", 404);
  }
  if (payment.deletedAt) {
    throw createHttpError(
      "This payment was already deleted. The payment history has been refreshed.",
      409,
    );
  }

  const deletedRows = await client.query(
    `UPDATE "RentalPayment"
     SET "deletedAt" = NOW(), "deletedBy" = $1
     WHERE "id" = $2 AND "deletedAt" IS NULL
     RETURNING "id"`,
    [adminEmail, paymentId],
  );
  if (!deletedRows.rows.length) {
    throw createHttpError(
      "This payment was already deleted. The payment history has been refreshed.",
      409,
    );
  }

  const paymentHistory = (
    await client.query(
      `SELECT *
       FROM "RentalPayment"
       WHERE "rentalRequestId" = $1 AND "deletedAt" IS NULL
       ORDER BY "createdAt" ASC, "id" ASC`,
      [rental.requestId],
    )
  ).rows;
  const extraCharges = (
    await client.query(
      `SELECT *
       FROM "RentalExtraCharge"
       WHERE "rentalRequestId" = $1
       ORDER BY "createdAt" ASC, "id" ASC`,
      [rental.requestId],
    )
  ).rows;
  const summarizedRental = withRentalPaymentSummary(
    rental,
    paymentHistory,
    extraCharges,
  );
  const { paymentSummary } = summarizedRental;
  const paymentStatus =
    paymentSummary.totalVerifiedPayments >= paymentSummary.finalRent
      ? "Paid"
      : paymentSummary.totalVerifiedPayments > 0
        ? "Advance Paid"
        : "Pending";

  const updatedRows = await client.query(
    `UPDATE "RentalRequest"
     SET "advanceAmount" = $1,
         "advanceVerified" = $2,
         "advanceVerifiedAt" = $3,
         "advanceVerifiedBy" = $4,
         "advancePaymentMethod" = $5,
         "advancePaymentRef" = $6,
         "paymentStatus" = $7,
         "updatedAt" = NOW()
     WHERE "id" = $8
     RETURNING ${RENTAL_REQUEST_COLUMNS}`,
    [
      paymentSummary.advanceReceived,
      paymentSummary.advanceReceived > 0,
      paymentSummary.advanceVerifiedAt,
      paymentSummary.advanceVerifiedBy,
      paymentSummary.advancePaymentMethod,
      paymentSummary.advancePaymentRef,
      paymentStatus,
      id,
    ],
  );
  const updatedRental = updatedRows.rows[0];
  if (!updatedRental) {
    throw createHttpError("Rental request not found.", 404);
  }

  return withRentalPaymentSummary(
    updatedRental,
    paymentHistory,
    extraCharges,
  );
}

export function createRentalPaymentDeleteHandler({
  requireAdmin,
  transaction,
}) {
  return async function handleDelete(_request, { params }) {
    try {
      const { email: adminEmail } = await requireAdmin();
      const resolvedParams = await params;
      const id = resolvedParams?.id;
      const paymentId = resolvedParams?.paymentId;

      if (!id || !paymentId) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Rental request ID and payment ID are required.",
          },
        };
      }

      const rentalRequest = await transaction((client) =>
        deleteRentalPayment(client, { id, paymentId, adminEmail }),
      );

      return {
        status: 200,
        body: { success: true, data: rentalRequest },
      };
    } catch (error) {
      return {
        status: error.status || 500,
        body: {
          success: false,
          message: error.message || "Failed to delete payment record.",
        },
      };
    }
  };
}
