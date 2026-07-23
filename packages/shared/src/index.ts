export * from "./constants";

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface ActivityChoice {
  id: string;
  label: string;
  image?: string;
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface TargetAudience {
  type: "all" | "grade" | "class";
  value?: number | string;
}

// ─── Notification Payload ────────────────────────────────────────────────────

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  channels: ("push" | "email" | "sms")[];
  userIds?: string[];
  targetAll?: boolean;
}

// ─── Utility Types ───────────────────────────────────────────────────────────

export type DateString = string; // ISO date string
export type TimeString = string; // "HH:mm" format

export function formatCurrency(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: TimeString): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isOverdue(dueDate: Date | string): boolean {
  return new Date(dueDate) < new Date();
}

export function daysUntil(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
