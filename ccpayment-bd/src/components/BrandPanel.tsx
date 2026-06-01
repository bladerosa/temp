import { Box } from '@mui/material';

export function BrandPanel() {
  return (
    <Box
      component="aside"
      sx={{
        position: 'relative',
        background:
          'radial-gradient(120% 80% at 20% 110%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%),' +
          'radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%),' +
          'linear-gradient(160deg, #2D5DE6 0%, #3C6FF5 55%, #4A7DFA 100%)',
        color: '#fff',
        overflow: 'hidden',
        p: '56px 64px',
        flexDirection: 'column',
        display: { xs: 'none', md: 'flex' },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 'auto -10% -30% -20%',
          height: '70%',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Cubes />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: '#fff',
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="3" width="26" height="26" rx="7" fill="#3C6FF5" />
            <path
              d="M16 7v18M9.5 9.5a9 9 0 0 0 0 13M22.5 9.5a9 9 0 0 1 0 13"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <Box sx={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.3px' }}>ccpayment</Box>
          <Box sx={{ mt: '6px', fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
            Referral Dashboard
          </Box>
        </Box>
      </Box>

      <Box
        component="h1"
        sx={{
          position: 'relative',
          zIndex: 2,
          mt: 'auto',
          mb: 'auto',
          color: '#fff',
          fontSize: 64,
          lineHeight: 1.08,
          fontWeight: 800,
          letterSpacing: '-1.5px',
          maxWidth: 560,
        }}
      >
        Look forward to{' '}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '6px',
              height: '12px',
              background: 'secondary.main',
              opacity: 0.85,
              zIndex: -1,
              borderRadius: '2px',
              bgcolor: 'secondary.main',
            },
          }}
        >
          cooperate
        </Box>
        <br />
        with you.
      </Box>
    </Box>
  );
}

function Cubes() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        '& svg': { position: 'absolute' },
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 240 240"
        fill="none"
        sx={{ top: '8%', right: '-4%', width: 220, opacity: 0.55, animation: 'float 14s ease-in-out infinite' }}
      >
        <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M120 30 L210 80 L210 175 L120 225 L30 175 L30 80 Z" />
          <path d="M120 30 L120 130 M120 130 L210 80 M120 130 L30 80 M120 130 L120 225" />
          <circle cx="120" cy="130" r="36" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.6)" />
        </g>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 320 320"
        fill="none"
        sx={{ top: '38%', right: '18%', width: 320, opacity: 0.45, animation: 'float 18s ease-in-out infinite reverse' }}
      >
        <g stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M160 40 L280 105 L280 230 L160 295 L40 230 L40 105 Z" />
          <path d="M160 40 L160 170 M160 170 L280 105 M160 170 L40 105 M160 170 L160 295" />
        </g>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 400 400"
        fill="none"
        sx={{ bottom: '-6%', left: '-4%', width: 380, opacity: 0.5, animation: 'float 22s ease-in-out infinite' }}
      >
        <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M200 50 L350 130 L350 290 L200 370 L50 290 L50 130 Z" />
          <path d="M200 50 L200 210 M200 210 L350 130 M200 210 L50 130 M200 210 L200 370" />
          <circle cx="200" cy="210" r="60" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" />
          <circle cx="200" cy="210" r="28" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" />
        </g>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 160 160"
        fill="none"
        sx={{ top: '6%', left: '36%', width: 140, opacity: 0.35, animation: 'float 12s ease-in-out infinite reverse' }}
      >
        <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M80 20 L140 55 L140 120 L80 155 L20 120 L20 55 Z" />
          <path d="M80 20 L80 88 M80 88 L140 55 M80 88 L20 55 M80 88 L80 155" />
        </g>
      </Box>
    </Box>
  );
}
