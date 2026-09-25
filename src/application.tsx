import { lazy, Suspense } from 'react';
import App from './shared/containers/app/container';
import { useLocation } from './shared/containers/app/router';
import { frontgateComponents } from './frontgate/composition';
import { grandinComponents } from './grandin/composition';
import { garnethillComponents } from './garnethill/composition';
import './stylesheet.css';
const components = {
  fg: frontgateComponents,
  gr: grandinComponents,
  gh: garnethillComponents,
};
const LegacyEntry = lazy(() => import('./legacy/LegacyEntry'));
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
    <App components={components} />
  );
}
