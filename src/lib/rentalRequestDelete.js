function createHttpError(message, status, extra = {}) {
  return Object.assign(new Error(message), { status, ...extra });
}

export function createRentalRequestDeleteHandler({
  requireAdmin,
  transaction,
  releaseAppliedReward,
}) {
  return async (_request, context) => {
    try {
      const admin = await requireAdmin();
      const resolvedParams = await context?.params;
      const id = resolvedParams?.id;

      if (!id) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Rental request ID is required.",
          },
        };
      }

      const rental = await transaction(async (client) => {
        const rentalRows = await client.query(
          `SELECT "id", "requestId", "deletedAt"
           FROM "RentalRequest"
           WHERE "id" = $1
           LIMIT 1
           FOR UPDATE`,
          [id],
        );
        const existing = rentalRows.rows[0];
        if (!existing) {
          throw createHttpError("Rental booking was not found.", 404);
        }
        if (existing.deletedAt) {
          throw createHttpError(
            "This rental was already deleted. The list has been refreshed.",
            404,
            { alreadyDeleted: true },
          );
        }

        const deletedRows = await client.query(
          `UPDATE "RentalRequest"
           SET "deletedAt" = NOW(), "deletedBy" = $1, "updatedAt" = NOW()
           WHERE "id" = $2 AND "deletedAt" IS NULL
           RETURNING "id", "requestId", "deletedAt", "deletedBy"`,
          [admin.email, id],
        );
        const deletedRental = deletedRows.rows[0];
        if (!deletedRental) {
          throw createHttpError(
            "This rental was already deleted. The list has been refreshed.",
            404,
            { alreadyDeleted: true },
          );
        }

        await releaseAppliedReward(client, existing.requestId);
        return deletedRental;
      });

      return {
        status: 200,
        body: { success: true, data: rental },
      };
    } catch (error) {
      return {
        status: error.status || 500,
        body: {
          success: false,
          message: error.message || "Failed to delete rental booking.",
          ...(error.alreadyDeleted ? { alreadyDeleted: true } : {}),
        },
      };
    }
  };
}
