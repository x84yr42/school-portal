import React from "react";
import { cn } from "./lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const createIcon = (path: React.ReactNode, displayName: string) => {
  const Icon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("inline-block shrink-0", className)}
      {...props}
    >
      {path}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
};

// Wolf Kit Solid Glyph Style Icons
// Bold, geometric, solid fill with clean lines

export const Home = createIcon(
  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />,
  "Home"
);

export const Megaphone = createIcon(
  <path d="M3 10v4a1 1 0 001 1h3l4 4V5L7 9H4a1 1 0 00-1 1zm14.5 1a4.5 4.5 0 01-2.5 4v-8a4.5 4.5 0 012.5 4zM20 11a1 1 0 000 2h2v-2h-2z" />,
  "Megaphone"
);

export const Calendar = createIcon(
  <path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h2a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h2V3a1 1 0 011-1zM4 10v10h16V10H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H6v-2zm4 0h2v2h-2v-2z" />,
  "Calendar"
);

export const CalendarCheck = createIcon(
  <path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h2a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h2V3a1 1 0 011-1zM4 10v10h16V10H4zm9.5 3l-4 4-2-2 1.4-1.4L10.5 15l2.6-2.6L14.5 13z" />,
  "CalendarCheck"
);

export const CreditCard = createIcon(
  <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v4h16V6H4zm0 6v6h16v-6H4zm2 2h4v2H6v-2z" />,
  "CreditCard"
);

export const Clock = createIcon(
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm-1 3v6l5 3 1-1.7-4-2.3V7h-2z" />,
  "Clock"
);

export const Settings = createIcon(
  <path d="M12 1l2.5 3.3 4.1-.8.8 4.1L22 10l-2.6 3.4.8 4.1-4.1.8L12 22l-2.5-3.3-4.1.8-.8-4.1L2 14l2.6-3.4-.8-4.1 4.1-.8L12 1zm0 6a5 5 0 100 10 5 5 0 000-10z" />,
  "Settings"
);

export const ArrowLeft = createIcon(
  <path d="M15 4l-2-2-7 7 7 7 2-2-4-4h11v-2H10l4-4z" transform="rotate(180 12 12)" />,
  "ArrowLeft"
);

export const UserPlus = createIcon(
  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4zm8-8v4h-2V6h-4V4h4V0h2v4h4v2h-4z" />,
  "UserPlus"
);

export const GraduationCap = createIcon(
  <path d="M12 2L1 7l11 5 9-4v7h2V8L12 2zM3 10v5l9 4 9-4v-5l-9 4-9-4z" />,
  "GraduationCap"
);

export const Palette = createIcon(
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1 0 2-1 2-2 0-1-1-1-1-2 0-1 1-2 2-2h2c2.8 0 5-2.2 5-5 0-5-5.5-9-10-9zm-5 9a2 2 0 110-4 2 2 0 010 4zm3-4a2 2 0 110-4 2 2 0 010 4zm5 0a2 2 0 110-4 2 2 0 010 4zm3 4a2 2 0 110-4 2 2 0 010 4z" />,
  "Palette"
);

export const Pencil = createIcon(
  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />,
  "Pencil"
);

export const Search = createIcon(
  <path d="M10 2a8 8 0 105.3 14.7l4 4 1.4-1.4-4-4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />,
  "Search"
);

export const X = createIcon(
  <path d="M6.3 6.3L17.7 17.7M6.3 17.7L17.7 6.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />,
  "X"
);

export const Users = createIcon(
  <path d="M8 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4zm10-2a3 3 0 100-6 3 3 0 000 6zm0 2c-2 0-4 1-4 2v2h8v-2c0-1-2-2-4-2z" />,
  "Users"
);

export const LogOut = createIcon(
  <path d="M10 4V2H4v20h6v-2H6V4h4zm4 4l-1.4 1.4L14.2 11H7v2h7.2l-1.6 1.6L14 16l4-4-4-4z" />,
  "LogOut"
);

export const Bell = createIcon(
  <path d="M12 2a7 7 0 00-7 7v4l-2 3v1h18v-1l-2-3V9a7 7 0 00-7-7zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />,
  "Bell"
);

export const Shield = createIcon(
  <path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4zm0 2.2l7 3.1v4.7c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V7.3l7-3.1z" />,
  "Shield"
);

export const User = createIcon(
  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />,
  "User"
);

export const ChevronRight = createIcon(
  <path d="M8.6 5L7 6.6l5.4 5.4L7 17.4 8.6 19l7-7-7-7z" />,
  "ChevronRight"
);

export const Plus = createIcon(
  <path d="M11 5v6H5v2h6v6h2v-6h6v-2h-6V5h-2z" />,
  "Plus"
);

export const CheckCircle = createIcon(
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm4.3 5.3l-5 5L9 12l-1.4 1.4 3.7 3.7 6.4-6.4L16.3 9.3z" />,
  "CheckCircle"
);

export const Archive = createIcon(
  <path d="M3 3h18v4H3V3zm2 6h14v12H5V9zm4 2v2h6v-2H9z" />,
  "Archive"
);

export const ArchiveRestore = createIcon(
  <path d="M3 3h18v4H3V3zm2 6h14v12H5V9zm4 2v2h6v-2H9zm3 4l-4 4h8l-4-4z" />,
  "ArchiveRestore"
);

export const BarChart = createIcon(
  <path d="M4 20h4V10H4v10zm6 0h4V4h-4v16zm6 0h4v-8h-4v8z" />,
  "BarChart"
);

export const XCircle = createIcon(
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm4.3 5.3L14 7l-2 2-2-2-2.3 2.3L10 12l-2.3 2.3L10 17l2-2 2 2 2.3-2.3L14 12l2.3-2.7z" />,
  "XCircle"
);

export const Check = createIcon(
  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />,
  "Check"
);

export const FolderOpen = createIcon(
  <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v10h16V8H11l-2-2H4z" />,
  "FolderOpen"
);

export const Download = createIcon(
  <path d="M12 2v13l4-4 1.4 1.4L12 17.8 5.6 12.4 7 11l4 4V2h2zm-8 16v2h16v-2H4z" />,
  "Download"
);

export const Upload = createIcon(
  <path d="M12 17V4l-4 4-1.4-1.4L12 1.2l5.4 5.4L16 8l-4-4v13h-2zm-8 3v2h16v-2H4z" />,
  "Upload"
);

export const FileText = createIcon(
  <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h4v2H8V8z" />,
  "FileText"
);

export const Trash = createIcon(
  <path d="M6 7a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1zm2-4h8v2H8V3zm-3 4h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7zm4 2v10h2V9H8zm4 0v10h2V9h-2z" />,
  "Trash"
);

export const CheckCheck = createIcon(
  <path d="M18 7l-1.4-1.4-6.6 6.6-2.6-2.6L6 11l4 4 8-8zm-7 8l-1.4-1.4L11 15l1.4 1.4L11 15zm7-4l-6.6 6.6-2.6-2.6L11 17l4 4 8-8-2-2z" transform="translate(-2, -2)" />,
  "CheckCheck"
);

export const LayoutDashboard = createIcon(
  <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
  "LayoutDashboard"
);

export const BookOpen = createIcon(
  <path d="M2 4l10 2 10-2v16l-10 2-10-2V4zm10 14l8-1.5V5.5L12 7v11zM4 5.5l8 1.5V18.5L4 17V5.5z" />,
  "BookOpen"
);

export const Filter = createIcon(
  <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />,
  "Filter"
);

export const ArrowUpDown = createIcon(
  <path d="M12 4l-4 4h3v8H8l4 4 4-4h-3V8h3l-4-4z" />,
  "ArrowUpDown"
);

export const Image = createIcon(
  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm4 8l3-4 4 5h5V8H6v6h2z" />,
  "Image"
);

export const Eye = createIcon(
  <path d="M12 5C7 5 2.7 8 1 12c1.7 4 6 7 11 7s9.3-3 11-7c-1.7-4-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6z" />,
  "Eye"
);

export const Edit = createIcon(
  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />,
  "Edit"
);

export const AlertTriangle = createIcon(
  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />,
  "AlertTriangle"
);

export const Baby = createIcon(
  <path d="M12 2C9.2 2 7 4.2 7 7c0 1.4.6 2.7 1.5 3.6C5.6 11.5 3 14 3 17v2h18v-2c0-3-2.6-5.5-5.5-6.4C16.4 9.7 17 8.4 17 7c0-2.8-2.2-5-5-5zm0 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm-4 11c0-2.2 1.8-4 4-4s4 1.8 4 4H8z" />,
  "Baby"
);

export const Trash2 = createIcon(
  <path d="M6 7a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1zm2-4h8v2H8V3zm-3 4h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7zm4 2v10h2V9H8zm4 0v10h2V9h-2z" />,
  "Trash2"
);
