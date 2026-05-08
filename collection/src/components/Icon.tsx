// Material/Lucide-style 24px line icons. 1.5px stroke, rounded terminals.
// Each icon receives currentColor so it inherits text color.
import type { CSSProperties } from 'react';

type Props = { size?: number; className?: string; style?: CSSProperties };

const base = (size = 18): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconMenu = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
);
export const IconChevronRight = ({ size, className, style }: Props) => (
  <svg {...base(size ?? 14)} className={className} style={style}><polyline points="9 18 15 12 9 6"/></svg>
);
export const IconChevronDown = ({ size, className, style }: Props) => (
  <svg {...base(size ?? 14)} className={className} style={style}><polyline points="6 9 12 15 18 9"/></svg>
);
export const IconPlus = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
export const IconClose = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
);
export const IconCheck = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polyline points="20 6 9 17 4 12"/></svg>
);
export const IconSearch = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
export const IconBell = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
export const IconHelp = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.5"/></svg>
);
export const IconSettings = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.41.16.78.43 1.06.79"/></svg>
);
export const IconHome = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
);
export const IconChart = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="22" y2="8"/></svg>
);
export const IconMegaphone = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 11v2a4 4 0 0 0 4 4h1l4 4V7L8 11H7a4 4 0 0 0-4 0z"/><path d="M21 4l-3 3v10l3 3"/></svg>
);
export const IconCoin = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 0 1 0 4H9v-4z"/><path d="M9 13h5a2 2 0 0 1 0 4H9v-4z"/></svg>
);
export const IconStore = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 9l1-5h16l1 5"/><path d="M3 9h18v11H3z"/><path d="M9 20v-6h6v6"/></svg>
);
export const IconBolt = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polygon points="13 2 3 14 11 14 9 22 21 10 13 10 15 2"/></svg>
);
export const IconList = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="0.6"/><circle cx="4" cy="12" r="0.6"/><circle cx="4" cy="18" r="0.6"/></svg>
);
export const IconShield = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>
);
export const IconAd = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 12l11-8v16z"/><circle cx="18" cy="12" r="2"/></svg>
);
export const IconHandshake = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 13l4-4 5 4 5-5 4 4-7 7z"/></svg>
);
export const IconClipboard = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><rect x="9" y="3" width="6" height="3" rx="1"/><path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/></svg>
);
export const IconBan = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><line x1="5" y1="5" x2="19" y2="19"/></svg>
);
export const IconMail = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
);
export const IconLog = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M5 4h11l3 3v13H5z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
);
export const IconWallet = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M3 7a2 2 0 0 1 2-2h13v4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9"/><circle cx="17" cy="14" r="1.2"/></svg>
);
export const IconLayers = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polygon points="12 2 22 8 12 14 2 8"/><polyline points="2 13 12 19 22 13"/></svg>
);
export const IconRefresh = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
);
export const IconPlay = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polygon points="6 4 20 12 6 20 6 4"/></svg>
);
export const IconEdit = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M14.7 4.3l5 5L8 21H3v-5z"/><line x1="14" y1="5" x2="19" y2="10"/></svg>
);
export const IconTrash = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
);
export const IconCopy = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
);
export const IconInfo = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.6"/></svg>
);
export const IconDownload = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M12 4v12"/><polyline points="6 12 12 18 18 12"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
);
export const IconAlert = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><path d="M12 3l10 18H2z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="18" r="0.6"/></svg>
);
export const IconCalendar = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
);
export const IconClock = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
);
export const IconArrowDownCircle = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="7" x2="12" y2="16"/></svg>
);
export const IconArrowUpCircle = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><circle cx="12" cy="12" r="9"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="17" x2="12" y2="8"/></svg>
);
export const IconScale = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><line x1="12" y1="3" x2="12" y2="21"/><path d="M5 9l-3 7c0 2 6 2 6 0z"/><path d="M19 9l-3 7c0 2 6 2 6 0z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
);
export const IconLowBattery = ({ size, className, style }: Props) => (
  <svg {...base(size)} className={className} style={style}><rect x="3" y="8" width="16" height="9" rx="2"/><line x1="22" y1="11" x2="22" y2="14"/><line x1="6" y1="11" x2="9" y2="11"/></svg>
);
export const IconBoxEmpty = ({ size, className, style }: Props) => (
  <svg {...base(size ?? 36)} className={className} style={style}><rect x="3" y="6" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="6" x2="9" y2="3"/><line x1="15" y1="6" x2="15" y2="3"/></svg>
);
