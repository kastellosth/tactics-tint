export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  height: number;
  position: string;
  qualityScore: number;
  speed: number;
  stamina: number;
  strength: number;
  balance: number;
  agility: number;
  jumping: number;
}

export interface OpponentPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  slot: string;
  qualityScore: number;
}

export interface OptimizationRun {
  id: string;
  date: string;
  myTeam: string;
  opponent: string;
  formation: string;
  totalCost: number;
  planSummary: string;
  status: 'completed' | 'running' | 'failed';
  wingWeight: number;
  midWeight: number;
  aerialWeight: number;
  defenseWeight: number;
}

export interface RunDetail extends OptimizationRun {
  myLineup: Array<{
    player: Player;
    slot: string;
    cost: number;
    effectiveness: number;
  }>;
  opponentLineup: OpponentPlayer[];
  insights: string[];
  tacticalPlan: string;
}

export const mockPlayers: Player[] = [
  {
    id: "p1",
    firstName: "Marcus",
    lastName: "Silva",
    birthYear: 1995,
    height: 185,
    position: "ST",
    qualityScore: 87,
    speed: 82,
    stamina: 79,
    strength: 85,
    balance: 78,
    agility: 80,
    jumping: 88
  },
  {
    id: "p2",
    firstName: "Alex",
    lastName: "Johnson",
    birthYear: 1992,
    height: 182,
    position: "CAM",
    qualityScore: 84,
    speed: 78,
    stamina: 85,
    strength: 72,
    balance: 86,
    agility: 87,
    jumping: 65
  },
  {
    id: "p3",
    firstName: "David",
    lastName: "Martinez",
    birthYear: 1996,
    height: 178,
    position: "CM",
    qualityScore: 81,
    speed: 74,
    stamina: 88,
    strength: 76,
    balance: 83,
    agility: 79,
    jumping: 68
  },
  {
    id: "p4",
    firstName: "Carlos",
    lastName: "Rodriguez",
    birthYear: 1994,
    position: "CB",
    height: 188,
    qualityScore: 83,
    speed: 65,
    stamina: 82,
    strength: 89,
    balance: 81,
    agility: 68,
    jumping: 91
  },
  {
    id: "p5",
    firstName: "James",
    lastName: "Wilson",
    birthYear: 1993,
    position: "GK",
    height: 191,
    qualityScore: 86,
    speed: 58,
    stamina: 75,
    strength: 84,
    balance: 88,
    agility: 85,
    jumping: 82
  },
  {
    id: "p6",
    firstName: "Luis",
    lastName: "Garcia",
    birthYear: 1997,
    height: 175,
    position: "LW",
    qualityScore: 79,
    speed: 89,
    stamina: 77,
    strength: 68,
    balance: 84,
    agility: 91,
    jumping: 72
  },
  {
    id: "p7",
    firstName: "Thomas",
    lastName: "Anderson",
    birthYear: 1995,
    height: 181,
    position: "RB",
    qualityScore: 78,
    speed: 81,
    stamina: 84,
    strength: 79,
    balance: 80,
    agility: 78,
    jumping: 74
  },
  {
    id: "p8",
    firstName: "Roberto",
    lastName: "Santos",
    birthYear: 1991,
    height: 183,
    position: "CDM",
    qualityScore: 85,
    speed: 71,
    stamina: 86,
    strength: 83,
    balance: 85,
    agility: 75,
    jumping: 77
  }
];

export const mockOpponents: OpponentPlayer[] = [
  { id: "o1", firstName: "Cristiano", lastName: "Ronaldo", position: "ST", slot: "9", qualityScore: 94 },
  { id: "o2", firstName: "Kevin", lastName: "De Bruyne", position: "CAM", slot: "10", qualityScore: 91 },
  { id: "o3", firstName: "Virgil", lastName: "van Dijk", position: "CB", slot: "4", qualityScore: 90 },
  { id: "o4", firstName: "Sadio", lastName: "Mané", position: "LW", slot: "11L", qualityScore: 88 },
  { id: "o5", firstName: "Mohamed", lastName: "Salah", position: "RW", slot: "7R", qualityScore: 89 },
  { id: "o6", firstName: "Casemiro", lastName: "", position: "CDM", slot: "6", qualityScore: 86 },
  { id: "o7", firstName: "Andrew", lastName: "Robertson", position: "LB", slot: "3L", qualityScore: 84 },
  { id: "o8", firstName: "Trent", lastName: "Alexander-Arnold", position: "RB", slot: "2R", qualityScore: 85 },
  { id: "o9", firstName: "Raphael", lastName: "Varane", position: "CB", slot: "5", qualityScore: 87 },
  { id: "o10", firstName: "Jordan", lastName: "Henderson", position: "CM", slot: "8", qualityScore: 82 },
  { id: "o11", firstName: "Alisson", lastName: "Becker", position: "GK", slot: "1", qualityScore: 89 }
];

export const mockRuns: OptimizationRun[] = [
  {
    id: "run1",
    date: "2024-01-15",
    myTeam: "Arsenal FC",
    opponent: "Liverpool FC",
    formation: "4-3-3",
    totalCost: 245000000,
    planSummary: "Counter-attack through wings, exploit pace differential",
    status: "completed",
    wingWeight: 0.35,
    midWeight: 0.25,
    aerialWeight: 0.20,
    defenseWeight: 0.20
  },
  {
    id: "run2",
    date: "2024-01-12",
    myTeam: "Arsenal FC",
    opponent: "Manchester City",
    formation: "4-2-3-1",
    totalCost: 267000000,
    planSummary: "Defensive stability, quick transitions",
    status: "completed",
    wingWeight: 0.25,
    midWeight: 0.35,
    aerialWeight: 0.15,
    defenseWeight: 0.25
  },
  {
    id: "run3",
    date: "2024-01-10",
    myTeam: "Arsenal FC",
    opponent: "Chelsea FC",
    formation: "3-5-2",
    totalCost: 289000000,
    planSummary: "Midfield dominance, aerial threat",
    status: "running",
    wingWeight: 0.20,
    midWeight: 0.40,
    aerialWeight: 0.25,
    defenseWeight: 0.15
  }
];

export const mockRunDetail: RunDetail = {
  ...mockRuns[0],
  myLineup: [
    { player: mockPlayers[4], slot: "1", cost: 35000000, effectiveness: 88 },
    { player: mockPlayers[6], slot: "2R", cost: 25000000, effectiveness: 82 },
    { player: mockPlayers[3], slot: "4", cost: 45000000, effectiveness: 86 },
    { player: mockPlayers[3], slot: "5", cost: 42000000, effectiveness: 84 },
    { player: mockPlayers[6], slot: "3L", cost: 28000000, effectiveness: 80 },
    { player: mockPlayers[7], slot: "6", cost: 38000000, effectiveness: 87 },
    { player: mockPlayers[2], slot: "8", cost: 32000000, effectiveness: 83 },
    { player: mockPlayers[1], slot: "10", cost: 48000000, effectiveness: 89 },
    { player: mockPlayers[5], slot: "11L", cost: 30000000, effectiveness: 85 },
    { player: mockPlayers[0], slot: "9", cost: 55000000, effectiveness: 91 },
    { player: mockPlayers[5], slot: "7R", cost: 28000000, effectiveness: 84 }
  ],
  opponentLineup: mockOpponents,
  insights: [
    "Exploit pace mismatch on right wing vs slow fullback",
    "Target aerial duels in final third with 91% jumping advantage",
    "Press high to disrupt opponent's build-up play",
    "Use counter-attacks when opponent commits forward",
    "Maintain compact defensive shape in transition",
    "Overload left side to create numerical advantage"
  ],
  tacticalPlan: "Deploy a high-intensity pressing system to disrupt Liverpool's build-up play. Exploit the pace differential on the right wing where our winger has a significant speed advantage. Focus on quick transitions and counter-attacks when the opponent commits players forward."
};

export const mockKPIs = {
  averageCost: 256000000,
  totalRuns: 24,
  successRate: 87,
  avgWingWeight: 0.28,
  avgMidWeight: 0.32,
  avgAerialWeight: 0.22,
  avgDefenseWeight: 0.18
};