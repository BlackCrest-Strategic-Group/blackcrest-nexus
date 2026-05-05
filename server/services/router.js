import { handleSourcing } from './business/sourcing.js';
import { improveResume } from './personal/resume.js';

export function routeTJ({ mode, message }) {
  const m = message.toLowerCase();
  if (mode === 'business') {
    if (/(source|supplier|lead time|quantity|part|procure)/.test(m)) return handleSourcing(message);
    return { text: 'TJ (Nexus): I can help with sourcing strategy, supplier risk, and procurement planning.', cards: [] };
  }
  if (/(resume|cv|bullet|summary|experience)/.test(m)) return improveResume(message);
  return { text: 'TJ (Steady): I can help refine communication, planning, and personal career materials.', cards: [] };
}
