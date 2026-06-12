import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { BookOpen, Code, Copy, Package, Plug, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStores } from '@/stores';
import type { WebhookKind } from '@/stores/OnboardingStore';
import { DOC_URLS } from '@/data/guide';
import { WebhookEditModal } from '@/components/developer/WebhookEditModal';
import { DetectModal } from '@/components/developer/DetectModal';
import { WhitelistModal } from '@/components/developer/WhitelistModal';
import { CopyToast } from '@/components/developer/CopyToast';

const DEV_NOTES = [
  'Please do not disclose your App secret to anyone to prevent potential asset loss.',
  'Please be aware that binding your App secret to third-party platforms may pose security risks. Please proceed with caution.',
  'The App secret is displayed only once upon creation, so please ensure that you keep it secure.',
  'If there are changes in team members, please promptly update the App secret.',
];

const ghostBtnSx = {
  height: 46,
  px: '26px',
  borderRadius: '10px',
  bgcolor: 'grey.100',
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 600,
  color: 'text.primary',
  flexShrink: 0,
  transition: 'background 120ms ease-out',
  '&:hover': { bgcolor: 'grey.200' },
} as const;

const devCardSx = {
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0 0 1px rgba(145,158,171,0.30), 0 14px 30px -14px rgba(145,158,171,0.20)',
  p: '30px 36px',
  mt: 7,
} as const;

const fLabelSx = { fontSize: 16, color: 'text.secondary', mb: '14px' } as const;
const fValueSx = {
  fontSize: 21,
  fontWeight: 700,
  color: 'text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  letterSpacing: '0.3px',
} as const;

interface IntegrationTile {
  key: string;
  Icon?: LucideIcon;
  emoji?: string;
  name: string;
  desc: string;
  dimSuffix?: string;
  href?: string;
  copyAction?: boolean;
}

const INTEGRATIONS: IntegrationTile[] = [
  { key: 'agent', emoji: '🦞', name: 'AI Agent', desc: 'Send your AI agent to CCPayment ', dimSuffix: '｜ SKILL.md', copyAction: true },
  { key: 'api', Icon: Code, name: 'API Integration', desc: 'Full REST API reference', href: DOC_URLS.introduction },
  { key: 'sdk', Icon: Package, name: 'SDK', desc: 'Official SDKs on GitHub', href: DOC_URLS.sdk },
  { key: 'woo', Icon: Plug, name: 'WooCommerce Plugin', desc: 'Accept crypto in WordPress', href: DOC_URLS.wooCommerce },
  { key: 'usecases', Icon: BookOpen, name: 'Use Cases', desc: 'Integration scenarios & support', href: DOC_URLS.support },
];

const WEBHOOK_LABEL: Record<WebhookKind, string> = {
  deposit: 'Deposit Webhook URL',
  withdraw: 'Withdrawal Webhook URL',
};

const DeveloperPage = observer(function DeveloperPage() {
  const { onboarding } = useStores();
  const [editKind, setEditKind] = useState<WebhookKind | null>(null);
  const [detectKind, setDetectKind] = useState<WebhookKind | null>(null);
  const [whitelistKind, setWhitelistKind] = useState<WebhookKind | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = () => {
    setToastOpen(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOpen(false), 4000);
  };

  const copySkill = () => {
    const skill = 'https://ccpayment.com/api/doc?en#introduction — CCPayment SKILL.md';
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(skill).catch(() => {});
    showToast();
  };

  const renderWebhookRow = (kind: WebhookKind) => {
    const w = onboarding.webhooks[kind];
    const hasUrl = Boolean(w.url);
    return (
      <Box key={kind} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, '& + &': { mt: '30px' }, mt: kind === 'withdraw' ? '30px' : 0 }}>
        <Box>
          <Typography sx={fLabelSx}>{WEBHOOK_LABEL[kind]}</Typography>
          <Box sx={fValueSx}>
            {!hasUrl ? (
              '——'
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="a"
                  onClick={() => !w.detected && setDetectKind(kind)}
                  sx={{
                    color: w.detected ? 'text.primary' : 'warning.darker',
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: w.detected ? 'default' : 'pointer',
                    pointerEvents: w.detected ? 'none' : 'auto',
                    '&:hover': { textDecoration: w.detected ? 'none' : 'underline', textUnderlineOffset: '3px' },
                  }}
                >
                  {w.url}
                </Box>
                {w.detected ? (
                  <Box sx={{ ml: '14px', color: 'success.dark', fontSize: 16, fontWeight: 700 }}>Detected</Box>
                ) : (
                  <Box
                    onClick={() => setDetectKind(kind)}
                    sx={{
                      ml: '14px',
                      p: '4px 12px',
                      borderRadius: '6px',
                      bgcolor: 'warning.lighter',
                      color: 'warning.darker',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Not Detected
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          {w.detected && (
            <ButtonBase onClick={() => setWhitelistKind(kind)} sx={ghostBtnSx}>
              Add More ({onboarding.whitelist(kind).length})
            </ButtonBase>
          )}
          <ButtonBase onClick={() => setEditKind(kind)} sx={ghostBtnSx}>
            {hasUrl ? 'Edit' : 'Add'}
          </ButtonBase>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        background: 'linear-gradient(180deg, #F6F8FB 0%, #FBFCFE 38%, #FFFFFF 100%)',
        borderLeft: '1px solid',
        borderColor: 'divider',
        p: '36px 48px 56px',
      }}
    >
      <Typography component="h1" sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary' }}>
        Developer
      </Typography>

      <Box component="ul" sx={{ m: '34px 0 0', p: 0, listStyle: 'none' }}>
        {DEV_NOTES.map((note) => (
          <Box
            component="li"
            key={note}
            sx={{
              position: 'relative',
              pl: '22px',
              fontSize: 17,
              lineHeight: 2.1,
              color: 'grey.600',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 3,
                top: 16,
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'grey.600',
              },
            }}
          >
            {note}
          </Box>
        ))}
      </Box>

      {!onboarding.created ? (
        /* Empty state */
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '150px' }}>
          <Box component="img" src="/illustration-empty-clipboard.svg" alt="" sx={{ width: 220, display: 'block' }} />
          <ButtonBase
            onClick={() => void onboarding.createAppSecret()}
            sx={{
              mt: 13,
              height: 60,
              px: 11,
              borderRadius: '12px',
              bgcolor: 'primary.main',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: 19,
              fontWeight: 700,
              boxShadow: '0 8px 16px 0 rgba(60,111,245,0.24)',
              transition: 'background 120ms ease-out',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Create App Secret
          </ButtonBase>
        </Box>
      ) : (
        /* Created state */
        <Box
          sx={{
            '@keyframes devRise': {
              from: { transform: 'translateY(10px)' },
              to: { transform: 'translateY(0)' },
            },
            animation: 'devRise 320ms cubic-bezier(.4,0,.2,1)',
          }}
        >
          {/* App secret card */}
          <Box sx={devCardSx}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
              <Box>
                <Typography sx={fLabelSx}>APP ID</Typography>
                <Box sx={fValueSx}>
                  {onboarding.appInfo?.appId}
                  <Box sx={{ color: 'grey.400', cursor: 'pointer', display: 'inline-flex', '&:hover': { color: 'primary.main' } }}>
                    <Copy size={20} strokeWidth={1.8} />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, mt: '30px' }}>
              <Box>
                <Typography sx={fLabelSx}>APP Secret</Typography>
                <Box sx={{ ...fValueSx, fontSize: 24, letterSpacing: '3px', lineHeight: 1 }}>******</Box>
              </Box>
              <ButtonBase sx={ghostBtnSx}>Reset</ButtonBase>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, mt: '30px' }}>
              <Box>
                <Typography sx={fLabelSx}>API Request IP Whitelist</Typography>
                <Box sx={fValueSx}>{onboarding.appInfo?.ipWhitelist}</Box>
              </Box>
              <ButtonBase sx={ghostBtnSx}>Edit</ButtonBase>
            </Box>
          </Box>

          {/* Webhook URL card */}
          <Box sx={devCardSx}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, mb: 7 }}>
              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 700, color: 'text.primary' }}>Webhook URL</Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: '10px' }}>
                  Add and activate the webhook URL to receive ITN (Instant transaction notifications).
                </Typography>
              </Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: 17, fontWeight: 700, color: 'text.primary', cursor: 'pointer' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '5px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    bgcolor: '#2B66C9',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                  }}
                >
                  W
                </Box>
                Tutorial
              </Box>
            </Box>
            {renderWebhookRow('deposit')}
            {renderWebhookRow('withdraw')}
          </Box>

          {/* Integrations card */}
          <Box sx={devCardSx}>
            <Box sx={{ mb: 0 }}>
              <Typography sx={{ fontSize: 19, fontWeight: 700, color: 'text.primary' }}>Integrations</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: '10px' }}>
                Resources to integrate CCPayment into your product.
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mt: '22px' }}>
              {INTEGRATIONS.map((tile) => {
                const { Icon } = tile;
                return (
                  <Box
                    key={tile.key}
                    component="a"
                    href={tile.href ?? '#'}
                    target={tile.href ? '_blank' : undefined}
                    rel={tile.href ? 'noopener' : undefined}
                    onClick={(e: React.MouseEvent) => {
                      if (tile.copyAction) {
                        e.preventDefault();
                        copySkill();
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      p: '20px 22px',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      bgcolor: 'background.paper',
                      transition: 'border-color 120ms ease-out, background 120ms ease-out',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(60,111,245,0.03)' },
                      '&:hover .intg-arrow': { color: 'primary.main' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        flexShrink: 0,
                        bgcolor: 'primary.lighter',
                        color: 'primary.dark',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: tile.emoji ? 24 : undefined,
                        lineHeight: 1,
                      }}
                    >
                      {tile.emoji ?? (Icon && <Icon size={24} strokeWidth={1.8} />)}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                      <Box sx={{ fontSize: 17, fontWeight: 700, color: 'text.primary' }}>{tile.name}</Box>
                      <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
                        {tile.desc}
                        {tile.dimSuffix && (
                          <Box component="span" sx={{ color: 'text.disabled' }}>
                            {tile.dimSuffix}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box className="intg-arrow" sx={{ color: 'grey.400', flexShrink: 0, display: 'inline-flex', transition: 'color 120ms ease-out' }}>
                      {tile.copyAction ? <Copy size={20} strokeWidth={1.8} /> : <ArrowUpRight size={20} strokeWidth={2} />}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialogs */}
      <WebhookEditModal
        kind={editKind ?? 'deposit'}
        open={editKind !== null}
        onClose={() => setEditKind(null)}
        onSubmit={(url) => editKind && onboarding.setWebhookUrl(editKind, url)}
      />
      <DetectModal
        kind={detectKind ?? 'deposit'}
        open={detectKind !== null}
        onClose={() => setDetectKind(null)}
        onDocClick={() => {
          if (detectKind) onboarding.markDetected(detectKind);
          setDetectKind(null);
        }}
      />
      <WhitelistModal
        kind={whitelistKind ?? 'deposit'}
        open={whitelistKind !== null}
        onClose={() => setWhitelistKind(null)}
      />

      <CopyToast open={toastOpen} onClose={() => setToastOpen(false)} />
    </Box>
  );
});

export default DeveloperPage;
