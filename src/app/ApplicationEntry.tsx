import { lazy, Suspense } from 'react';
import App from '../App';
import { useLocation } from './router';
const LegacyEntry = lazy(() => import('../legacy/LegacyEntry'));
export default function ApplicationEntry() {
  const location = useLocation();
  const legacy =
    location.split('?')[0] === '/' &&
    new URLSearchParams(location.split('?')[1]).has('store');
  return legacy ? (
    <Suspense fallback={<p role="status">Loading store…</p>}>
      <LegacyEntry />
    </Suspense>
  ) : (
    <App />
  );
}
