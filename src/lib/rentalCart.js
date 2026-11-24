const withoutLegacyQuantity = (item) =>
  Object.fromEntries(
    Object.entries(item).filter(([key]) => key !== "quantity"),
  );

export function normalizeRentalCart(cart) {
  const seenProductIds = new Set();

  return cart.reduce((items, item) => {
    if (seenProductIds.has(item.id)) {
      return items;
    }

    seenProductIds.add(item.id);
    items.push(withoutLegacyQuantity(item));
    return items;
  }, []);
}

export function addRentalProductToCart(cart, product) {
  if (cart.some((item) => item.id === product.id)) {
    return { cart, added: false };
  }

  return {
    cart: [...cart, withoutLegacyQuantity(product)],
    added: true,
  };
}
