// Opponent analysis and matchup evaluation
import { getRoleFromSlot } from './formationPositions';

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
  slot?: string;
}

interface OpponentAnalysis {
  insights: {
    backlinePace: number;
    backlineAerial: number;
    midfieldStamina: number;
    midfieldPress: number;
    attackSpeed: number;
    attackFinishing: number;
  };
  suggestions: string[];
  finalSuggestion: string;
}

interface MatchupAnalysis {
  insights: string[];
  suggestions: string[];
  finalSuggestion: string;
}

interface Assignment {
  my: Player;
  position: string;
  cost?: number;
}

// Safe numeric conversion
const safeNum = (val: any, defaultVal = 0): number => {
  const num = Number(val);
  return isNaN(num) ? defaultVal : Math.max(0, Math.min(100, num));
};

// Enhanced CSV parser for opponent team
export const parseOpponentCSV = (text: string): Player[] => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((k, i) => obj[k] = values[i] || '');
    
    // Normalize position to slot if needed
    let slot = obj.slot || obj.position;
    if (!slot && obj.number) {
      slot = obj.number; // fallback to jersey number
    }
    
    return {
      id: obj.id || obj.number || `opp_${Math.random()}`,
      firstName: obj.firstname || obj.first_name || '',
      lastName: obj.lastname || obj.last_name || '',
      name: obj.name || '',
      preferredFoot: obj.preferredfoot || obj.preferred_foot || obj.foot,
      height: safeNum(obj.height, 180),
      position: (obj.position || '').toUpperCase(),
      number: safeNum(obj.number),
      quality: safeNum(obj.quality),
      speed: safeNum(obj.speed),
      stamina: safeNum(obj.stamina),
      strength: safeNum(obj.strength),
      balance: safeNum(obj.balance),
      agility: safeNum(obj.agility),
      jumping: safeNum(obj.jumping),
      heading: safeNum(obj.heading),
      aerial: safeNum(obj.aerial),
      passing: safeNum(obj.passing),
      vision: safeNum(obj.vision),
      firstTouch: safeNum(obj.firsttouch || obj.first_touch),
      finishing: safeNum(obj.finishing),
      tackling: safeNum(obj.tackling),
      positioning: safeNum(obj.positioning),
      pressResistance: safeNum(obj.pressresistance || obj.press_resistance),
      offBall: safeNum(obj.offball || obj.off_ball),
      slot: slot
    };
  });
};

// Analyze opponent team characteristics
export const analyzeOpponentTeam = (opponent: Player[]): OpponentAnalysis => {
  const defenders = opponent.filter(p => {
    const role = getRoleFromSlot(p.slot || '');
    return role === 'defender';
  });
  
  const midfielders = opponent.filter(p => {
    const role = getRoleFromSlot(p.slot || '');
    return role === 'midfielder';
  });
  
  const attackers = opponent.filter(p => {
    const role = getRoleFromSlot(p.slot || '');
    return role === 'attacker';
  });
  
  // Calculate averages
  const avgDefSpeed = defenders.length > 0 
    ? defenders.reduce((sum, p) => sum + safeNum(p.speed), 0) / defenders.length 
    : 70;
  
  const avgDefAerial = defenders.length > 0
    ? defenders.reduce((sum, p) => sum + (safeNum(p.aerial) + safeNum(p.heading) + safeNum(p.jumping)) / 3, 0) / defenders.length
    : 70;
  
  const avgMidStamina = midfielders.length > 0
    ? midfielders.reduce((sum, p) => sum + safeNum(p.stamina), 0) / midfielders.length
    : 70;
  
  const avgMidPress = midfielders.length > 0
    ? midfielders.reduce((sum, p) => sum + safeNum(p.pressResistance), 0) / midfielders.length
    : 70;
  
  const avgAttSpeed = attackers.length > 0
    ? attackers.reduce((sum, p) => sum + safeNum(p.speed), 0) / attackers.length
    : 70;
  
  const avgAttFinishing = attackers.length > 0
    ? attackers.reduce((sum, p) => sum + safeNum(p.finishing), 0) / attackers.length
    : 70;
  
  // Generate suggestions based on weaknesses
  const suggestions: string[] = [];
  
  if (avgDefSpeed < 65) {
    suggestions.push('Exploit slow defense with pace on the wings');
  }
  if (avgDefAerial < 70) {
    suggestions.push('Target aerial duels and set pieces');
  }
  if (avgMidStamina < 70) {
    suggestions.push('Press high to exploit stamina weaknesses');
  }
  if (avgMidPress < 65) {
    suggestions.push('Apply constant pressure in midfield');
  }
  if (avgAttSpeed < 70) {
    suggestions.push('Play a high defensive line');
  }
  if (avgAttFinishing < 65) {
    suggestions.push('Allow shots from distance, focus on crosses');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Balanced approach against well-rounded opponent');
  }
  
  const finalSuggestion = suggestions.length > 1 
    ? suggestions.slice(0, 2).join(' and ').toLowerCase()
    : suggestions[0].toLowerCase();
  
  return {
    insights: {
      backlinePace: Math.round(avgDefSpeed),
      backlineAerial: Math.round(avgDefAerial),
      midfieldStamina: Math.round(avgMidStamina),
      midfieldPress: Math.round(avgMidPress),
      attackSpeed: Math.round(avgAttSpeed),
      attackFinishing: Math.round(avgAttFinishing)
    },
    suggestions,
    finalSuggestion: `Focus on ${finalSuggestion}`
  };
};

// Analyze specific matchups
export const analyzeMatchups = (assignments: Assignment[], opponent: Player[]): MatchupAnalysis => {
  const insights: string[] = [];
  const suggestions: string[] = [];
  
  // Find key matchup battles
  assignments.forEach(assignment => {
    const myPlayer = assignment.my;
    const slot = assignment.position;
    const oppPlayer = opponent.find(p => String(p.slot) === String(slot));
    
    if (oppPlayer) {
      const myQuality = safeNum(myPlayer.quality);
      const oppQuality = safeNum(oppPlayer.quality);
      const qualityDiff = myQuality - oppQuality;
      
      if (Math.abs(qualityDiff) > 15) {
        const playerName = `${myPlayer.firstName} ${myPlayer.lastName}`.trim();
        const oppName = `${oppPlayer.firstName} ${oppPlayer.lastName}`.trim();
        
        if (qualityDiff > 15) {
          insights.push(`${playerName} has a significant advantage over ${oppName} at position ${slot}`);
        } else {
          insights.push(`${oppName} poses a threat to ${playerName} at position ${slot}`);
        }
      }
    }
  });
  
  // Generate tactical suggestions based on matchups
  const advantagePositions = assignments.filter(a => {
    const oppPlayer = opponent.find(p => String(p.slot) === String(a.position));
    return oppPlayer && safeNum(a.my.quality) > safeNum(oppPlayer.quality) + 10;
  });
  
  if (advantagePositions.length > 0) {
    const roles = advantagePositions.map(a => getRoleFromSlot(a.position));
    if (roles.includes('attacker')) {
      suggestions.push('Exploit attacking superiority with direct play');
    }
    if (roles.includes('midfielder')) {
      suggestions.push('Control the game through midfield dominance');
    }
    if (roles.includes('defender')) {
      suggestions.push('Build attacks from the back with confidence');
    }
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Maintain tactical discipline and wait for opportunities');
  }
  
  const finalSuggestion = suggestions.length > 0 
    ? suggestions[0] 
    : 'Balanced tactical approach';
  
  return {
    insights: insights.length > 0 ? insights : ['Evenly matched across all positions'],
    suggestions,
    finalSuggestion
  };
};