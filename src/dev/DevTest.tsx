import { useEffect } from 'react';
import { logger } from '../core/logger';

export function DevTest() {
  useEffect(() => {
    logger.log('STATE', { scene: 'dev-test', status: 'initialized' });
  }, []);

  return (
    <div>
      <h2>Dev Test</h2>
      <p>Dev route system working</p>
    </div>
  );
}
