"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addRentalProductToCart,
  normalizeRentalCart,
} from "@/lib/rentalCart";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const cartRef = useRef([]);

  useEffect(() => {
    const savedCart = normalizeRentalCart(
      JSON.parse(localStorage.getItem("cart")) || [],
    );
    cartRef.current = savedCart;
    // Load the browser-persisted cart after hydration to avoid server/client markup mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateCart = useCallback((nextCartOrUpdater) => {
    const nextCart =
      typeof nextCartOrUpdater === "function"
        ? nextCartOrUpdater(cartRef.current)
        : nextCartOrUpdater;
    cartRef.current = nextCart;
    setCart(nextCart);
  }, []);

  const addToCart = (product) => {
    const result = addRentalProductToCart(cartRef.current, product);
    if (result.added) {
      updateCart(result.cart);
    }
    return result.added;
  };

  const removeFromCart = (id, duration) => {
    updateCart((prev) =>
      prev.filter((item) => !(item.id === id && item.duration === duration)),
    );
  };

  const clearCart = () => {
    updateCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart: updateCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
