export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    GENUINE_USED: "Genuine OEM Used",
    REFURBISHED: "Tested & Refurbished",
    RECONDITIONED: "Reconditioned",
    OPEN_BOX: "Open Box / Surplus",
    OEM_USED: "OEM Original",
    AFTERMARKET_USED: "Aftermarket Tested",
    DAMAGED_PARTS: "Salvage / For Parts",
  };
  return map[condition] || condition.replace(/_/g, " ");
}

export function getConditionBadge(condition: string) {
  switch (condition) {
    case "GENUINE_USED":
    case "OEM_USED":
      return { label: "Genuine OEM", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    case "REFURBISHED":
      return { label: "Refurbished", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "OPEN_BOX":
      return { label: "Open Box", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    case "DAMAGED_PARTS":
      return { label: "For Parts", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    default:
      return { label: "Tested Used", bg: "bg-slate-100 text-slate-700 border-slate-200" };
  }
}

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return { label: "Delivered", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return { label: status.replace(/_/g, " "), bg: "bg-blue-100 text-blue-800 border-blue-300" };
    case "CONFIRMED":
    case "PROCESSING":
    case "PACKED":
      return { label: status.replace(/_/g, " "), bg: "bg-indigo-100 text-indigo-800 border-indigo-300" };
    case "CANCELLED":
    case "REFUNDED":
      return { label: status, bg: "bg-rose-100 text-rose-800 border-rose-300" };
    default:
      return { label: status, bg: "bg-amber-100 text-amber-800 border-amber-300" };
  }
}

export function getOfferStatusBadge(status: string) {
  switch (status) {
    case "ACCEPTED":
      return { label: "Deal Accepted", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "COUNTER_OFFER":
      return { label: "Counter Offer", bg: "bg-blue-100 text-blue-800 border-blue-300" };
    case "PENDING":
      return { label: "Under Review", bg: "bg-amber-100 text-amber-800 border-amber-300" };
    case "REJECTED":
    case "EXPIRED":
    case "CANCELLED":
      return { label: status, bg: "bg-rose-100 text-rose-800 border-rose-300" };
    default:
      return { label: status, bg: "bg-slate-100 text-slate-800 border-slate-300" };
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
