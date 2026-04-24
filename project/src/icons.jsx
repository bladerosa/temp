// Simple stroke icons, 1.5px stroke, 16/18/20 sizes
const Icon = ({ d, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.5, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const IconChevronDown = (p) => <Icon {...p} d={<polyline points="6 9 12 15 18 9" />} />;
const IconChevronRight = (p) => <Icon {...p} d={<polyline points="9 6 15 12 9 18" />} />;
const IconChevronLeft = (p) => <Icon {...p} d={<polyline points="15 6 9 12 15 18" />} />;
const IconPlus = (p) => <Icon {...p} d={<g><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></g>} />;
const IconSearch = (p) => <Icon {...p} d={<g><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></g>} />;
const IconX = (p) => <Icon {...p} d={<g><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g>} />;
const IconCheck = (p) => <Icon {...p} d={<polyline points="20 6 9 17 4 12"/>} />;
const IconSettings = (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></g>} />;
const IconBell = (p) => <Icon {...p} d={<g><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></g>} />;
const IconDownload = (p) => <Icon {...p} d={<g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></g>} />;
const IconFilter = (p) => <Icon {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>} />;
const IconUsers = (p) => <Icon {...p} d={<g><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></g>} />;
const IconCalendar = (p) => <Icon {...p} d={<g><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></g>} />;
const IconClock = (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></g>} />;
const IconEdit = (p) => <Icon {...p} d={<g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></g>} />;
const IconTrash = (p) => <Icon {...p} d={<g><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></g>} />;
const IconCopy = (p) => <Icon {...p} d={<g><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></g>} />;
const IconLink = (p) => <Icon {...p} d={<g><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></g>} />;
const IconZap = (p) => <Icon {...p} d={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>} />;
const IconInfo = (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></g>} />;
const IconMail = (p) => <Icon {...p} d={<g><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></g>} />;

Object.assign(window, {
  IconChevronDown, IconChevronRight, IconChevronLeft, IconPlus, IconSearch, IconX,
  IconCheck, IconSettings, IconBell, IconDownload, IconFilter, IconUsers,
  IconCalendar, IconClock, IconEdit, IconTrash, IconCopy, IconLink, IconZap,
  IconInfo, IconMail
});
