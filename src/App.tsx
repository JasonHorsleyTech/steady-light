import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * Lazy-load dev routes behind import.meta.env.DEV.
 * Vite replaces DEV with `false` in production, making the dynamic import
 * dead code — Rollup tree-shakes it out of the bundle entirely.
 */
const DevLayout = import.meta.env.DEV
  ? lazy(() => import('./dev/DevLayout'))
  : null;

const DevIndex = import.meta.env.DEV
  ? lazy(() => import('./dev/DevIndex').then((m) => ({ default: m.DevIndex })))
  : null;

const DevTest = import.meta.env.DEV
  ? lazy(() => import('./dev/DevTest').then((m) => ({ default: m.DevTest })))
  : null;

function Home() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', color: '#e0e0e0', background: '#1a1a2e', minHeight: '100vh' }}>
      <h1>Steady Light</h1>
      <p>A philosophical RPG.</p>
      <p style={{ color: '#666' }}>Dev server running. Game systems coming soon.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          {DevLayout && DevIndex && DevTest && (
            <Route path="/dev" element={<DevLayout />}>
              <Route index element={<DevIndex />} />
              <Route path="test" element={<DevTest />} />
            </Route>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
