// Football-aware cost function for lineup optimization
interface Player {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  preferredFoot?: string;
  height: number;
  position: string;
  number?: number;
  quality: number;
  speed: number;
  stamina: number;
  strength: number;
  balance: number;
  agility: number;
  jumping: number;
  heading?: number;
  aerial?: number;
  passing?: number;
  vision?: number;
  firstTouch?: number;
  finishing?: number;
  tackling?: number;
  positioning?: number;
  pressResistance?: number;
  offBall?: number;
}

interface OpponentInsights {
  backlinePace?: number;
  backlineAerial?: number;
  midfieldStamina?: number;
  midfieldPress?: number;
  attackSpeed?: number;
  attackFinishing?: number;
}

// Role mapping from slot to required skills
const getRoleFromSlot = (slot: string): string => {
  const slotNum = String(slot).match(/\d+/)?.[0];
  switch (slotNum) {
    case '1': return 'GK';
    case '2': case '5': return 'FB_R'; // RB
    case '3': case '4': return 'CB';
    case '6': return 'CDM';
    case '7': case '8': return 'CM';
    case '10': return 'CAM';
    case '11': return slot.includes('L') ? 'W_L' : 'W_R'; // Wings
    case '9': return 'ST';
    default: return 'CM';
  }
};

// Normalize preferred foot
const normalizePreferredFoot = (foot?: string): string => {
  if (!foot) return 'B';
  const f = foot.toUpperCase();
  if (f.startsWith('R')) return 'R';
  if (f.startsWith('L')) return 'L';
  if (f.includes('BOTH') || f === 'B') return 'B';
  return 'B';
};

// Safe numeric conversion
const safeNum = (val: any, defaultVal = 0): number => {
  const num = Number(val);
  return isNaN(num) ? defaultVal : Math.max(0, Math.min(100, num));
};

// Calculate role fitness
const calculateRoleFitness = (player: Player, role: string): number => {
  const quality = safeNum(player.quality);
  const speed = safeNum(player.speed);
  const stamina = safeNum(player.stamina);
  const strength = safeNum(player.strength);
  const balance = safeNum(player.balance);
  const agility = safeNum(player.agility);
  const jumping = safeNum(player.jumping);
  const heading = safeNum(player.heading);
  const aerial = safeNum(player.aerial);
  const passing = safeNum(player.passing);
  const vision = safeNum(player.vision);
  const firstTouch = safeNum(player.firstTouch);
  const finishing = safeNum(player.finishing);
  const tackling = safeNum(player.tackling);
  const positioning = safeNum(player.positioning);
  const pressResistance = safeNum(player.pressResistance);
  const offBall = safeNum(player.offBall);
  const height = safeNum(player.height, 180);

  // Aerial power composite
  const aerialPower = (aerial + heading + jumping + (height - 160) / 2) / 4;

  switch (role) {
    case 'GK':
      return (quality * 0.4 + agility * 0.2 + balance * 0.15 + positioning * 0.15 + jumping * 0.1);
    
    case 'CB':
      return (quality * 0.25 + strength * 0.2 + aerialPower * 0.2 + tackling * 0.15 + positioning * 0.2);
    
    case 'FB_R':
    case 'FB_L':
      return (quality * 0.2 + speed * 0.25 + stamina * 0.2 + tackling * 0.15 + passing * 0.1 + agility * 0.1);
    
    case 'CDM':
      return (quality * 0.2 + tackling * 0.25 + passing * 0.2 + stamina * 0.15 + positioning * 0.1 + pressResistance * 0.1);
    
    case 'CM':
      return (quality * 0.2 + passing * 0.2 + stamina * 0.2 + vision * 0.15 + firstTouch * 0.1 + pressResistance * 0.15);
    
    case 'CAM':
      return (quality * 0.25 + passing * 0.2 + vision * 0.2 + firstTouch * 0.15 + finishing * 0.1 + offBall * 0.1);
    
    case 'W_R':
    case 'W_L':
      return (quality * 0.2 + speed * 0.25 + agility * 0.2 + finishing * 0.15 + offBall * 0.1 + balance * 0.1);
    
    case 'ST':
      return (quality * 0.25 + finishing * 0.25 + positioning * 0.15 + aerialPower * 0.15 + offBall * 0.1 + strength * 0.1);
    
    default:
      return quality;
  }
};

// Calculate footedness fit for flanks
const calculateFootednessFit = (player: Player, slot: string): number => {
  const foot = normalizePreferredFoot(player.preferredFoot);
  const role = getRoleFromSlot(slot);
  
  if (role === 'FB_R' || role === 'W_R') {
    // Right flank - prefer right foot
    if (foot === 'R') return 1.0;
    if (foot === 'B') return 0.95;
    return 0.85; // Left foot (inverted)
  }
  
  if (role === 'FB_L' || role === 'W_L') {
    // Left flank - prefer left foot
    if (foot === 'L') return 1.0;
    if (foot === 'B') return 0.95;
    return 0.85; // Right foot (inverted)
  }
  
  return 1.0; // No penalty for central positions
};

// Formation vs formation multipliers
const getFormationMultiplier = (myFormation: string, oppFormation: string): number => {
  const formationMap: Record<string, Record<string, number>> = {
    '4-3-3': { '4-4-2': 1.05, '3-5-2': 0.95, '4-3-3': 1.0 },
    '4-4-2': { '4-3-3': 0.95, '3-5-2': 1.0, '4-4-2': 1.0 },
    '3-5-2': { '4-3-3': 1.05, '4-4-2': 1.0, '3-5-2': 1.0 }
  };
  
  return formationMap[myFormation]?.[oppFormation] || 1.0;
};

// Calculate opponent differential
const calculateOpponentDifferential = (
  player: Player, 
  opponentAtSlot: Player | null, 
  oppInsights?: OpponentInsights
): number => {
  if (!opponentAtSlot) return 1.0;
  
  const myQuality = safeNum(player.quality);
  const oppQuality = safeNum(opponentAtSlot.quality);
  
  // Base differential (positive when we're better)
  const qualityDiff = (myQuality - oppQuality) / 100;
  
  // Apply insights if available
  let insightBonus = 0;
  if (oppInsights) {
    // Example: if opponent has weak backline pace, favor fast defenders
    if (oppInsights.backlinePace && oppInsights.backlinePace < 70) {
      insightBonus += safeNum(player.speed) / 1000; // Small bonus for speed
    }
  }
  
  return 1.0 + (qualityDiff * 0.1) + insightBonus;
};

// Main cost calculation function
export const calculatePlayerPositionCost = (
  player: Player,
  targetSlot: string,
  opponentAtSlot?: Player | null,
  myFormation?: string,
  oppFormation?: string,
  oppInsights?: OpponentInsights
): number => {
  // Hard rule: only GK in GK position
  const role = getRoleFromSlot(targetSlot);
  const playerPos = player.position?.toUpperCase() || '';
  
  if (role === 'GK' && playerPos !== 'GK') {
    return 1e6; // Very high cost to prevent non-GK in GK slot
  }
  
  if (role !== 'GK' && playerPos === 'GK') {
    return 1e6; // Very high cost to prevent GK in outfield
  }
  
  // Calculate role fitness (0-100 scale)
  const roleFitness = calculateRoleFitness(player, role);
  
  // Calculate footedness fit (0.85-1.0 scale)
  const footednessFit = calculateFootednessFit(player, targetSlot);
  
  // Formation multiplier
  const formationMult = getFormationMultiplier(myFormation || '4-3-3', oppFormation || '4-3-3');
  
  // Opponent differential
  const oppDiff = calculateOpponentDifferential(player, opponentAtSlot, oppInsights);
  
  // Advanced fitness (70% weight)
  const advancedFit = roleFitness * footednessFit * formationMult;
  
  // Opponent matchup (30% weight)
  const matchupFit = safeNum(player.quality) * oppDiff;
  
  // Final fitness score
  const finalFitness = advancedFit * 0.7 + matchupFit * 0.3;
  
  // Convert to cost (higher fitness = lower cost)
  return Math.max(0.1, 110 - finalFitness);
};