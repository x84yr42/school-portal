export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "EVENT", label: "Event" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "ACADEMIC", label: "Academic" },
] as const;

export const ANNOUNCEMENT_PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "URGENT", label: "Urgent" },
  { value: "EMERGENCY", label: "Emergency" },
] as const;

export const INVOICE_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "SENT", label: "Sent", color: "blue" },
  { value: "PARTIALLY_PAID", label: "Partially Paid", color: "yellow" },
  { value: "PAID", label: "Paid", color: "green" },
  { value: "OVERDUE", label: "Overdue", color: "red" },
  { value: "CANCELLED", label: "Cancelled", color: "gray" },
] as const;

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_DEPOSIT", label: "Bank Deposit" },
  { value: "ONLINE", label: "Online Payment" },
  { value: "OTHER", label: "Other" },
] as const;

export const ACTIVITY_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "CLOSED", label: "Closed", color: "blue" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
] as const;

export const NOTIFICATION_TYPES = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PAYMENT", label: "Payment" },
  { value: "SCHEDULE", label: "Schedule" },
  { value: "PICKUP", label: "Pickup Reminder" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "SYSTEM", label: "System" },
] as const;

export const CALENDAR_EVENT_TYPES = [
  { value: "HOLIDAY", label: "Holiday", color: "red" },
  { value: "HALF_DAY", label: "Half Day", color: "yellow" },
  { value: "EARLY_DISMISSAL", label: "Early Dismissal", color: "orange" },
  { value: "EVENT", label: "Event", color: "blue" },
  { value: "EXAM", label: "Exam", color: "purple" },
  { value: "BREAK", label: "Break", color: "green" },
] as const;

export const USER_ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin Staff" },
  { value: "TEACHER", label: "Teacher" },
  { value: "PARENT", label: "Parent/Guardian" },
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Guardian",
  "Grandparent",
  "Sibling",
  "Other",
] as const;
