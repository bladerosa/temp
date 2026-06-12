import Box from '@mui/material/Box';

/* Area chart ported from the prototype: grid lines, axis labels, smooth
   catmull-rom area, crosshair marker with tooltip at 01 Sep / 1175. */

const W = 760;
const H = 430;
const PAD_L = 64;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 44;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const Y_TICKS = [0, 1175, 2350, 3525, 4700];
const Y_MAX = 4700;
const X_LABELS = ['30 Aug.', '31 Aug.', '01 Sep.', '02 Sep.', '03 Sep.', '04 Sep.', '04 Sep.', '05 Sep.'];
const DATA = [820, 870, 1175, 2550, 2680, 3050, 3850, 2700];

const x = (i: number) => PAD_L + PLOT_W * (i / (DATA.length - 1));
const y = (v: number) => PAD_T + PLOT_H * (1 - v / Y_MAX);

function smooth(pts: Array<[number, number]>): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const PTS = DATA.map((v, i) => [x(i), y(v)] as [number, number]);
const LINE_PATH = smooth(PTS);
const AREA_PATH = `${LINE_PATH} L ${x(DATA.length - 1)} ${PAD_T + PLOT_H} L ${x(0)} ${PAD_T + PLOT_H} Z`;
const MX = x(2);
const MY = y(1175);

export function BalanceChart() {
  return (
    <Box sx={{ mt: 7, position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3C6FF5" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3C6FF5" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {Y_TICKS.map((t) => (
          <line key={`g${t}`} x1={PAD_L} y1={y(t)} x2={W - PAD_R} y2={y(t)} stroke="#E8ECF2" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {Y_TICKS.map((t) => (
          <text key={`y${t}`} x={PAD_L - 14} y={y(t) + 4} textAnchor="end" fontSize="14" fill="#A3A8B1" fontFamily="Poppins">
            {t}
          </text>
        ))}
        <path d={AREA_PATH} fill="url(#areaFill)" />
        <path d={LINE_PATH} fill="none" stroke="#3C6FF5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={MX} y1={PAD_T} x2={MX} y2={PAD_T + PLOT_H} stroke="#A3A8B1" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={PAD_L} y1={MY} x2={MX} y2={MY} stroke="#A3A8B1" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={MX} cy={MY} r="6" fill="#3C6FF5" stroke="#fff" strokeWidth="2.5" />
        {X_LABELS.map((l, i) => (
          <text key={`x${i}`} x={x(i)} y={H - 16} textAnchor="middle" fontSize="14" fill="#71757E" fontFamily="Poppins">
            {l}
          </text>
        ))}
        <g transform={`translate(${MX + 24},${MY - 18})`}>
          <rect
            x="0"
            y="0"
            width="244"
            height="60"
            rx="14"
            fill="#fff"
            stroke="#E8ECF2"
            strokeWidth="1"
            filter="drop-shadow(0 12px 24px rgba(145,158,171,0.22))"
          />
          <text x="22" y="36" fontSize="18" fontFamily="Poppins" fill="#1F2025">
            <tspan>Balance: </tspan>
            <tspan fontWeight="700">1,175.00 USD</tspan>
          </text>
        </g>
      </svg>
    </Box>
  );
}
