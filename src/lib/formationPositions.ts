// Formation definitions and position mappings
export const formationPositions: Record<string, string[]> = {
  '4-3-3': ['1', '2', '3', '4', '5', '6', '7', '8', '10', '11L', '9'],
  '4-4-2': ['1', '2', '3', '4', '5', '7', '8', '10', '11', '9', '9R'],
  '3-5-2': ['1', '3', '4', '3R', '2', '5', '6', '7', '8', '9', '9R'],
  '4-2-3-1': ['1', '2', '3', '4', '5', '6', '8', '7', '10', '11', '9'],
  '3-4-3': ['1', '3', '4', '3R', '7', '8', '10', '11L', '11R', '9', '9L']
};

export const getRoleFromSlot = (slot: string): string => {
  const slotNum = String(slot).match(/\d+/)?.[0];
  switch (slotNum) {
    case '1': return 'goalkeeper';
    case '2': case '5': return 'defender'; // Full-backs
    case '3': case '4': return 'defender'; // Centre-backs
    case '6': return 'midfielder'; // CDM
    case '7': case '8': return 'midfielder'; // CM
    case '10': return 'midfielder'; // CAM
    case '11': return 'attacker'; // Wings
    case '9': return 'attacker'; // Striker
    default: return 'midfielder';
  }
};

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