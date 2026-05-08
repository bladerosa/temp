// App: top-level router between 常规通知 and 自动通知

function App() {
  const [active, setActive] = useState(() => {
    try { return localStorage.getItem('notice_active') || 'notice.normal'; }
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
