// Infer opponent formation from player slots
import { getRoleFromSlot } from './formationPositions';

interface Player {
  slot?: string;
  position?: string;
}

export const inferOpponentFormation = (opponent: Player[]): string => {
  const roles = (opponent || []).map(p => getRoleFromSlot(p.slot || p.position || ''));
  const d = roles.filter(r => r === "defender").length;
  const m = roles.filter(r => r === "midfielder").length;
  const a = roles.filter(r => r === "attacker").length;
  return `${d}-${m}-${a}`; // e.g., "4-3-3"
};