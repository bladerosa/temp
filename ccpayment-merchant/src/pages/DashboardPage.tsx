import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { ChevronDown, ChevronRight, Eye, Info } from 'lucide-react';
import { GuideCard, GuideButtons } from '@/components/dashboard/GuideCard';
import { BalanceChart } from '@/components/dashboard/BalanceChart';
import { SvgMarkup } from '@/components/SvgMarkup';
import { COIN_BADGES, COIN_ROWS } from '@/data/coins';

const panelSx = {
  bgcolor: 'background.paper',
  borderRadius: '20px',
  boxShadow: '0 0 1px rgba(145,158,171,0.30), 0 18px 36px -12px rgba(145,158,171,0.22)',
  p: '30px 32px',
} as const;

const pillBtnSx = {
  height: 52,
  px: 9,
  borderRadius: '12px',
  bgcolor: 'primary.lighter',
  color: 'primary.dark',
  fontFamily: 'inherit',
  fontSize: 17,
  fontWeight: 700,
  transition: 'background 120ms',
  '&:hover': { bgcolor: '#C5DBFD' },
} as const;

const DashboardPage = observer(function DashboardPage() {
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <Box sx={{ flex: 1, p: '0 40px 56px' }}>
      <GuideCard open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Overview header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', m: '36px 0 22px' }}>
        <Typography component="h1" sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary' }}>
          Overview
        </Typography>
        <GuideButtons cardOpen={guideOpen} onOpenCard={() => setGuideOpen(true)} />
      </Box>

      {/* Overview grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 410px', gap: 7 }}>
        {/* Estimated balance */}
        <Box component="section" sx={panelSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
              Estimated Balance
              <Box sx={{ color: 'grey.400', display: 'inline-flex' }}>
                <Info size={20} />
              </Box>
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 50,
                px: '18px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              Month
              <Box sx={{ color: 'grey.500', display: 'inline-flex' }}>
                <ChevronDown size={18} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: '26px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Typography sx={{ fontSize: 44, fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', lineHeight: 1 }}>
              2345.23 USD
            </Typography>
            <Box sx={{ color: 'grey.400', cursor: 'pointer', display: 'inline-flex' }}>
              <Eye size={26} strokeWidth={1.8} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: 15, color: 'primary.main', mt: 3, fontWeight: 500 }}>
            Pending Withdrawal: 100,032.15 USD
          </Typography>

          <Box sx={{ display: 'flex', gap: '14px', mt: 6 }}>
            <ButtonBase sx={{ ...pillBtnSx, color: 'primary.darker' }}>Deposit</ButtonBase>
            <ButtonBase sx={pillBtnSx}>Withdraw</ButtonBase>
            <ButtonBase sx={pillBtnSx}>Swap</ButtonBase>
          </Box>

          <BalanceChart />
        </Box>

        {/* Coins */}
        <Box component="section" sx={panelSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>Coins</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'primary.main', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Details
              <ChevronRight size={18} strokeWidth={2.2} />
            </Box>
          </Box>
          {COIN_ROWS.map((row, i) => (
            <Box key={`${row.sym}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: '14px', height: 56 }}>
              <SvgMarkup markup={COIN_BADGES[row.sym]} size={36} />
              <Typography sx={{ fontSize: 17, fontWeight: 500, color: row.zero ? 'grey.400' : 'text.primary' }}>
                {row.name}
              </Typography>
              <Typography sx={{ ml: 'auto', fontSize: 16, fontWeight: row.zero ? 500 : 600, color: row.zero ? 'grey.400' : 'text.primary' }}>
                {row.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

export default DashboardPage;
