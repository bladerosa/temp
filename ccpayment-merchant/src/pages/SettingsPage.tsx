import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useStores } from '@/stores';
import { TOKEN_BADGES } from '@/data/coins';
import { SvgMarkup } from '@/components/SvgMarkup';
import { ModalShell } from '@/components/ModalShell';

const FAUCET_LINKS = [
  'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  'https://sepolia-faucet.pk910.de',
  'https://www.allthatnode.com/faucet/ethereum.dsrv',
  'https://faucet.quicknode.com/drip',
];

const setCardSx = {
  bgcolor: 'background.paper',
  borderRadius: '18px',
  boxShadow: '0 0 1px rgba(145,158,171,0.30), 0 14px 30px -16px rgba(145,158,171,0.20)',
  p: '28px 32px',
  mb: '22px',
} as const;

const setTitleSx = { fontSize: 20, fontWeight: 700, color: 'text.primary' } as const;
const setSubSx = { fontSize: 15, color: 'text.secondary', mt: 2, maxWidth: 760, lineHeight: 1.5 } as const;
const linkSx = { color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } as const;
const viewLinkSx = { color: 'primary.main', fontSize: 17, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } as const;
const stateSx = { fontSize: 17, fontWeight: 700, color: 'text.primary' } as const;

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      sx={{
        width: 52,
        height: 30,
        borderRadius: '16px',
        bgcolor: on ? 'primary.main' : 'grey.300',
        position: 'relative',
        transition: 'background 160ms',
        flexShrink: 0,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 3,
          left: 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: '#fff',
          transition: 'transform 160ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: on ? 'translateX(22px)' : 'none',
        },
      }}
    />
  );
}

function SetupLink() {
  return (
    <Box
      component="a"
      href="#"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        color: 'primary.main',
        fontSize: 17,
        fontWeight: 700,
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      Set up
      <ChevronRight size={18} strokeWidth={2.4} />
    </Box>
  );
}

const SettingsPage = observer(function SettingsPage() {
  const { settings } = useStores();
  const [faucetOpen, setFaucetOpen] = useState(false);

  return (
    <Box sx={{ flex: 1, p: '0 40px 56px' }}>
      <Typography component="h1" sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', m: '8px 0 26px' }}>
        Settings
      </Typography>

      {/* Tokens For Your Business */}
      <Box component="section" sx={setCardSx}>
        <Typography sx={setTitleSx}>Tokens For Your Business</Typography>
        <Typography sx={setSubSx}>Configure which tokens your users can use for payments.</Typography>
        <Box
          sx={{
            position: 'relative',
            mt: '22px',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: '12px',
            p: '18px 56px 18px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -9,
              left: 14,
              px: '6px',
              bgcolor: 'background.paper',
              fontSize: 13,
              color: 'text.secondary',
            }}
          >
            Select Token
          </Box>
          {settings.tokens.map((sym) => (
            <Box
              key={sym}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                height: 40,
                px: 3,
                borderRadius: '20px',
                bgcolor: 'grey.100',
                fontSize: 16,
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              <SvgMarkup markup={TOKEN_BADGES[sym] ?? ''} size={26} />
              {sym}
              {sym !== 'TETH' && (
                <Box
                  onClick={() => settings.removeToken(sym)}
                  sx={{ display: 'inline-flex', color: 'grey.400', cursor: 'pointer', '&:hover': { color: 'error.main' } }}
                >
                  <X size={18} strokeWidth={2.4} />
                </Box>
              )}
            </Box>
          ))}
          <Box sx={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: 'grey.500', display: 'inline-flex' }}>
            <ChevronDown size={22} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 5, fontSize: 16, color: 'text.primary' }}>
          <Box
            onClick={settings.toggleAutoAdd}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              bgcolor: settings.autoAddNewTokens ? 'primary.main' : 'transparent',
              border: settings.autoAddNewTokens ? 'none' : '2px solid',
              borderColor: 'grey.300',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            {settings.autoAddNewTokens && <Check size={15} strokeWidth={3} />}
          </Box>
          New tokens added to CCPayment will be automatically added as receiving tokens in your business.
        </Box>
      </Box>

      {/* ETH Test Network */}
      <Box component="section" sx={{ ...setCardSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={setTitleSx}>ETH Test Network</Typography>
          <Typography sx={setSubSx}>
            Enable the test network for development debugging.{' '}
            <Box component="a" href="#" sx={linkSx}>
              FAQ
            </Box>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          {settings.ethTestnet && (
            <ButtonBase
              onClick={() => setFaucetOpen(true)}
              sx={{ ...viewLinkSx, fontFamily: 'inherit', mr: '6px', bgcolor: 'transparent', '&:hover': { textDecoration: 'underline' } }}
            >
              Get the Free Test-Sepolia ETH
            </ButtonBase>
          )}
          <Box component="a" href="#" sx={viewLinkSx}>
            View
          </Box>
          <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />
          <Typography sx={stateSx}>{settings.ethTestnet ? 'On' : 'Off'}</Typography>
          <Toggle on={settings.ethTestnet} onClick={settings.toggleEthTestnet} label="Toggle ETH Test Network" />
        </Box>
      </Box>

      {/* Auto-Swap of Deposit */}
      <Box component="section" sx={{ ...setCardSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={setTitleSx}>Auto-Swap of Deposit</Typography>
          <Typography sx={setSubSx}>
            To avoid asset losses of blockchain fluctuations, CCPayment will swap the deposit token for the special
            token you choose.{' '}
            <Box component="a" href="#" sx={linkSx}>
              Learn more
            </Box>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          <Typography sx={stateSx}>{settings.autoSwap ? 'On' : 'Off'}</Typography>
          <Toggle on={settings.autoSwap} onClick={settings.toggleAutoSwap} label="Toggle Auto-Swap" />
        </Box>
      </Box>

      {/* Auto Withdraw */}
      <Box component="section" sx={{ ...setCardSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={setTitleSx}>Auto Withdraw</Typography>
          <Typography sx={setSubSx}>
            CCPayment will auto withdraw the receiving business token to the specific address you choose.{' '}
            <Box component="a" href="#" sx={linkSx}>
              Learn more
            </Box>
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <SetupLink />
        </Box>
      </Box>

      {/* Rate Lock Time */}
      <Box component="section" sx={{ ...setCardSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={setTitleSx}>Rate Lock Time on Checkout Page</Typography>
          <Typography sx={setSubSx}>This default setting applies when no specific rate lock time is configured.</Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <SetupLink />
        </Box>
      </Box>

      {/* Sepolia faucet dialog */}
      <ModalShell open={faucetOpen} onClose={() => setFaucetOpen(false)} title="Get the Free Test-Sepolia ETH">
        <Typography sx={{ fontSize: 17, lineHeight: 1.5, color: 'text.primary' }}>
          Get the Free Test-Sepolia ETH on the:
        </Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: '18px 0 4px', p: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAUCET_LINKS.map((href) => (
            <li key={href}>
              <Box
                component="a"
                href={href}
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'primary.main',
                  fontSize: 16.5,
                  fontWeight: 500,
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                  '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
                }}
              >
                {href}
              </Box>
            </li>
          ))}
        </Box>
      </ModalShell>
    </Box>
  );
});

export default SettingsPage;
