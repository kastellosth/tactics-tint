// Lower is better. Negative means favorable for us.

import { getRoleFromSlot } from "./formationPositions";

// ---------- helpers ----------
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const norm100 = (v: any): number => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : clamp01(n / 100);
};
const asNumber = (v: any, d = 0): number => {
  const n = parseFloat(v);
  return isNaN(n) ? d : n;
};

// Normalize preferred foot to "L" | "R" | "B" | ""
const normFoot = (f: any): string => {
  const s = String(f || "").trim().toLowerCase();
  if (!s) return "";
  if (s.startsWith("r")) return "R";
  if (s.startsWith("l")) return "L";
  if (s.startsWith("b")) return "B";
  return "";
};

const getQ = (p: any): number => asNumber(p?.quality ?? p?.Overall ?? p?.overall ?? 0, 0);

// Map slot → coarse role family used by penalties and weights
const roleSubfamilyFromSlot = (slot: string): string => {
  const s = String(slot || "").toUpperCase().trim();
  // exact-ish buckets (order matters; test most-specific first)
  if (s === "1" || s === "GK") return "GK";
  if (/^(CB|RCB|LCB|3|3L|3R|4|4L|4R)$/.test(s)) return "CB";
  if (/^(RB|RWB|2)$/.test(s)) return "RB";
  if (/^(LB|LWB|5)$/.test(s)) return "LB";
  if (/^(DM|CDM|6|6L|6R)$/.test(s)) return "DM";
  if (/^(CM|RCM|LCM|8|8L|8R)$/.test(s)) return "CM";
  if (/^(AM|CAM|10)$/.test(s)) return "AM";
  if (/^(RW|RM|7|11R)$/.test(s)) return "RW";
  if (/^(LW|LM|11|11L)$/.test(s)) return "LW";
  if (/^(ST|CF|9)$/.test(s)) return "ST";
  return "CM";
};

const footFit = (slot: string, playerFoot: any): number => {
  const sf = String(slot || "").toUpperCase();
  const pf = normFoot(playerFoot);
  if (!pf) return 1;
  if (pf === "B") return 1;

  const isLeftSide = /(L|LB|LWB|11L|3L|4L|6L|8L|LM|LCB|LCM|LDM|LAM)/.test(sf);
  const isRightSide = /(R|RB|RWB|11R|3R|4R|6R|8R|RM|RCB|RCM|RDM|RAM)/.test(sf);

  // Fullbacks: same-foot preferred; Wingers: slight preference for inverted
  if (/RB|RWB|LB|LWB/.test(sf)) {
    if ((isLeftSide && pf === "L") || (isRightSide && pf === "R")) return 1;
    return 0.9;
  }
  if (/11L|11R|7|RW|LW|RM|LM/.test(sf)) {
    if ((isLeftSide && pf === "R") || (isRightSide && pf === "L")) return 1;
    return 0.95;
  }
  return 1;
};

// ---------- core pieces ----------

// Legacy matchup signal, centered at 0 (negative = advantage for us)
const coreMatchupCost = (me: any, opp: any): number => {
  if (!opp) return 0.0;

  const qMe = norm100(getQ(me));
  const qOp = norm100(getQ(opp));

  const paceMe = norm100(me?.speed ?? me?.pace ?? 0);
  const paceOp = norm100(opp?.speed ?? opp?.pace ?? 0);

  const airMe = clamp01(norm100(me?.aerial ?? 0) * 0.6 + norm100(me?.jumping ?? 0) * 0.4);
  const airOp = clamp01(norm100(opp?.aerial ?? 0) * 0.6 + norm100(opp?.jumping ?? 0) * 0.4);

  const staMe = norm100(me?.stamina ?? 0);
  const staOp = norm100(opp?.stamina ?? 0);

  let c = 0.0;
  c -= 0.35 * (qMe - qOp);
  c -= 0.20 * (paceMe - paceOp);
  c -= 0.15 * (airMe - airOp);
  c -= 0.10 * (staMe - staOp);

  return c;
};

// Penalty (>=0) for playing away from natural family
const rolePenalty = (nativeRole: string, targetRole: string, nativeSlot: string, targetSlot: string): number => {
  if (nativeRole === targetRole) return 0;

  const famN = roleSubfamilyFromSlot(nativeSlot);
  const famT = roleSubfamilyFromSlot(targetSlot);

  const friendly = new Set([
    "LB->CB", "RB->CB", "CB->LB", "CB->RB",
    "CM->DM", "AM->CM", "CM->AM",
    "LW->ST", "RW->ST", "ST->LW", "ST->RW",
  ]);

  const key = `${famN}->${famT}`;
  if (friendly.has(key)) return 0.15;

  const hostile = new Set([
    "CB->AM", "CB->ST", "ST->CB", "LW->CB", "RW->CB",
    "DM->ST", "ST->DM", "LB->ST", "RB->ST",
  ]);
  if (hostile.has(key)) return 0.45;

  return 0.3;
};

// Small multiplicative nudge by role (kept tight)
const formationMult = (myForm: string, oppForm: string, myRole: string): number => {
  const base: Record<string, number> = {
    GK: 1.0, CB: 1.0, LB: 1.0, RB: 1.0, DM: 1.0, CM: 1.0, AM: 1.0, LW: 1.0, RW: 1.0, ST: 1.0,
  };
  const r = base[myRole] ?? 1.0;
  return Math.max(0.9, Math.min(1.1, r));
};

// Opponent insights to bias advanced fit cost
// Returns { mul, shift } so that weakness ALWAYS helps us (more negative).
const oppBias = (targetSlot: string, insights: any = {}): { mul: number; shift: number } => {
  const fam = roleSubfamilyFromSlot(targetSlot);
  const mid = 50;
  const delta = (v: any) => (asNumber(v, mid) - mid) / 50; // -1..+1, positive => weaker

  let mul = 1.0;
  let shift = 0.0;

  if (fam === "ST" || fam === "LW" || fam === "RW") {
    // Weak backline => reduce cost via negative shift
    shift += -0.05 * delta(insights.backlinePace);
    shift += -0.03 * delta(insights.backlineAerial);
  } else if (fam === "CM" || fam === "DM" || fam === "AM") {
    // Weak midfield => reduce cost via negative shift
    shift += -0.04 * delta(insights.midfieldStamina);
    shift += -0.03 * delta(insights.midfieldPressRes);
  }
  return { mul, shift };
};

// Role-specific fit score 0..1 (higher = better fit)
const advancedFit = (player: any, targetSlot: string): number => {
  const fam = roleSubfamilyFromSlot(targetSlot);

  const WeightMap: Record<string, Record<string, number>> = {
    GK: { reflexes: 0.35, handling: 0.25, positioning: 0.20, passing: 0.20 },
    CB: { tackling: 0.30, strength: 0.20, aerial: 0.20, positioning: 0.15, pace: 0.15 },
    LB: { pace: 0.25, tackling: 0.25, stamina: 0.20, crossing: 0.15, passing: 0.15 },
    RB: { pace: 0.25, tackling: 0.25, stamina: 0.20, crossing: 0.15, passing: 0.15 },
    DM: { tackling: 0.28, positioning: 0.22, stamina: 0.20, passing: 0.20, strength: 0.10 },
    CM: { passing: 0.28, stamina: 0.18, vision: 0.18, tackling: 0.18, firstTouch: 0.18 },
    AM: { vision: 0.28, passing: 0.22, firstTouch: 0.20, offBall: 0.15, finishing: 0.15 },
    LW: { pace: 0.28, dribbling: 0.22, crossing: 0.18, firstTouch: 0.16, finishing: 0.16 },
    RW: { pace: 0.28, dribbling: 0.22, crossing: 0.18, firstTouch: 0.16, finishing: 0.16 },
    ST: { finishing: 0.32, offBall: 0.22, heading: 0.18, firstTouch: 0.14, pace: 0.14 },
  };

  const W = WeightMap[fam] || { passing: 1.0 };

  const P: Record<string, number> = {
    pace: norm100(player?.speed ?? player?.pace ?? 0),
    stamina: norm100(player?.stamina ?? 0),
    strength: norm100(player?.strength ?? 0),
    aerial: clamp01(norm100(player?.aerial ?? 0) * 0.6 + norm100(player?.jumping ?? 0) * 0.4),
    heading: norm100(player?.heading ?? 0),
    tackling: norm100(player?.tackling ?? 0),
    passing: norm100(player?.passing ?? 0),
    vision: norm100(player?.vision ?? 0),
    firstTouch: norm100(player?.firstTouch ?? 0),
    finishing: norm100(player?.finishing ?? 0),
    positioning: norm100(player?.positioning ?? 0),
    offBall: norm100(player?.offBall ?? 0),
    dribbling: norm100(player?.dribbling ?? 0),
    crossing: norm100(player?.crossing ?? 0),
    reflexes: norm100(player?.reflexes ?? 0),
    handling: norm100(player?.handling ?? 0),
  };

  let s = 0, w = 0;
  for (const k in W) {
    const v = P[k] ?? 0;
    s += v * W[k]; w += W[k];
  }
  if (!w) return 0;

  // Foot fit multiplier
  s *= footFit(targetSlot, player.preferredFoot);

  return clamp01(s / w);
};

// ---------- PUBLIC API ----------
export const calculatePlayerPositionCost = (
  player: any,
  targetPosCode: string,        // e.g., "11L", "RB", "ST"
  oppAtSlot: any,            // opponent player object or null
  myFormation = "4-3-3",
  oppFormation = "4-3-3",
  oppInsights: any = {},     // insights on 0..100 scale
  options: any = {}
): number => {
  const { debug = false, overrideWeights, disableOppBias = false } = options || {};
  const ADV_W = (overrideWeights && typeof overrideWeights.ADV_W === "number")
    ? overrideWeights.ADV_W
    : 0.7;

  const nativeRole = getRoleFromSlot(player.position);
  const myTargetRole = getRoleFromSlot(targetPosCode);

  // Legacy piece (centered at 0; negative = good for us)
  const old = coreMatchupCost(player, oppAtSlot);

  // Advanced piece (centered at 0 via 0.5 - fit)
  const fit = advancedFit(player, targetPosCode);
  const advPre = (0.5 - fit);

  // Opponent bias: multiplicative + additive (weakness should make cost more negative)
  const { mul: bMul, shift: bShift } = disableOppBias
    ? { mul: 1.0, shift: 0.0 }
    : oppBias(targetPosCode, oppInsights);

  let advCost = advPre * bMul + bShift;

  // Role mismatch penalty (>= 0)
  const pen = rolePenalty(nativeRole, myTargetRole, player.position, targetPosCode);

  // Formation multiplier (≈1.0)
  const mult = formationMult(myFormation, oppFormation, myTargetRole);

  // Blend and apply multiplier
  const blended = ((1 - ADV_W) * old + ADV_W * advCost + pen);
  const cost = blended * mult;

  // Only cap the upper extreme; keep negatives as-is
  const clamped = Math.min(2.5, cost);

  return clamped;
};