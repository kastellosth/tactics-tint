// costFunction.ts - Advanced cost calculation with opponent insights
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
  if (s === "1" || s === "GK") return "GK";
  if (/^(CB|RCB|LCB|3|3L|3R|4|4L|4R)$/.test(s)) return "CB";
  if (/^(RB|RWB|2R?)$/.test(s)) return "RB";
  if (/^(LB|LWB|2L?)$/.test(s)) return "LB";
  if (/^(DM|CDM|6|6L|6R)$/.test(s)) return "DM";
  if (/^(CM|RCM|LCM|8|8L|8R)$/.test(s)) return "CM";
  if (/^(AM|CAM|10)$/.test(s)) return "AM";
  if (/^(RW|RM|7|11R)$/.test(s)) return "RW";
  if (/^(LW|LM|11|11L)$/.test(s)) return "LW";
  if (/^(ST|CF|9)$/.test(s)) return "ST";
  return "CM";
};

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

  return clamp01(s / w);
};

// ---------- PUBLIC API ----------
export const calculatePlayerPositionCost = (
  player: any,
  targetPosCode: string,
  oppAtSlot: any,
  myFormation = "4-3-3",
  oppFormation = "4-3-3",
  oppInsights: any = {},
  options: any = {}
): number => {
  const ADV_W = 0.7;

  const nativeRole = getRoleFromSlot(player.position);
  const myTargetRole = getRoleFromSlot(targetPosCode);

  // Legacy piece (centered at 0; negative = good for us)
  const old = coreMatchupCost(player, oppAtSlot);

  // Advanced piece (centered at 0 via 0.5 - fit)
  const fit = advancedFit(player, targetPosCode);
  const advPre = (0.5 - fit);

  // Simple role mismatch penalty
  const pen = nativeRole === myTargetRole ? 0 : 0.3;

  // Blend 
  const blended = ((1 - ADV_W) * old + ADV_W * advPre + pen);

  // Only cap the upper extreme; keep negatives as-is
  const clamped = Math.min(2.5, blended);

  return clamped;
};
