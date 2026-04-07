import { Link } from 'react-router-dom';

interface DevRouteEntry {
  path: string;
  label: string;
  description: string;
  ready: boolean;
}

const devRoutes: DevRouteEntry[] = [
  { path: '/dev/test', label: 'Test', description: 'Verify dev route system is working', ready: true },
  { path: '/dev/grid', label: 'Grid', description: 'PixiJS 8×8 grid renderer', ready: true },
  { path: '/dev/combat', label: 'Combat', description: 'Stage 0 combat prototype', ready: false },
  { path: '/dev/dialogue', label: 'Dialogue', description: 'Dialogue system test', ready: false },
  { path: '/dev/economy', label: 'Economy', description: 'Economy and shop systems', ready: false },
  { path: '/dev/audio', label: 'Audio', description: 'Audio playback and timing', ready: false },
  { path: '/dev/world', label: 'World', description: 'Scene and NPC interactions', ready: false },
];

export function DevIndex() {
  return (
    <div>
      <h2>Available Dev Routes</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {devRoutes.map((route) => (
          <li key={route.path} style={{ marginBottom: '0.5rem' }}>
            {route.ready ? (
              <Link to={route.path} style={{ color: '#66bb6a' }}>{route.label}</Link>
            ) : (
              <span style={{ color: '#666' }}>{route.label} (coming soon)</span>
            )}
            {' — '}
            <span style={{ color: '#aaa' }}>{route.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
