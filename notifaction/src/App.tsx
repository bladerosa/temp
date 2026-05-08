import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { NormalNotice } from './NormalNotice';
import { AutoNotice } from './AutoNotice';
import type { NavKey } from './types';

function App() {
  const [active, setActive] = useState<NavKey>(() => {
    try { return (localStorage.getItem('notice_active') as NavKey) || 'notice.normal'; }
    catch { return 'notice.normal'; }
  });

  useEffect(() => {
    try { localStorage.setItem('notice_active', active); } catch {}
  }, [active]);

  return (
    <Layout active={active} onNavigate={setActive}>
      {active === 'notice.normal' && <NormalNotice />}
      {active === 'notice.auto' && <AutoNotice />}
    </Layout>
  );
}

export default App;
