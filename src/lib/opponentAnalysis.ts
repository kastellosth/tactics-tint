// OpponentAnalysis.ts - Complete opponent analysis with matchup insights
import { TACTICAL_CONFIG } from "./tacticalConfig";
import { getRoleFromSlot } from "./formationPositions";

const normalizePreferredFoot = (v: any): string => {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  if (s.startsWith("r")) return "R";
  if (s.startsWith("l")) return "L";
  if (s.startsWith("b")) return "B";
  return "";
};

const pick = (headers: string[], values: string[], ...candidates: string[]): string => {
  for (const name of candidates) {
    const i = headers.indexOf(name.toLowerCase());
    if (i >= 0) return values[i];
  }
  return "";
};

const pickN = (headers: string[], values: string[], candidates: string[], fallback = 0): number => {
  const raw = pick(headers, values, ...candidates);
  if (raw === "" || raw == null) return fallback;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

export function inferOpponentFormation(opponent: any[]): string {
  const roles = (opponent || []).map(p => getRoleFromSlot(p.slot || p.position || ''));
  const d = roles.filter(r => r === "defender").length;
  const m = roles.filter(r => r === "midfielder").length;
  const a = roles.filter(r => r === "attacker").length;
  return `${d}-${m}-${a}`;
}

export function parseOpponentCSV(text: string): any[] {
  const lines = String(text || "").replace(/\r/g, "").trim().split("\n");
  if (!lines.length) return [];

  const rawHeaders = lines[0].split(",").map((h) => h.trim());
  const headers = rawHeaders.map((h) => h.toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());

    const firstName = pick(headers, values, "firstname", "first_name");
    const lastName  = pick(headers, values, "lastname", "last_name");
    const name = (pick(headers, values, "name", "player", "displayname") || `${firstName} ${lastName}`).trim();

    const numberRaw = pick(headers, values, "number", "jersey", "kit", "shirt", "id");
    const number = numberRaw ? parseInt(numberRaw, 10) || 0 : 0;

    const preferredFoot = normalizePreferredFoot(pick(headers, values, "preferredfoot", "foot"));
    const slotOrPos = (pick(headers, values, "slot", "position") || "").toUpperCase();
    const num = (keys: string[], fb = 0) => pickN(headers, values, keys, fb);

    return {
      id: pick(headers, values, "id"),
      firstName,
      lastName,
      name,
      number,
      preferredFoot,
      position: slotOrPos,
      slot: slotOrPos,
      height: num(["height"]),
      quality: num(["quality", "qualityscore", "overall"]),
      speed: num(["speed"]),
      stamina: num(["stamina"]),
      strength: num(["strength"]),
      balance: num(["balance"]),
      agility: num(["agility"]),
      jumping: num(["jumping"]),
      heading: num(["heading"]),
      aerial: num(["aerial"]),
      passing: num(["passing"]),
      vision: num(["vision"]),
      firstTouch: num(["firsttouch", "first_touch"]),
      finishing: num(["finishing"]),
      tackling: num(["tackling"]),
      positioning: num(["positioning"]),
      pressResistance: num(["pressresistance", "press_resistance"]),
      offBall: num(["offball", "off_ball"])
    };
  });
}

const avg = (arr: number[]): number => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const compositeAerial = (p: any): number => avg([p.jumping || 0, p.heading || 0, p.aerial || 0]);
const compositePace = (p: any): number => avg([p.speed || 0, p.agility || 0]);
const compositePress = (p: any): number => avg([p.tackling || 0, p.positioning || 0]);

export function analyzeOpponentTeam(opponentArray: any[]): any {
  const opp = Array.isArray(opponentArray) ? opponentArray : [];
  if (!opp.length) {
    return {
      insights: {
        backlinePace: 0,
        backlineAerial: 0,
        midfieldStamina: 0,
        midfieldPress: 0,
        attackSpeed: 0,
        attackFinishing: 0
      },
      suggestions: []
    };
  }

  const roles = opp.map((p) => getRoleFromSlot(p.slot || p.position || ''));
  const defenders = opp.filter((_, i) => roles[i] === "defender");
  const mids = opp.filter((_, i) => roles[i] === "midfielder");
  const attackers = opp.filter((_, i) => roles[i] === "attacker");

  const backlinePace = avg(defenders.map(compositePace));
  const backlineAerial = avg(defenders.map(compositeAerial));
  const midfieldStamina = avg(mids.map((p) => p.stamina || 0));
  const midfieldPress = avg(mids.map(compositePress));
  const attackSpeed = avg(attackers.map((p) => p.speed || 0));
  const attackFinishing = avg(attackers.map((p) => p.finishing || 0));

  const insights = {
    backlinePace,
    backlineAerial,
    midfieldStamina,
    midfieldPress,
    attackSpeed,
    attackFinishing
  };

  const TT = TACTICAL_CONFIG.teamThresholds;
  const suggestions: string[] = [];
  if (backlinePace <= (TT.backlinePaceMax ?? 70))
    suggestions.push("Exploit wings and direct runs (their backline pace is beatable).");
  if (backlineAerial <= (TT.backlineAerialMax ?? 65))
    suggestions.push("Cross more and attack aerially (their aerial strength is limited).");
  if (midfieldStamina <= (TT.midfieldStaminaMax ?? 70))
    suggestions.push("Increase tempo and press in midfield (stamina edge).");
  if (midfieldPress <= (TT.midfieldPressMax ?? 65))
    suggestions.push("Play through the thirds; focus on short combinations (low pressing threat).");
  if (attackSpeed >= (TT.attackSpeedMin ?? 85))
    suggestions.push("Protect depth; keep a compact line vs pacey forwards.");
  if (attackFinishing >= (TT.attackFinishingMin ?? 85))
    suggestions.push("Limit shooting lanes; deny entries to zone 14.");

  return { insights, suggestions };
}

const isWingSlot = (slot: string): boolean => /(RW|LW|7|11|RWB|LWB)/.test(String(slot || "").toUpperCase());
const isMidCM = (slot: string): boolean => /CM|^8(L|R)?$/.test(String(slot || "").toUpperCase());
const isMidDM = (slot: string): boolean => /CDM|DM|^6(L|R)?$/.test(String(slot || "").toUpperCase());
const isMidAM = (slot: string): boolean => /CAM|AM|^10(L|R)?$/.test(String(slot || "").toUpperCase());
const isStriker = (slot: string): boolean => /ST|CF|^9(L|R)?$/.test(String(slot || "").toUpperCase());
const nz = (v: any, d = 0): number => (Number.isFinite(v) ? v : d);

export function analyzeMatchups(myAssignments: any[], opponent: any[]): any {
  const oppBySlot = new Map((opponent || []).map((p) => [String(p.slot || p.position), p]));
  const scores = { wings: 0, midfield: 0, aerial: 0, defense: 0, creation: 0 };
  const insights: string[] = [];

  const { thresholds: T, deltaImpact, suggestionWeights } = TACTICAL_CONFIG;
  const FAST = T?.fast ?? 0.12;
  const AIR = T?.air ?? 0.10;
  const TECH = T?.qual ?? 0.10;
  const STR = T?.str ?? 0.10;
  const STAM = T?.stam ?? 0.12;

  const add = (k: string, v: number) => {
    const catW = k in (suggestionWeights || {}) ? (suggestionWeights as any)[k] : 1.0;
    const deltaW =
      k === "wings" ? (deltaImpact?.speed ?? 1.0) :
      k === "midfield" ? (deltaImpact?.stamina ?? 1.0) :
      k === "aerial" ? (deltaImpact?.jumping ?? 1.0) :
      k === "defense" ? (deltaImpact?.speed ?? 1.0) :
      k === "creation" ? (deltaImpact?.quality ?? 1.0) : 1.0;
    scores[k] = (scores[k] || 0) + Math.max(0, v) * catW * deltaW;
  };

  for (const asg of myAssignments || []) {
    const slot = String(asg.position || "");
    const me = asg.my || {};
    const opp = oppBySlot.get(slot) || null;

    const dSpeed = (nz(me.speed) - nz(opp?.speed, 50)) / 100;
    const dAgility = (nz(me.agility) - nz(opp?.agility, 50)) / 100;
    const dStam = (nz(me.stamina) - nz(opp?.stamina, 50)) / 100;
    const dStrength = (nz(me.strength) - nz(opp?.strength, 50)) / 100;
    const dAerial = ((nz(me.jumping) + nz(me.heading) + nz(me.aerial)) -
      (nz(opp?.jumping, 50) + nz(opp?.heading, 50) + nz(opp?.aerial, 50))) / 300;
    const myTech = (nz(me.passing) + nz(me.vision) + nz(me.firstTouch)) / 300;
    const oppPress = (nz(opp?.tackling, 50) + nz(opp?.positioning, 50)) / 200;
    const dTech = myTech - oppPress;

    if (isWingSlot(slot)) {
      const paceEdge = Math.max(dSpeed, dAgility);
      if (paceEdge >= FAST) {
        insights.push(`Wing advantage at ${slot}: pace/1v1 edge.`);
        add("wings", paceEdge);
        add("creation", Math.max(0, dTech));
      }
      if (dAerial >= AIR) {
        insights.push(`Aerial mismatch wide at ${slot}: target far-post crosses.`);
        add("aerial", dAerial);
      }
    }

    if (isMidCM(slot) || isMidDM(slot) || isMidAM(slot)) {
      if (dStam >= STAM) {
        insights.push(`Midfield engine at ${slot}: tempo/pressing edge (stamina).`);
        add("midfield", dStam);
      }
      if (dTech >= TECH) {
        insights.push(`Creation lane at ${slot}: technical edge vs their press.`);
        add("creation", dTech);
      }
      if (dStrength >= STR && isMidDM(slot)) {
        insights.push(`Screen advantage at ${slot}: strength in duels.`);
        add("defense", dStrength);
      }
    }

    if (isStriker(slot)) {
      const finLane = Math.max(dSpeed, dAerial);
      if (finLane >= Math.min(FAST, AIR)) {
        insights.push(`Finishing lanes at ${slot}: exploit depth or aerials.`);
        add("creation", finLane);
      }
    }

    if (!opp) continue;
    if (getRoleFromSlot(slot) === "defender") {
      const risk = (nz(opp.speed) - nz(me.speed)) / 100;
      if (risk > FAST) {
        insights.push(`Risk at ${slot}: their attacker is significantly faster — protect depth.`);
      }
    }
  }

  const suggestions: string[] = [];
  const topCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([cat]) => cat);

  if (topCategories.includes('wings')) suggestions.push('Exploit wing advantages with direct runs and crosses');
  if (topCategories.includes('midfield')) suggestions.push('Control tempo through midfield superiority');
  if (topCategories.includes('creation')) suggestions.push('Focus on technical build-up and key passes');
  if (topCategories.includes('aerial')) suggestions.push('Target aerial duels and set pieces');
  if (topCategories.includes('defense')) suggestions.push('Maintain defensive structure and press intelligently');

  const finalSuggestion = suggestions.length > 0 ? suggestions[0] : 'Balanced tactical approach';

  return { scores, insights, suggestions, finalSuggestion };
}