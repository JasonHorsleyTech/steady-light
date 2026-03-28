import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
