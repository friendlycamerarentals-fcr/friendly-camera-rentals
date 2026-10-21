"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Search,
  UserRound,
  Loader2,
  Gift,
  CalendarDays,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { openRentalWhatsApp } from "@/lib/whatsappBookingMessage";
import {
  DURATION_LIMITS,
  DURATION_UNITS,
  formatDuration,
  getDurationListingPrice,
  parsePricingKey,
  toPaise,
  updatePricesForSharedDuration,
} from "@/lib/rentalDuration";
import {
  RENTAL_PAYMENT_METHODS,
  validateExpectedAdvance,
} from "@/lib/rentalPayment";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-[#F5A623] transition";
const labelCls = "mb-1 block text-[11px] text-zinc-400";
const sectionCls =
  "rounded-2xl border border-white/10 bg-black p-4 sm:p-5";
const sectionTitleCls =
  "mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]";
const itemCardCls =
  "rounded-xl border border-white/10 bg-zinc-900/40 p-3 sm:p-4";
const itemBadgeCls =
  "rounded-lg bg-[#F5A623]/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F5A623]";

const inr = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

let itemKeySeed = 0;
const newItemKey = () => `item-${Date.now()}-${itemKeySeed++}-${Math.floor(Math.random() * 1e6)}`;

const emptyItem = () => ({
  key: newItemKey(),
  category: "",
  productId: "",
  price: "",
  priceCustom: false,
});

export default function ManualRentalForm({ open, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [items, setItems] = useState([emptyItem()]);
  const [sharedDurationType, setSharedDurationType] = useState("standard");
  const [sharedDurationKey, setSharedDurationKey] = useState("");
  const [customDurationValue, setCustomDurationValue] = useState("");
  const [customDurationUnit, setCustomDurationUnit] = useState(DURATION_UNITS.DAYS);

  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [bookingDate, setBookingDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [advanceExpected, setAdvanceExpected] = useState("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState("UPI");
  const [submittingAction, setSubmittingAction] = useState(null);
  const submitting = submittingAction !== null;
  const submitLockRef = useRef(false);
  const confirmPaymentKeyRef = useRef(null);

  const [reward, setReward] = useState(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardApplied, setRewardApplied] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Reward lookup for the selected customer + camera product (race-safe:
  // only the response for the latest query key updates state).
  const rewardQueryRef = useRef("");
  const checkReward = (customer, productIdToCheck) => {
    const key =
      customer?.customerId && productIdToCheck
        ? `${customer.customerId}|${productIdToCheck}`
        : "";
    rewardQueryRef.current = key;
    setReward(null);
    setRewardApplied(false);
    setRewardLoading(Boolean(key));
    if (!key) return;

    fetch("/api/rewards/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer.customerId,
        productId: productIdToCheck,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (rewardQueryRef.current !== key) return;
        setReward(result?.available ? result.reward : null);
        if (!result?.available) {
          toast.info(
            "No eligible reward is available for this customer and rental.",
            { duration: 3500 },
          );
        }
      })
      .catch(() => {
        if (rewardQueryRef.current === key) {
          setReward(null);
          setRewardLoading(false);
        }
      })
      .finally(() => {
        if (rewardQueryRef.current === key) setRewardLoading(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoadingData(true);
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/rental-products"),
        ]);
        const customersResult = await customersRes.json();
        const productsResult = await productsRes.json();
        if (cancelled) return;

        if (customersResult.success) setCustomers(customersResult.data || []);
        if (productsResult.success) setProducts(productsResult.data || []);
      } catch (error) {
        if (!cancelled) toast.error("Failed to load customers and products.");
        console.error(error);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].filter(Boolean).sort(),
    [products],
  );

  const sharedDurationOptions = useMemo(() => {
    const options = new Map();
    products.forEach((product) => {
      Object.entries(product.pricing || {}).forEach(([duration, price]) => {
        if (Number(price) > 0 && parsePricingKey(duration)) {
          options.set(duration, Number(price));
        }
      });
    });
    return [...options.entries()].map(([duration, price]) => ({
      duration,
      display: formatDuration(parsePricingKey(duration)),
      price,
    }));
  }, [products]);

  const productsById = useMemo(
    () => products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {}),
    [products],
  );

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 6);
    return customers
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.customerId?.toLowerCase().includes(q) ||
          c.phoneNumber?.includes(q) ||
          c.email?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, customerQuery]);

  // The first camera-category item drives the reward check (rewards are
  // camera-only per the existing rules).
  const rewardCheckProductId = useMemo(() => {
    const cameraItem = items.find(
      (item) => productsById[item.productId]?.category === "camera",
    );
    return cameraItem?.productId || items[0]?.productId || "";
  }, [items, productsById]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const previousKey = rewardQueryRef.current;
    const nextKey = selectedCustomer.customerId && rewardCheckProductId
      ? `${selectedCustomer.customerId}|${rewardCheckProductId}`
      : "";
    if (previousKey !== nextKey) {
      checkReward(selectedCustomer, rewardCheckProductId);
    }
  }, [selectedCustomer, rewardCheckProductId]);

  const updateItem = (key, patch) => {
    setItems((previous) =>
      previous.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const currentSharedDuration = {
    type: sharedDurationType,
    key: sharedDurationKey,
    customValue: customDurationValue,
    customUnit: customDurationUnit,
  };

  const updateSharedDuration = (duration) => {
    setSharedDurationType(duration.type);
    setSharedDurationKey(duration.key);
    setCustomDurationValue(duration.customValue);
    setCustomDurationUnit(duration.customUnit);
    setItems((previous) =>
      updatePricesForSharedDuration(previous, productsById, duration),
    );
  };

  const setItemCategory = (key, category) => {
    updateItem(key, { category, productId: "", price: "", priceCustom: false });
  };

  const setItemProduct = (key, productId) => {
    const product = productsById[productId];
    updateItem(key, {
      productId,
      price: getDurationListingPrice(product, currentSharedDuration),
      priceCustom: false,
    });
  };

  const addItem = () => {
    setItems((previous) => [...previous, emptyItem()]);
  };

  const removeItem = (key) => {
    setItems((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((item) => item.key !== key);
    });
  };

  const itemProducts = (item) =>
    item.category
      ? products.filter((p) => p.category === item.category && p.available !== false)
      : [];

  const itemPriceState = (item) => {
    const product = productsById[item.productId];
    if (sharedDurationType === "custom") {
      return hasCustomDurationInput()
        ? { kind: item.price ? "custom" : "pending", listing: null }
        : { kind: "pending", listing: null };
    }
    const listing = Number(product?.pricing?.[sharedDurationKey] || 0);
    if (!(listing > 0)) {
      return { kind: item.price ? "negotiated" : "pending", listing: 0 };
    }
    const price = Number(item.price);
    return {
      kind: toPaise(listing) === toPaise(price) ? "standard" : "negotiated",
      listing,
    };
  };

  function hasCustomDurationInput(value = customDurationValue, unit = customDurationUnit) {
    const numericValue = Number(value);
    const limits = DURATION_LIMITS[unit] || DURATION_LIMITS[DURATION_UNITS.DAYS];
    return Number.isInteger(numericValue) && numericValue >= limits.min && numericValue <= limits.max;
  }

  const sharedDurationDisplay = () => {
    if (sharedDurationType === "custom") {
      return hasCustomDurationInput()
        ? `${Number(customDurationValue)} ${customDurationUnit}`
        : "—";
    }
    const parsed = parsePricingKey(sharedDurationKey);
    return parsed ? formatDuration(parsed) : "—";
  };

  const itemsPreview = useMemo(
    () =>
      items.map((item) => ({
        item,
        product: productsById[item.productId] || null,
        price: Number(item.price) || 0,
        duration: sharedDurationDisplay(),
        priceState: itemPriceState(item),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, productsById, sharedDurationType, sharedDurationKey, customDurationValue, customDurationUnit],
  );

  const originalAmount = useMemo(() => {
    const total = itemsPreview.reduce(
      (sum, entry) => sum + Math.round(entry.price * 100),
      0,
    );
    return Math.round(total) / 100;
  }, [itemsPreview]);

  const rewardDiscountPreview =
    reward && rewardApplied
      ? Math.min(Number(reward.rewardAmount || 0), Math.max(originalAmount, 0))
      : 0;
  const finalAmountPreview = Math.max(
    Math.round((originalAmount - rewardDiscountPreview) * 100) / 100,
    0,
  );
  const expectedAdvance = Number(advanceExpected) || 0;

  const validateItemsForSubmit = () => {
    if (sharedDurationType === "standard" && !parsePricingKey(sharedDurationKey)) {
      return "Select a shared rental duration for all items.";
    }
    if (
      sharedDurationType === "custom" &&
      !hasCustomDurationInput()
    ) {
      const limits = DURATION_LIMITS[customDurationUnit];
      return `Enter a shared custom duration between ${limits.min} and ${limits.max} ${customDurationUnit === DURATION_UNITS.HOURS ? "hours" : "days"}.`;
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const label = `Item ${index + 1}`;
      const product = productsById[item.productId];

      if (!selectedCustomer) return "Select an existing customer before booking.";
      if (!item.category) {
        return `${label}: select a category.`;
      }
      if (!product) {
        return `${label}: select a rental product.`;
      }
      const agreedPrice = Number(item.price);
      if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) {
        return `${label}: enter a positive agreed rental price for the shared duration.`;
      }
    }
    return null;
  };

  const resetForm = () => {
    setItems([emptyItem()]);
    setSharedDurationType("standard");
    setSharedDurationKey("");
    setCustomDurationValue("");
    setCustomDurationUnit(DURATION_UNITS.DAYS);
    setCustomerQuery("");
    setSelectedCustomer(null);
    setBookingDate("");
    setPickupTime("");
    setNotes("");
    setAdvanceExpected("");
    setAdvancePaymentMethod("UPI");
    setReward(null);
    setRewardApplied(false);
    setCreatedBooking(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose?.();
  };

  const canSubmit =
    selectedCustomer &&
    bookingDate &&
    pickupTime &&
    items.length > 0 &&
    originalAmount > 0 &&
    !submitting;

  const handleSubmit = async (action) => {
    if (submitLockRef.current) return;

    const validationError = validateItemsForSubmit();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!bookingDate || !pickupTime) {
      toast.error("Select the booking date and pickup time.");
      return;
    }

    let validatedAdvance;
    try {
      validatedAdvance = validateExpectedAdvance(advanceExpected);
    } catch (error) {
      toast.error(error.message);
      return;
    }
    if (validatedAdvance > finalAmountPreview) {
      toast.error("Advance cannot exceed the final rental amount.");
      return;
    }
    if (action === "confirm" && validatedAdvance > 0 && !advancePaymentMethod) {
      toast.error("Select the method used to receive the advance.");
      return;
    }

    const payload = {
      action,
      customerId: selectedCustomer.customerId,
      bookingDate,
      pickupTime,
      advanceExpected: validatedAdvance,
      rewardId: reward && rewardApplied ? reward.rewardId : null,
      notes: notes.trim(),
      items: items.map((item) => ({
        productId: item.productId,
        price: Number(item.price),
      })),
      duration:
        sharedDurationType === "standard"
          ? { type: "standard", key: sharedDurationKey }
          : {
              type: "custom",
              customValue: Number(customDurationValue),
              customUnit: customDurationUnit,
            },
      ...(action === "confirm" && validatedAdvance > 0
            ? {
                payment: {
                  amount: validatedAdvance,
                  paymentType: "Advance",
                  method: advancePaymentMethod,
                  idempotencyKey:
                    confirmPaymentKeyRef.current ||
                    (confirmPaymentKeyRef.current = globalThis.crypto.randomUUID()),
                },
              }
            : {}),
    };

    submitLockRef.current = true;
    setSubmittingAction(action);
    try {
      const response = await fetch("/api/admin/rentals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create the rental request.");
      }

      const confirmed = result.data?.status === "Confirmed";
      toast.success(
        confirmed
          ? result.paymentRecord
            ? `Rental ${result.data.requestId} was confirmed and the received advance was recorded.`
            : `Rental ${result.data.requestId} was confirmed with no advance received.`
          : `Rental request created with ${result.items?.length || 1} item(s) in Pending status.`,
        { duration: 6000 },
      );
      setCreatedBooking({
        ...result.data,
        items: result.items || [],
        paymentRecord: result.paymentRecord,
      });
      confirmPaymentKeyRef.current = null;
      onCreated?.({ ...result.data, items: result.items || [] });
    } catch (error) {
      toast.error(error.message || "Failed to create the rental request.");
    } finally {
      submitLockRef.current = false;
      setSubmittingAction(null);
    }
  };

  if (!open) return null;

  if (createdBooking) {
    return (
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-3xl">
            ✅
          </div>
          <h2 className="text-xl font-bold text-white">
            {createdBooking.status === "Confirmed"
              ? "Rental Confirmed"
              : "Rental Request Created"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Booking <span className="font-semibold text-[#F5A623]">{createdBooking.requestId}</span>{" "}
            with {createdBooking.items?.length || 1} item(s) is now{" "}
            <span
              className={`font-semibold ${createdBooking.status === "Confirmed" ? "text-blue-400" : "text-yellow-400"}`}
            >
              {createdBooking.status}
            </span>
            .{" "}
            {createdBooking.status === "Confirmed"
              ? createdBooking.paymentRecord
                ? "The received advance is recorded and verified."
                : "No advance was received; the full rental amount remains outstanding."
              : "It remains pending. Record any advance later in Rental Details after it is received."}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => openRentalWhatsApp(createdBooking)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 cursor-pointer"
            >
              <FaWhatsapp size={16} />
              WhatsApp Customer
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/5 cursor-pointer"
            >
              Done
            </button>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            Opening WhatsApp prefills the message; you still need to press Send.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-4 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              New Manual Rental Request
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              For phone / WhatsApp enquiries. Create a pending request or confirm now; recording an advance is optional.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close form"
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {loadingData ? (
            <div className="flex items-center justify-center gap-2 py-12 text-zinc-400">
              <Loader2 size={18} className="animate-spin" />
              Loading customers and products...
            </div>
          ) : (
            <>
              {/* ── 1. Customer information ─────────────────────────────── */}
              <div className={sectionCls}>
                <h3 className={sectionTitleCls}>Customer Information</h3>
                {selectedCustomer ? (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5A623]/15 text-zinc-200">
                        <UserRound size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {selectedCustomer.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {selectedCustomer.customerId} ·{" "}
                          {selectedCustomer.phoneNumber || "No phone"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {selectedCustomer.email}
                        </p>
                        {selectedCustomer.address && (
                          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                            {selectedCustomer.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerQuery("");
                        checkReward(null, "");
                      }}
                      className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 cursor-pointer"
                    >
                      Change customer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        value={customerQuery}
                        onChange={(e) => setCustomerQuery(e.target.value)}
                        placeholder="Search by name, customer ID, phone or email"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                    {customerQuery.trim() && (
                      <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/60 p-1.5">
                        {filteredCustomers.length ? (
                          filteredCustomers.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerQuery("");
                                checkReward(c, rewardCheckProductId);
                              }}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5 cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {c.name}{" "}
                                  <span className="text-xs text-amber-400">
                                    {c.customerId}
                                  </span>
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {c.phoneNumber || "No phone"} · {c.email}
                                </p>
                              </div>
                              <span className="text-xs text-zinc-500">Select</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-xs text-zinc-400">
                            <p className="mb-1">No registered customer matches.</p>
                            <p className="text-zinc-500">
                              Ask the customer to register and complete their
                              profile first — new customers cannot be created here.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── 2. Rental items & schedule ───────────────────────────── */}
              <div className={sectionCls}>
                <h3 className={sectionTitleCls}>Rental Items &amp; Schedule</h3>

                <div className="mb-4 max-w-md">
                  <label className={labelCls}>Shared duration for all rental items</label>
                  <select
                    value={sharedDurationType === "custom" ? "custom" : sharedDurationKey}
                    onChange={(event) => {
                      if (event.target.value === "custom") {
                        updateSharedDuration({ type: "custom", key: "", customValue: "", customUnit: customDurationUnit });
                      } else {
                        updateSharedDuration({ type: "standard", key: event.target.value, customValue: "", customUnit: customDurationUnit });
                      }
                    }}
                    className={inputCls}
                  >
                    <option value="">Select one duration for every product</option>
                    {sharedDurationOptions.map((duration) => (
                      <option key={duration.duration} value={duration.duration}>
                        {duration.display}
                      </option>
                    ))}
                    <option value="custom">Custom Duration</option>
                  </select>
                  <p className="mt-1 text-[11px] text-zinc-500">This duration applies to every product below. Listed prices update automatically; custom agreed prices are preserved when duration changes.</p>
                  {sharedDurationType === "custom" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Duration value</label>
                        <input
                          type="number"
                          min={1}
                          value={customDurationValue}
                          onChange={(event) => {
                            const value = event.target.value;
                            setCustomDurationValue(value);
                            setItems((previous) => updatePricesForSharedDuration(previous, productsById, { type: "custom", key: "", customValue: value, customUnit: customDurationUnit }));
                          }}
                          placeholder="e.g. 24"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Unit</label>
                        <select
                          value={customDurationUnit}
                          onChange={(event) => {
                            const unit = event.target.value;
                            setCustomDurationUnit(unit);
                            setItems((previous) => updatePricesForSharedDuration(previous, productsById, { type: "custom", key: "", customValue: customDurationValue, customUnit: unit }));
                          }}
                          className={inputCls}
                        >
                          <option value={DURATION_UNITS.HOURS}>Hours</option>
                          <option value={DURATION_UNITS.DAYS}>Days</option>
                        </select>
                      </div>
                      <p className="col-span-2 flex items-center gap-1.5 text-[11px] text-zinc-500"><Clock size={12} />Example: 24 Hours, 5 Days, 15 Hours</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {itemsPreview.map(({ item, product, price }, index) => (
                    <div key={item.key} className={itemCardCls}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={itemBadgeCls}>Item {index + 1}</span>
                          <span className="text-sm text-zinc-300">
                            {product?.name || "No product selected"}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.key)}
                            title="Remove this item"
                            className="rounded-lg border border-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelCls}>Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => setItemCategory(item.key, e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => setItemProduct(item.key, e.target.value)}
                            disabled={!item.category}
                            className={inputCls}
                          >
                            <option value="">
                              {item.category ? "Select product" : "Select category first"}
                            </option>
                            {itemProducts(item).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className={labelCls}>Rental price (agreed with customer)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => {
                              const value = e.target.value;
                              const listingPrice = Number(getDurationListingPrice(product, currentSharedDuration));
                              const priceCustom = sharedDurationType === "custom" || (Number(value) > 0 && toPaise(value) !== toPaise(listingPrice));
                              updateItem(item.key, { price: value, priceCustom });
                            }}
                            placeholder={
                              sharedDurationType === "standard" && itemsPreview[index]?.priceState.listing
                                ? `Standard: ${inr(itemsPreview[index].priceState.listing)}`
                                : "Enter agreed price"
                            }
                            className={inputCls}
                          />
                          <span
                            className={`mt-1 block text-[11px] ${itemPriceState(item).kind === "negotiated" || itemPriceState(item).kind === "custom" ? "text-amber-400" : "text-zinc-500"}`}
                          >
                            {itemPriceState(item).kind === "standard" &&
                              `Standard price ${inr(itemPriceState(item).listing)}`}
                            {itemPriceState(item).kind === "negotiated" &&
                              (itemPriceState(item).listing > 0
                                ? `Custom price (standard: ${inr(itemPriceState(item).listing)})`
                                : "No listed price — enter agreed price")}
                            {itemPriceState(item).kind === "custom" &&
                              "Custom duration — agreed price"}
                            {itemPriceState(item).kind === "pending" &&
                              "Select duration, or enter a price"}
                          </span>
                        </div>
                      </div>
                      {price > 0 && (
                        <p className="mt-1.5 text-[11px] text-zinc-500">
                          {product ? "Agreed" : ""} total for this item:{" "}
                          <span className="text-zinc-300">{inr(price)}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addItem}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 px-4 py-2.5 text-sm font-semibold text-[#F5A623] transition hover:bg-[#F5A623]/20 cursor-pointer"
                >
                  <Plus size={15} />
                  Add More Items
                </button>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Booking Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything the admin should note about this enquiry"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* ── 3. Reward & price breakdown ──────────────────────────── */}
              <div className={sectionCls}>
                <h3 className={sectionTitleCls}>Reward &amp; Price Breakdown</h3>
                <div className="rounded-xl border border-white/10 px-4 py-3">
                  {rewardLoading ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-400">
                      <Loader2 size={14} className="animate-spin" />
                      Checking customer rewards...
                    </p>
                  ) : reward && selectedCustomer ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Gift size={16} className="mt-0.5 text-emerald-400" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-300">
                            {reward.rewardId} — {inr(reward.rewardAmount)} off booking
                          </p>
                          <p className="text-xs text-zinc-500">
                            Belongs to {selectedCustomer.name}. The reward is
                            reserved for this booking when created.
                          </p>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                        <input
                          type="checkbox"
                          checked={rewardApplied}
                          onChange={(e) => setRewardApplied(e.target.checked)}
                          className="h-4 w-4 accent-emerald-400"
                        />
                        Apply reward
                      </label>
                    </div>
                  ) : selectedCustomer ? (
                    <p className="text-sm text-zinc-400">
                      No eligible reward for this customer and rental.
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      Select a customer to check for eligible rewards.
                    </p>
                  )}
                </div>

                {/* Itemized breakdown */}
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-black/40 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide">
                          Rental item
                        </th>
                        <th className="hidden px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide sm:table-cell">
                          Duration
                        </th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide">
                          Agreed price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsPreview.map(({ item, duration }) => (
                        <tr key={item.key} className="border-t border-white/5">
                          <td className="px-3 py-2 text-white">
                            {productsById[item.productId]?.name || "—"}
                          </td>
                          <td className="hidden px-2 py-2 text-zinc-400 sm:table-cell">
                            {duration}
                          </td>
                          <td className="px-3 py-2 text-right text-[#F5A623]">
                            {inr(Number(item.price) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10 bg-black/40">
                        <td className="px-3 py-2 text-zinc-300" colSpan={2}>
                          Total before reward
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-white">
                          {inr(originalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-400">Reward discount</dt>
                    <dd className="text-emerald-400">
                      −{inr(rewardDiscountPreview)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5">
                    <dt className="font-medium text-zinc-300">
                      Final rental amount
                    </dt>
                    <dd className="font-bold text-white">
                      {inr(finalAmountPreview)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-400">Remaining amount due</dt>
                    <dd className="text-white">{inr(finalAmountPreview)}</dd>
                  </div>
                </dl>

                <div className="mt-3 max-w-md">
                  <label className={labelCls}>
                    Advance (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advanceExpected}
                    onChange={(event) => setAdvanceExpected(event.target.value)}
                    className={inputCls}
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Pending saves this as expected only. Confirm records a
                    positive amount as received.
                  </p>
                  {expectedAdvance > 0 && (
                    <div className="mt-2">
                      <label className={labelCls}>
                        Payment method for confirmed advance
                      </label>
                      <select
                        value={advancePaymentMethod}
                        onChange={(event) =>
                          setAdvancePaymentMethod(event.target.value)
                        }
                        className={inputCls}
                      >
                        {RENTAL_PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 4. Review & create ───────────────────────────────────── */}
              <div className={sectionCls}>
                <h3 className={sectionTitleCls}>Review &amp; Create Request</h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-400">Customer</p>
                    <p className="text-white">
                      {selectedCustomer
                        ? `${selectedCustomer.name} · ${selectedCustomer.customerId}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Schedule</p>
                    <p className="flex items-center gap-1.5 text-white">
                      <CalendarDays size={13} />
                      {bookingDate || "—"} · {pickupTime || "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-zinc-400">
                      Rental items ({itemsPreview.length})
                    </p>
                    <ul className="mt-1 space-y-1">
                      {itemsPreview.map(({ item, product, duration }, index) => (
                        <li
                          key={item.key}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-zinc-900/60 px-2.5 py-1.5 text-xs"
                        >
                          <span className="text-white">
                            {index + 1}. {product?.name || "—"}{" "}
                            <span className="text-zinc-500">
                              · {duration}
                            </span>
                          </span>
                          <span className="font-semibold text-[#F5A623]">
                            {inr(Number(item.price) || 0)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Total before reward</p>
                    <p className="text-white">{inr(originalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Final Amount</p>
                    <p className="font-semibold text-white">
                      {inr(finalAmountPreview)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit("pending")}
            disabled={!canSubmit || submitting}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#F5A623]/50 px-4 py-2.5 text-sm font-bold text-[#F5A623] transition hover:bg-[#F5A623]/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAction === "pending" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating request...
              </>
            ) : (
              "Book Rent (Pending)"
            )}
          </button>
          <button
            onClick={() => handleSubmit("confirm")}
            disabled={!canSubmit || submitting}
            title="Confirms the rental immediately. Record an advance only if it was actually received."
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#F5A623]/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAction === "confirm" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Confirming rental...
              </>
            ) : (
              "Book Rent (Confirm)"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
