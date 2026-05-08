import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconCheck, IconClose, IconAlert, IconInfo } from './Icon';

type Tone = 'success' | 'info' | 'warning' | 'error';

type Toast = {
  id: number;
  title: string;
  desc?: ReactNode;
  tone: Tone;
};

type ToastApi = {
  show: (t: { title: string; desc?: ReactNode; tone?: Tone; durationMs?: number }) => void;
};

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}

const TONE_ICON: Record<Tone, typeof IconCheck> = {
  success: IconCheck, info: IconInfo, warning: IconAlert, error: IconAlert,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback((t: { title: string; desc?: ReactNode; tone?: Tone; durationMs?: number }) => {
    const id = ++idRef.current;
    const tone: Tone = t.tone ?? 'success';
    const duration = t.durationMs ?? 5000;
    setToasts((prev) => [...prev, { id, title: t.title, desc: t.desc, tone }]);
    if (duration > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, duration);
    }
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // Trigger enter animation
  const [entered, setEntered] = useState(false);
  useEffect(() => { setEntered(true); }, []);

  const Icon = TONE_ICON[toast.tone];
  return (
    <div className={`toast tone-${toast.tone} ${entered ? 'enter' : ''}`} role="status">
      <span className="toast-icon"><Icon size={16}/></span>
      <div className="toast-body">
        <div className="toast-title">{toast.title}</div>
        {toast.desc && <div className="toast-desc">{toast.desc}</div>}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="关闭">
        <IconClose size={14}/>
      </button>
    </div>
  );
}
