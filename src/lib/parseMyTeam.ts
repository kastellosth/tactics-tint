// Enhanced CSV parser for my team with robust field mapping
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

// Safe numeric conversion with clamping
const safeNum = (val: any, defaultVal = 0): number => {
  const num = Number(val);
  return isNaN(num) ? defaultVal : Math.max(0, Math.min(100, num));
};

// Name helpers for robust name coalescing
const coalesceNameParts = (vals: any[]): string[] =>
  vals.filter(Boolean).map(String).map(s => s.trim()).filter(Boolean);

const coalesceName = (record: Record<string, string>): string => {
  const parts = coalesceNameParts([
    record?.name,
    record?.player,
    record?.displayName,
    [record?.firstName, record?.lastName].filter(Boolean).join(" "),
    [record?.first_name, record?.last_name].filter(Boolean).join(" ")
  ]);
  return parts[0] || "";
};

export const parseMyTeamCSV = (text: string): Player[] => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((k, i) => obj[k] = values[i] || '');
    
    // Robust field mapping with multiple header variations
    const firstName = obj.firstname || obj.first_name || obj['first name'] || '';
    const lastName = obj.lastname || obj.last_name || obj['last name'] || '';
    const displayName = coalesceName(obj) || `${firstName} ${lastName}`.trim();
    
    return {
      id: obj.id || obj.number || `player_${index + 1}`,
      firstName,
      lastName,
      name: displayName,
      preferredFoot: obj.preferredfoot || obj.preferred_foot || obj.foot || obj.pref_foot,
      height: safeNum(obj.height, 180),
      position: (obj.position || '').toUpperCase(),
      number: safeNum(obj.number || obj.jersey || obj['jersey number']),
      quality: safeNum(obj.quality || obj.qualityscore || obj.rating),
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
      firstTouch: safeNum(obj.firsttouch || obj.first_touch || obj['first touch']),
      finishing: safeNum(obj.finishing),
      tackling: safeNum(obj.tackling),
      positioning: safeNum(obj.positioning),
      pressResistance: safeNum(obj.pressresistance || obj.press_resistance || obj['press resistance']),
      offBall: safeNum(obj.offball || obj.off_ball || obj['off ball'])
    };
  });
};