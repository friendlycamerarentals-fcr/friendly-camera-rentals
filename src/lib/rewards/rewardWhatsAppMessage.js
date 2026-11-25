export function formatRewardExpiryDate(expireDate) {
  if (!expireDate) return "";

  if (typeof expireDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expireDate)) {
    const [year, month, day] = expireDate.split("-");
    return `${day}/${month}/${year}`;
  }

  const date = new Date(expireDate);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/-/g, "/");
}

export function normalizeRewardWhatsAppPhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";

  while (digits.length > 10 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return "";
}

export function buildRewardWhatsAppMessage(reward = {}) {
  const rewardAmount = Number(reward.rewardAmount);
  const expiryDate = formatRewardExpiryDate(reward.expireDate);
  const customerName =
    typeof reward.customerName === "string" && reward.customerName.trim()
      ? reward.customerName.trim()
      : "";

  if (
    !Number.isFinite(rewardAmount) ||
    rewardAmount < 0 ||
    !expiryDate
  ) {
    return "";
  }

  const amount = String(rewardAmount);
  return [
    `Dear ${customerName || "valuable customer"}`,
    "Thank you for moving with FCR",
    `You got Reward points ₹${amount} For your last order`,
    "Claim this points on your next order",
    `Available balance ₹${amount}`,
    `Valid upto ${expiryDate}`,
  ].join("\n");
}

export function openRewardWhatsApp(reward = {}) {
  const phone = normalizeRewardWhatsAppPhone(reward.contactNumber);
  const message = buildRewardWhatsAppMessage(reward);

  if (!phone) return { opened: false, error: "phone" };
  if (!message) return { opened: false, error: "reward" };

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return { opened: true, url };
}
