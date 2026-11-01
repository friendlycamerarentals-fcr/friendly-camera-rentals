"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Loader2, Search, UserRound, X } from "lucide-react";
import DatePicker from "react-datepicker";
import { toast } from "sonner";
import { validateManualRewardInput } from "@/lib/rewards/manualReward";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#F5A623]";

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(dateOnly) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CreateManualRewardModal({ open, onClose, onCreated }) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState({
    query: "",
    customers: [],
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rewardAmount, setRewardAmount] = useState("");
  const [generatedAt, setGeneratedAt] = useState(getTodayDate);
  const [searchingQuery, setSearchingQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitLockRef = useRef(false);

  useEffect(() => {
    const query = customerSearch.trim();
    if (!open || selectedCustomer || query.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearchingQuery(query);
        const response = await fetch(
          `/api/customers?search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to search customers.");
        }
        setCustomerResults({ query, customers: result.data || [] });
      } catch (error) {
        if (error.name !== "AbortError") {
          setCustomerResults({ query, customers: [] });
          setErrorMessage(error.message || "Failed to search customers.");
          toast.error(error.message || "Failed to search customers.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchingQuery((current) => (current === query ? "" : current));
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, customerSearch, selectedCustomer]);

  if (!open) return null;

  const customers =
    customerResults.query === customerSearch.trim()
      ? customerResults.customers
      : [];
  const searching =
    customerSearch.trim().length >= 2 &&
    searchingQuery === customerSearch.trim();
  const validation = validateManualRewardInput({
    customerRecordId: selectedCustomer?.id,
    rewardAmount,
    generatedAt,
  });
  const amountError =
    rewardAmount && !/^\d+(?:\.\d{1,2})?$/.test(rewardAmount.trim())
      ? "Enter a positive amount with no more than 2 decimal places."
      : rewardAmount && Number(rewardAmount) <= 0
        ? "Reward amount must be greater than zero."
        : "";
  const dateError =
    !generatedAt
      ? "Select a reward start date."
      : !/^\d{4}-\d{2}-\d{2}$/.test(generatedAt) ||
          Number.isNaN(new Date(`${generatedAt}T00:00:00.000Z`).getTime()) ||
          new Date(`${generatedAt}T00:00:00.000Z`)
            .toISOString()
            .slice(0, 10) !== generatedAt
        ? "Select a valid reward start date."
        : "";

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitLockRef.current) return;

    const currentValidation = validateManualRewardInput({
      customerRecordId: selectedCustomer?.id,
      rewardAmount,
      generatedAt,
    });
    if (!currentValidation.ok) {
      setErrorMessage(currentValidation.message);
      return;
    }

    submitLockRef.current = true;
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerRecordId: selectedCustomer.id,
          rewardAmount,
          generatedAt,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create reward.");
      }

      toast.success("Manual reward created successfully.");
      await onCreated();
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Failed to create reward.");
      toast.error(error.message || "Failed to create reward.");
      submitLockRef.current = false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_60px_rgba(0,0,0,.45)]">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Create Manual Reward
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Create a reward for an existing customer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <section>
            <label
              htmlFor="manual-reward-customer-search"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Search Customer
            </label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                id="manual-reward-customer-search"
                value={customerSearch}
                onChange={(event) => {
                  setCustomerSearch(event.target.value);
                  setSearchingQuery(event.target.value.trim());
                  setSelectedCustomer(null);
                  setErrorMessage("");
                }}
                placeholder="Name, Customer ID, mobile or email"
                autoComplete="off"
                className={`${inputClass} pl-10`}
              />
              {searching && (
                <Loader2
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#F5A623]"
                />
              )}
            </div>

            {selectedCustomer ? (
              <div className="mt-3 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/5 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    Selected customer
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch("");
                    }}
                    className="text-xs font-medium text-[#F5A623] hover:text-[#FFB800]"
                  >
                    Change
                  </button>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <CustomerInfo label="Full Name" value={selectedCustomer.name} />
                  <CustomerInfo
                    label="Customer ID"
                    value={selectedCustomer.customerId}
                  />
                  <CustomerInfo label="Email" value={selectedCustomer.email} />
                  <CustomerInfo
                    label="Contact Number"
                    value={selectedCustomer.phoneNumber || "-"}
                  />
                </div>
              </div>
            ) : customerSearch.trim().length < 2 ? (
              <p className="mt-2 text-xs text-zinc-500">
                Enter at least 2 characters to search existing customers.
              </p>
            ) : !searching && customers.length === 0 ? (
              <p className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-400">
                No matching customers found.
              </p>
            ) : (
              customers.length > 0 && (
                <ul className="mt-2 max-h-56 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10 bg-black/50">
                  {customers.map((customer) => (
                    <li key={customer.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch(customer.name);
                          setSearchingQuery("");
                          setErrorMessage("");
                        }}
                        className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-white/5"
                      >
                        <UserRound
                          size={18}
                          className="mt-0.5 shrink-0 text-[#F5A623]"
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-white">
                            {customer.name}{" "}
                            <span className="text-xs text-zinc-500">
                              {customer.customerId}
                            </span>
                          </span>
                          <span className="mt-1 block break-all text-xs text-zinc-400">
                            {customer.email} · {customer.phoneNumber || "No contact"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="manual-reward-amount"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Reward Amount (₹)
              </label>
              <input
                id="manual-reward-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={rewardAmount}
                onChange={(event) => {
                  setRewardAmount(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="Enter amount"
                className={inputClass}
              />
              {amountError && (
                <p className="mt-1 text-xs text-red-400">{amountError}</p>
              )}
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Reward Start Date
              </span>
              <DatePicker
                selected={parseDateOnly(generatedAt)}
                onChange={(date) => {
                  if (date) {
                    setGeneratedAt(formatDateOnly(date));
                    setErrorMessage("");
                  }
                }}
                dateFormat="dd/MM/yyyy"
                maxDate={parseDateOnly(getTodayDate())}
                shouldCloseOnSelect
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                todayButton="Today"
                portalId="manual-reward-calendar-portal"
                popperPlacement="bottom-end"
                popperClassName="manual-reward-calendar-popper"
                popperProps={{ strategy: "fixed" }}
                calendarClassName="manual-reward-calendar"
                customInput={
                  <button
                    type="button"
                    aria-label="Choose reward start date"
                    className={`${inputClass} flex min-h-[42px] items-center gap-3 text-left`}
                  >
                    <CalendarDays
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-zinc-400"
                    />
                    <span>{formatDateForDisplay(generatedAt)}</span>
                  </button>
                }
              />
              {dateError && (
                <p className="mt-1 text-xs text-red-400">{dateError}</p>
              )}
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !validation.ok}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#FFB800] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Reward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateForDisplay(dateOnly) {
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
}

function CustomerInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="break-all font-medium text-zinc-200">{value || "-"}</p>
    </div>
  );
}
