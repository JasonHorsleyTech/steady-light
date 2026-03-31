import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { bridgeManager } from '../bridges/bridge-manager';
import { logger } from '../core/logger';

/**
 * Layout wrapper for all /dev/* routes.
 * Enables all bridges by default so dev routes have full debug output.
 */
export default function DevLayout() {
  useEffect(() => {
    bridgeManager.enableAll();
    logger.log('DEBUG', { message: 'Dev routes: all bridges enabled' });

    return () => {
      bridgeManager.disableAll();
    };
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', color: '#e0e0e0', background: '#1a1a2e', minHeight: '100vh' }}>
      <nav style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.75rem' }}>
        <Link to="/dev" style={{ color: '#81d4fa', marginRight: '1rem' }}>Dev Index</Link>
        <Link to="/" style={{ color: '#666' }}>← Game</Link>
      </nav>
      <Outlet />
    </div>
  );
}
