import { Box, Button, Stack } from '@mui/material';
import { ArrowDown, ArrowRight, ArrowUp, Mail, Send } from 'lucide-react';
import { paths } from '@/routes/paths';

const LOGOS = ['WordPress', 'ASIAN SKY GROUP', 'COINS GAME', 'Payeer', 'arkreen', 'WatchesWorld', 'THEVALUE.COM'];

const WHY = [
  ['首年佣金率高达 ', '20%', '，市场最高。'],
  ['从第二年起，可享受 ', '10%', ' 的永久佣金发放。'],
  ['随时随地提现，提现门槛极低。', '', ''],
  ['优化交易流程，提升整体效率。', '', ''],
] as const;

const STEPS = [
  { n: '步骤 1', title: '申请成为合作伙伴', desc: '提交合作伙伴申请并完成审核，即可加入 CCPayment 合作伙伴计划。' },
  { n: '步骤 2', title: '分享专属推荐链接', desc: '通过您的专属推荐链接邀请商户注册并使用 CCPayment 的支付服务。' },
  { n: '步骤 3', title: '后台结算并获取分佣收益', desc: '被推荐商户成功产生入金后，系统将在后台自动统计并结算您的分佣收益。' },
  { n: '步骤 4', title: '提现至指定钱包', desc: '当分佣收益达到提现条件后，您可将收益提现至您指定的加密货币钱包地址。' },
];

export default function BDLanding() {
  // 立即注册推广计划账号：在浏览器中新开 tab 打开推广者注册页
  const apply = () => window.open(paths.auth.signup, '_blank', 'noopener,noreferrer');

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: '32px', pb: '48px' }}>
      <Box
        component="section"
        sx={{
          position: 'relative',
          background:
            'radial-gradient(120% 90% at 110% 10%, rgba(60,111,245,0.18), transparent 60%),' +
            'linear-gradient(180deg, #EAF1FF 0%, #F4F6FF 100%)',
          borderRadius: '0 0 20px 20px',
          p: '64px 48px 56px',
          mx: '-32px',
          mb: '28px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
            gap: '32px',
            maxWidth: 1216,
            mx: 'auto',
            alignItems: 'center',
          }}
        >
          <Box>
            <Box
              component="h1"
              sx={{
                fontSize: { xs: 32, md: 44 },
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: '-0.6px',
                m: '0 0 18px',
                color: '#14171F',
                textWrap: 'balance',
              }}
            >
              赚取高达 <Box component="b" sx={{ color: 'primary.main', fontWeight: 800 }}>20%</Box> 的佣金。
              <br />
              推荐企业加入{' '}
              <Box component="b" sx={{ color: 'primary.main', fontWeight: 800 }}>CCPayment</Box>
            </Box>
            <Box sx={{ fontSize: 16, lineHeight: '26px', color: 'grey.700', maxWidth: 460, mb: '22px' }}>
              协助企业接入加密货币支付——并从每次成功推荐中赚取更多收益。
            </Box>
            <Stack direction="row" alignItems="center" gap="14px" sx={{ mb: '22px', fontSize: 14 }}>
              <span>联系我们：</span>
              <IconCircle><Send size={16} /></IconCircle>
              <IconCircle><Mail size={16} /></IconCircle>
            </Stack>
            <Stack direction="row" gap="14px" flexWrap="wrap">
              <Button
                onClick={apply}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  bgcolor: '#14171F',
                  color: '#fff',
                  height: 48,
                  px: '22px',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#2A2F3D', transform: 'translateY(-1px)' },
                }}
              >
                立即注册推广计划账号
              </Button>
            </Stack>
          </Box>
          <HeroArt />
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          p: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          mb: '64px',
          flexWrap: 'wrap',
        }}
      >
        {LOGOS.map((l) => (
          <Box
            key={l}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: 'grey.600',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              opacity: 0.75,
            }}
          >
            {l}
          </Box>
        ))}
      </Box>

      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: '56px',
          alignItems: 'center',
          p: '24px 8px 80px',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '1 / 0.78',
            background:
              'radial-gradient(70% 70% at 50% 80%, rgba(60,111,245,0.18) 0%, transparent 60%),' +
              'radial-gradient(60% 60% at 50% 30%, rgba(190,224,114,0.18) 0%, transparent 60%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '70%',
              height: '50%',
              background: 'linear-gradient(180deg, #F5C24A 0%, #D99812 100%)',
              clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              position: 'relative',
              mb: '8%',
            }}
          />
        </Box>
        <Box>
          <Box
            component="h2"
            sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, m: '0 0 24px', color: '#14171F' }}
          >
            为什么要推广{' '}
            <Box component="b" sx={{ color: 'primary.main', fontWeight: 800 }}>CCPayment</Box>
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {WHY.map(([a, b, c], i) => (
              <Box
                key={i}
                component="li"
                sx={{
                  position: 'relative',
                  pl: '22px',
                  fontSize: 16,
                  lineHeight: '24px',
                  color: 'grey.700',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 4,
                    top: 10,
                    width: 6,
                    height: 6,
                    bgcolor: 'text.primary',
                    borderRadius: '50%',
                  },
                }}
              >
                {a}
                {b && (
                  <Box component="b" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {b}
                  </Box>
                )}
                {c}
              </Box>
            ))}
          </Box>
          <Button
            endIcon={<ArrowDown size={16} />}
            sx={{
              bgcolor: '#14171F',
              color: '#fff',
              height: 48,
              px: '22px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 600,
              '&:hover': { bgcolor: '#2A2F3D' },
            }}
          >
            下载介绍资料
          </Button>
        </Box>
      </Box>

      <Box component="section" sx={{ p: '8px 8px 80px' }}>
        <Box sx={{ fontSize: 32, fontWeight: 800, m: '0 0 8px', color: '#14171F', letterSpacing: '-0.4px' }}>
          它是如何运作的
        </Box>
        <Box sx={{ fontSize: 16, color: 'grey.600', m: '0 0 36px' }}>无需 KYC/KYB 或任何文件</Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: '28px',
          }}
        >
          {STEPS.map(({ n, title, desc }) => (
            <Box key={n}>
              <Box
                sx={{
                  aspectRatio: '1 / 0.78',
                  borderRadius: '14px',
                  bgcolor: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  mb: '14px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box component="svg" viewBox="0 0 64 64" sx={{ width: 56, height: 56 }} stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="14" y="10" width="34" height="44" rx="3" />
                  <line x1="20" y1="22" x2="42" y2="22" />
                  <line x1="20" y1="30" x2="42" y2="30" />
                  <line x1="20" y1="38" x2="34" y2="38" />
                </Box>
              </Box>
              <Box sx={{ fontSize: 12, fontWeight: 500, color: 'grey.400', m: '0 0 6px' }}>{n}</Box>
              <Box sx={{ fontSize: 18, fontWeight: 700, color: 'primary.main', m: '0 0 10px' }}>
                {title}
              </Box>
              <Box sx={{ fontSize: 13.5, lineHeight: '22px', color: 'grey.600' }}>{desc}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          position: 'relative',
          borderRadius: '24px',
          p: { xs: '36px 28px', md: '56px 56px 48px' },
          overflow: 'hidden',
          background:
            'radial-gradient(70% 100% at 100% 50%, rgba(60,111,245,0.45) 0%, transparent 60%),' +
            'linear-gradient(135deg, #4A47B5 0%, #6249E0 50%, #7B5BFF 100%)',
          color: '#fff',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
          gap: '32px',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box
            component="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
              m: '0 0 26px',
            }}
          >
            推荐商户使用 CCPayment
            <br />
            <Box component="span" sx={{ color: 'secondary.main' }}>
              赚取 20% 佣金奖励！
            </Box>
          </Box>
          <Stack direction="row" gap="14px" flexWrap="wrap">
            <Button
              onClick={apply}
              endIcon={<ArrowRight size={16} />}
              sx={{
                bgcolor: '#14171F',
                color: '#fff',
                height: 44,
                px: '22px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                '&:hover': { bgcolor: '#2A2F3D' },
              }}
            >
              立即注册推广计划账号
            </Button>
            <Button
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                height: 44,
                px: '22px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
              }}
            >
              下载介绍资料
            </Button>
          </Stack>
        </Box>
        <Box sx={{ position: 'relative', aspectRatio: '1 / 0.72' }}>
          <Box sx={{ position: 'absolute', left: '8%', top: '8%', width: '84%', height: '84%', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.35)' }} />
          <Box sx={{ position: 'absolute', left: '22%', top: '22%', width: '56%', height: '56%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
          {[
            { glyph: '₿', bg: '#F7931A', right: '8%', top: '10%', size: 56 },
            { glyph: 'Ξ', bg: '#627EEA', left: '10%', top: '36%', size: 56 },
            { glyph: 'T', bg: '#FF060A', right: '20%', bottom: '16%', size: 56 },
            { glyph: 'SOL', bg: 'linear-gradient(135deg, #9945FF, #14F195)', right: '4%', bottom: '36%', size: 48, fontSize: 14 },
            { glyph: '₮', bg: '#26A17B', left: '30%', bottom: '12%', size: 56, fontSize: 20 },
          ].map((c, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: c.size,
                height: c.size,
                borderRadius: '50%',
                background: c.bg,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: c.fontSize ?? 22,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                right: c.right,
                left: c.left,
                top: c.top,
                bottom: c.bottom,
              }}
            >
              {c.glyph}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'grid',
        placeItems: 'center',
        color: 'text.primary',
        cursor: 'pointer',
        '&:hover': { color: 'primary.main' },
      }}
    >
      {children}
    </Box>
  );
}

function HeroArt() {
  return (
    <Box sx={{ position: 'relative', aspectRatio: '1 / 0.92', maxWidth: 520, ml: 'auto', width: '100%' }} aria-hidden>
      <Box
        sx={{
          position: 'absolute',
          left: '8%',
          top: '4%',
          width: '84%',
          height: '92%',
          borderRadius: '50% 50% 0 0 / 50% 50% 0 0',
          border: '18px solid #3C6FF5',
          borderBottom: 0,
          opacity: 0.35,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '22%',
          top: '8%',
          width: '56%',
          height: '84%',
          background: 'linear-gradient(160deg, #3C6FF5 0%, #2A56D8 100%)',
          borderRadius: '26px',
          boxShadow: '0 24px 60px -12px rgba(60,111,245,0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          color: '#fff',
          p: '22px',
          textAlign: 'center',
        }}
      >
        <Box sx={{ fontSize: 11, letterSpacing: '1.5px', fontWeight: 600, opacity: 0.8 }}>COMMISSION</Box>
        <Box sx={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1 }}>$1,299.99</Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.18)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ArrowUp size={28} strokeWidth={2.5} />
        </Box>
        <Box sx={{ mt: '4px', bgcolor: '#14171F', color: '#fff', p: '8px 18px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '1px' }}>
          WITHDRAWAL
        </Box>
      </Box>
      {[
        { glyph: '$', left: '-2%', top: '26%', size: 64 },
        { glyph: '₿', left: '14%', top: '6%', size: 56, bg: '#F7931A' },
        { glyph: 'Ξ', right: '-2%', top: '18%', size: 56, bg: '#627EEA' },
        { glyph: '₮', right: '8%', top: '64%', size: 56, bg: '#26A17B', fontSize: 26 },
        { glyph: '$', left: '6%', bottom: '6%', size: 44, fontSize: 18 },
      ].map((c, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: c.size,
            height: c.size,
            borderRadius: '50%',
            background: c.bg ?? '#F5A524',
            boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.15)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: c.fontSize ?? 22,
            left: c.left,
            right: c.right,
            top: c.top,
            bottom: c.bottom,
          }}
        >
          {c.glyph}
        </Box>
      ))}
    </Box>
  );
}
