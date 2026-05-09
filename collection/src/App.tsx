import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AutoCollection from './pages/AutoCollection';
import ManualCollection from './pages/ManualCollection';
import CollectionJobs from './pages/CollectionJobs';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/collection/auto" replace />} />
        <Route path="/collection" element={<Navigate to="/collection/auto" replace />} />
        <Route path="/collection/auto" element={<AutoCollection />} />
        <Route path="/collection/manual" element={<ManualCollection />} />
        <Route path="/collection/jobs" element={<CollectionJobs />} />
        {/* legacy alias */}
        <Route path="/collection/records" element={<Navigate to="/collection/jobs" replace />} />
        <Route path="*" element={<Navigate to="/collection/auto" replace />} />
      </Routes>
    </Layout>
  );
}
