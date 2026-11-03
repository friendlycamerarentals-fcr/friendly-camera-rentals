const ACTIVITY_LIMIT = 10;

function getTimestamp(value) {
  if (value == null || value === "") return null;

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function joinProductDetails(brand, model) {
  return [brand, model]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ");
}

export function isSoldStatusTransition(previousStatus, nextStatus) {
  const wasSold =
    typeof previousStatus === "string" &&
    previousStatus.trim().toLowerCase() === "sold";
  const isNowSold =
    typeof nextStatus === "string" && nextStatus.trim().toLowerCase() === "sold";

  return !wasSold && isNowSold;
}

export function buildRecentActivities(
  { rentals = [], testimonials = [], sellRequests = [], soldProducts = [] },
  limit = ACTIVITY_LIMIT,
) {
  const activities = [];

  for (const rental of rentals) {
    const timestamp = getTimestamp(rental.createdAt);
    if (!rental.id || !timestamp) continue;

    const customerName =
      typeof rental.fullName === "string" ? rental.fullName.trim() : "";
    const productName =
      typeof rental.productName === "string" ? rental.productName.trim() : "";
    const details =
      customerName && productName
        ? `${customerName} booked ${productName}`
        : customerName
          ? `${customerName} submitted a rental booking`
          : productName
            ? `Rental booking for ${productName}`
            : "Rental booking received";

    activities.push({
      id: `rental-${rental.id}`,
      type: "rental_booking",
      title: "New rental booking received",
      description: rental.requestId
        ? `Booking ${rental.requestId} · ${details}`
        : details,
      timestamp: timestamp.toISOString(),
      relatedId: rental.requestId || rental.id,
    });
  }

  for (const testimonial of testimonials) {
    const timestamp = getTimestamp(testimonial.createdAt);
    if (
      !testimonial.id ||
      !timestamp ||
      typeof testimonial.status !== "string" ||
      testimonial.status.trim().toLowerCase() !== "pending"
    ) {
      continue;
    }

    const name =
      typeof testimonial.name === "string" ? testimonial.name.trim() : "";
    activities.push({
      id: `testimonial-${testimonial.id}`,
      type: "testimonial_pending",
      title: "New testimonial awaiting approval",
      description: name
        ? `${name} submitted a testimonial awaiting approval`
        : "Testimonial awaiting approval",
      timestamp: timestamp.toISOString(),
      relatedId: testimonial.id,
    });
  }

  for (const sellRequest of sellRequests) {
    const timestamp = getTimestamp(sellRequest.createdAt);
    if (!sellRequest.id || !timestamp) continue;

    const name =
      typeof sellRequest.fullName === "string" ? sellRequest.fullName.trim() : "";
    const product = joinProductDetails(sellRequest.brand, sellRequest.model);
    const productDetails = product
      ? ` for ${product}`
      : typeof sellRequest.category === "string" && sellRequest.category.trim()
        ? ` for ${sellRequest.category.trim()}`
        : "";

    activities.push({
      id: `sell-request-${sellRequest.id}`,
      type: "sell_request",
      title: "New sell request submitted",
      description: name
        ? `${name} submitted a sell request${productDetails}`
        : `Sell request submitted${productDetails}`,
      timestamp: timestamp.toISOString(),
      relatedId: sellRequest.id,
    });
  }

  for (const soldProduct of soldProducts) {
    const timestamp = getTimestamp(soldProduct.occurredAt);
    if (!soldProduct.id || !timestamp) continue;

    const productName =
      typeof soldProduct.productName === "string"
        ? soldProduct.productName.trim()
        : "";
    activities.push({
      id: `sold-product-${soldProduct.id}`,
      type: "product_sold",
      title: "Product marked as sold",
      description: productName
        ? `${productName} marked as sold`
        : "Product marked as sold",
      timestamp: timestamp.toISOString(),
      relatedId: soldProduct.productId || null,
    });
  }

  const safeLimit = Number.isInteger(limit)
    ? Math.max(0, Math.min(limit, ACTIVITY_LIMIT))
    : ACTIVITY_LIMIT;

  return activities
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime() ||
        left.id.localeCompare(right.id),
    )
    .slice(0, safeLimit);
}
