import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { ChevronRight, Copy, Info, X } from 'lucide-react';
import { useStores } from '@/stores';
import { PATHS } from '@/routes/paths';
import { DOC_URLS, FAQ_ITEMS, GUIDE_ICONS, QUICK_START } from '@/data/guide';
import { SvgMarkup } from '@/components/SvgMarkup';

const EASE = 'cubic-bezier(.4,0,.2,1)';
const DUR = 380;

/* Chat-bubble icon used by the CTA and the api-help button. */
function ChatIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  );
}

function BookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

/* Step radio: plain / active dot / done check. */
function StepRadio({ state }: { state: 'plain' | 'active' | 'done' }) {
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: state === 'plain' ? 'grey.300' : 'primary.main',
        bgcolor: state === 'done' ? 'primary.main' : 'background.paper',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {state === 'active' && <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />}
      {state === 'done' && (
        <Box
          sx={{
            width: 11,
            height: 6,
            mt: '-2px',
            borderLeft: '2px solid #fff',
            borderBottom: '2px solid #fff',
            transform: 'rotate(-45deg)',
            borderRadius: '1px',
          }}
        />
      )}
    </Box>
  );
}

function StepTop({ state }: { state: 'plain' | 'active' | 'done' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: '22px' }}>
      <StepRadio state={state} />
      <Box
        sx={{
          flex: 1,
          borderTop: '1.5px dashed',
          borderColor: state === 'plain' ? 'grey.300' : 'primary.main',
          mx: '6px',
        }}
      />
    </Box>
  );
}

const QuickGuidePanel = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <Box sx={{ p: '10px 40px 30px 44px' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'grey.500', mb: '14px' }}>
            Quick Start
          </Typography>
          {QUICK_START.map((item) => (
            <Box key={item.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px', py: 2 }}>
              <SvgMarkup markup={GUIDE_ICONS[item.icon]} size={34} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{item.title}</Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: 'grey.600',
                    mt: '2px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ minWidth: 0, borderLeft: '1px solid rgba(145,158,171,0.22)', pl: 8 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'grey.500', mb: '14px' }}>
            FAQ
          </Typography>
          <Box>
            {FAQ_ITEMS.map((q, i) => (
              <Box
                key={q}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  py: '9px',
                  borderTop: i === 0 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'text.primary',
                  cursor: 'pointer',
                }}
              >
                <span>{q}</span>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'grey.100',
                    color: 'grey.600',
                    transition: 'transform .2s ease',
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 6v12M6 12h12" />
                  </svg>
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            component="a"
            href="#"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              mt: '14px',
              fontSize: 15,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            More Help <ChevronRight size={16} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

interface GuideCardProps {
  open: boolean;
  onClose: () => void;
}

/* The merged guide card: tabs (API接入帮助 / Quick Guide) while the API guide
   is still relevant; Quick-Guide-only with a title once a webhook is detected. */
export const GuideCard = observer(function GuideCard({ open, onClose }: GuideCardProps) {
  const { onboarding } = useStores();
  const navigate = useNavigate();
  const detected = onboarding.detected;
  const created = onboarding.created;

  const [tab, setTab] = useState<'api' | 'quick'>('api');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const pendingExpand = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = detected ? 'quick' : tab;

  // Detect the closed→open transition (button click) to play the grow animation.
  const prevOpen = useRef(open);
  if (prevOpen.current !== open) {
    if (open) pendingExpand.current = true;
    prevOpen.current = open;
  }

  // Expand animation: card grows top→down after it re-renders open.
  useLayoutEffect(() => {
    if (open && pendingExpand.current) {
      pendingExpand.current = false;
      const el = cardRef.current;
      if (!el) return;
      busyRef.current = true;
      const h = el.scrollHeight;
      el.style.overflow = 'hidden';
      const anim = el.animate(
        [{ height: '0px', opacity: 0.4 }, { height: `${h}px`, opacity: 1 }],
        { duration: DUR, easing: EASE, fill: 'forwards' },
      );
      setTimeout(() => {
        anim.cancel();
        el.style.overflow = '';
        busyRef.current = false;
      }, DUR + 30);
    }
  }, [open]);

  // Collapse animation: card shrinks bottom→up, then unmount-hides.
  const collapse = () => {
    const el = cardRef.current;
    if (!el || busyRef.current || !open) return;
    busyRef.current = true;
    const h = el.scrollHeight;
    el.style.overflow = 'hidden';
    const anim = el.animate(
      [{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0.4 }],
      { duration: DUR, easing: EASE, fill: 'forwards' },
    );
    setTimeout(() => {
      onClose();
      anim.cancel();
      el.style.overflow = '';
      busyRef.current = false;
    }, DUR + 30);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) collapse();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const copySkill = () => {
    const done = () => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText('SKILL.md').then(done, done);
    else done();
  };

  if (!open) return null;

  const stepDesc = {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: 'grey.600',
    mt: '14px',
  } as const;

  const stepTitleLink = {
    fontSize: 17,
    fontWeight: 700,
    color: 'text.primary',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
  } as const;

  return (
    <Box
      ref={cardRef}
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(110deg, #E5EEFE 0%, #EAF1FE 45%, #F1F5FF 100%)',
        flexShrink: 0,
      }}
    >
      {/* Head: tabs (not detected) or title (detected) + close */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, p: '16px 24px 0 32px' }}>
        {!detected ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {([['api', 'API接入帮助'], ['quick', 'Quick Guide']] as const).map(([key, label]) => (
              <ButtonBase
                key={key}
                onClick={() => setTab(key)}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: 17,
                  fontWeight: 700,
                  color: activeTab === key ? '#1B2A4A' : 'grey.500',
                  bgcolor: activeTab === key ? 'rgba(255,255,255,0.75)' : 'transparent',
                  p: '8px 16px',
                  borderRadius: '10px',
                  transition: 'background 120ms, color 120ms',
                  '&:hover': { color: '#1B2A4A' },
                }}
              >
                {label}
              </ButtonBase>
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1B2A4A' }}>Beginner's guide</Typography>
        )}
        <ButtonBase
          onClick={collapse}
          aria-label="Close"
          sx={{
            ml: 'auto',
            width: 34,
            height: 34,
            borderRadius: '50%',
            color: 'grey.600',
            bgcolor: 'rgba(255,255,255,0.6)',
            transition: 'background 120ms',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <X size={18} />
        </ButtonBase>
      </Box>

      {/* Body */}
      {activeTab === 'api' && !detected ? (
        <Box sx={{ position: 'relative', p: '8px 268px 32px 44px' }}>
          <Box sx={{ maxWidth: 1180 }}>
            {!created ? (
              /* Default stepper — 2 steps on a 3-column track */
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', mt: 8 }}>
                <Box sx={{ pr: '26px', minWidth: 0 }}>
                  <StepTop state="active" />
                  <Box component="a" onClick={() => navigate(PATHS.developer)} sx={stepTitleLink}>
                    Create App&nbsp; Secret
                    <Box component="span" sx={{ display: 'inline-flex', ml: '6px', color: 'text.primary' }}>
                      <ChevronRight size={18} strokeWidth={2.2} />
                    </Box>
                  </Box>
                  <Typography sx={stepDesc}>为您的应用生成专属的 App Secret，用于 API 请求签名与身份校验</Typography>
                </Box>
                <Box sx={{ pr: '26px', minWidth: 0 }}>
                  <StepTop state="plain" />
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'grey.400' }}>API 接入</Typography>
                  <Typography sx={{ ...stepDesc, color: 'grey.400' }}>
                    方式一: View API Documentation
                    <br />
                    方式二: SKILL.md 导入 AI Agent
                  </Typography>
                </Box>
              </Box>
            ) : (
              /* Created stepper — step 1 done, step 2 active with sub-options */
              <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0,280px) minmax(0,1fr)', mt: 8 }}>
                <Box sx={{ pr: '26px', minWidth: 0 }}>
                  <StepTop state="done" />
                  <Box component="a" onClick={() => navigate(PATHS.developer)} sx={stepTitleLink}>
                    Create App&nbsp; Secret
                    <Box component="span" sx={{ display: 'inline-flex', ml: '6px', color: 'text.primary' }}>
                      <ChevronRight size={18} strokeWidth={2.2} />
                    </Box>
                  </Box>
                  <Typography sx={stepDesc}>为您的应用生成专属的 App Secret，用于 API 请求签名与身份校验</Typography>
                </Box>
                <Box sx={{ pr: '26px', minWidth: 0 }}>
                  <StepTop state="active" />
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'text.primary', display: 'inline-flex', alignItems: 'center' }}>
                    API 接入
                    <Box component="span" sx={{ display: 'inline-flex', ml: 2, color: 'text.primary' }}>
                      <Info size={18} />
                    </Box>
                  </Typography>
                  <Box sx={{ mt: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <Box
                      onClick={() => window.open(DOC_URLS.introduction, '_blank', 'noopener')}
                      sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 14.5, lineHeight: 1.5, color: 'text.primary', cursor: 'pointer' }}
                    >
                      <Box component="span" sx={{ flex: 1 }}>方式一: View API Documentation</Box>
                      <Box sx={{ display: 'inline-flex', color: 'text.primary', flexShrink: 0 }}>
                        <ChevronRight size={17} strokeWidth={2.2} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, fontSize: 14.5, lineHeight: 1.5, color: 'text.primary' }}>
                      <span>方式二: SKILL.md 导入 AI Agent</span>
                      <ButtonBase
                        onClick={copySkill}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          height: 38,
                          px: '14px',
                          borderRadius: '9px',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          fontFamily: 'inherit',
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: 'text.primary',
                          boxShadow: '0 1px 2px 0 rgba(113,117,126,0.12)',
                          '&:hover': { bgcolor: 'grey.100' },
                        }}
                      >
                        {copied ? 'Copied' : 'SKILL.md'}
                        <Box sx={{ display: 'inline-flex', color: 'grey.500' }}>
                          <Copy size={18} strokeWidth={1.8} />
                        </Box>
                      </ButtonBase>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            <ButtonBase
              sx={{
                mt: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                height: 56,
                px: '30px',
                borderRadius: '14px',
                bgcolor: 'rgb(197,215,253)',
                color: '#1E3EB0',
                fontFamily: 'inherit',
                fontSize: 18,
                fontWeight: 700,
                '&:hover': { bgcolor: '#B3C7F1' },
              }}
            >
              Get Integration Assistance
              <ChatIcon />
            </ButtonBase>
          </Box>
          <Box
            component="img"
            src="/illustration-api.svg"
            alt=""
            sx={{ position: 'absolute', right: 18, bottom: 18, width: 240, pointerEvents: 'none' }}
          />
        </Box>
      ) : (
        <QuickGuidePanel />
      )}
    </Box>
  );
});

interface GuideButtonsProps {
  cardOpen: boolean;
  onOpenCard: () => void;
}

/* The Overview-header action buttons paired with the guide card. */
export const GuideButtons = observer(function GuideButtons({ cardOpen, onOpenCard }: GuideButtonsProps) {
  const { onboarding } = useStores();
  const detected = onboarding.detected;

  const btnSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    height: 56,
    px: 7,
    borderRadius: '14px',
    bgcolor: 'secondary.lighter',
    color: 'secondary.darker',
    fontFamily: 'inherit',
    fontSize: 17,
    fontWeight: 700,
    '& .ico': { color: 'secondary.dark', display: 'inline-flex' },
  } as const;

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      {detected ? (
        <ButtonBase onClick={() => window.open(DOC_URLS.introduction, '_blank', 'noopener')} sx={btnSx}>
          View API Documentation
          <Box className="ico"><ChatIcon /></Box>
        </ButtonBase>
      ) : (
        !cardOpen && (
          <ButtonBase onClick={onOpenCard} sx={btnSx}>
            获取API接入帮助
            <Box className="ico"><ChatIcon /></Box>
          </ButtonBase>
        )
      )}
      {detected && !cardOpen && (
        <ButtonBase onClick={onOpenCard} sx={btnSx}>
          Quick Guide
          <Box className="ico"><BookIcon /></Box>
        </ButtonBase>
      )}
    </Box>
  );
});
