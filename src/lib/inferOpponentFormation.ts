// Infer opponent formation from player slots
import { getRoleFromSlot } from './formationPositions';

interface Player {
  slot?: string;
  position?: string;
}

export const inferOpponentFormation = (opponent: Player[]): string => {
  const counts = { df: 0, mid: 0, att: 0 };
  
  opponent.forEach(p => {
    const role = getRoleFromSlot(p.slot || p.position || '');
    if (role === 'defender') counts.df++;
    if (role === 'midfielder') counts.mid++;
    if (role === 'attacker') counts.att++;
  });
  
  // Default to 4-3-3 if unclear
  const defenders = counts.df || 4;
  const midfielders = counts.mid || 3;
  const attackers = Math.max(1, counts.att || 3);
  
  return `${defenders}-${midfielders}-${attackers}`;
};