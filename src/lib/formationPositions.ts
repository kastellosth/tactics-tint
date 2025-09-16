// formationPositions.ts
// Side-aware, consistent slot codes.

export const formationPositions: Record<string, string[]> = {
  // GK, RB, RCB, LCB, LB, DM, RCM, LCM, RW, ST, LW
  "4-3-3": ['1','2R','3R','3L','2L','6','8R','8L','11R','9','11L'],

  // GK, RB, RCB, LCB, LB, DM (R), DM (L), RW, AM, LW, ST
  "4-2-3-1": ['1','2R','3R','3L','2L','6R','6L','11R','10','11L','9'],

  // GK, RCB, CB, LCB, RWB, LWB, DM, RCM, LCM, RS, LS
  "3-5-2": ['1','3R','4','3L','2R','2L','6','8R','8L','9R','9L'],

  // GK, RB, RCB, LCB, LB, RM, DM, LM, RS, LS, (no AM)
  "4-4-2": ['1','2R','3R','3L','2L','11R','6','11L','9R','9L','8R'] // last slot = extra CM (8R)
};

export const getRoleFromSlot = (slot: string): string => {
  const s = String(slot || "").toUpperCase();
  const num = s.match(/\d+/)?.[0];
  if (num) {
    if (num === "1") return "gk";
    if (["2","3","4","5"].includes(num)) return "defender";
    if (["6","8","10"].includes(num)) return "midfielder";
    if (["9","11"].includes(num)) return "attacker";
  }
  if (/GK/.test(s)) return "gk";
  if (/CB|RB|LB|RWB|LWB|DF/.test(s)) return "defender";
  if (/DM|CM|AM|MF/.test(s)) return "midfielder";
  if (/ST|CF|SS|RW|LW|FW|ATT/.test(s)) return "attacker";
  return "midfielder";
};

export const getSide = (slot: string): string | null =>
  /L$/.test(String(slot)) ? 'L' : (/R$/.test(String(slot)) ? 'R' : null);

// Position coordinates for pitch visualization (4-3-3 formation)
export const positionMap: Record<string, { x: number; y: number }> = {
  '1': { x: 50, y: 90 }, // GK
  '2': { x: 80, y: 75 }, // RB
  '3': { x: 65, y: 75 }, // RCB
  '4': { x: 35, y: 75 }, // LCB
  '5': { x: 20, y: 75 }, // LB
  '6': { x: 50, y: 60 }, // CDM
  '7': { x: 70, y: 45 }, // RCM
  '8': { x: 30, y: 45 }, // LCM
  '10': { x: 50, y: 30 }, // CAM
  '11L': { x: 20, y: 15 }, // LW
  '11R': { x: 80, y: 15 }, // RW
  '9': { x: 50, y: 10 }, // ST
  '9R': { x: 60, y: 10 }, // RST for 4-4-2
  '9L': { x: 40, y: 10 }, // LST for 3-4-3
  '3R': { x: 75, y: 75 }, // RCB for 3-5-2
  '11': { x: 80, y: 15 } // RW for formations without L/R suffix
};