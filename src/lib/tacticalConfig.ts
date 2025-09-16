// tacticalConfig.ts
// Centralized tuning knobs for tactical analysis and matchup weighting.

export const TACTICAL_CONFIG = {
  // Relative importance when aggregating category scores for suggestions
  suggestionWeights: {
    wings:    1.0,  // pace/1v1 advantages on flanks
    midfield: 1.2,  // control & stamina are very valuable
    aerial:   0.8,  // depends on style
    defense:  1.4,  // risks must be respected
    creation: 1.0   // chance creation / final third quality
  },

  // How strongly to scale different attribute gaps when forming category scores
  // (used as multipliers in analyzeMatchups)
  deltaImpact: {
    speed:    0.9,
    agility:  0.8,
    stamina:  0.7,
    strength: 0.8,
    jumping:  0.8,
    quality:  0.6
  },

  // Thresholds for saying "this gap matters" in *normalized* (0–1) terms.
  // Example: FAST = 0.12 means a 12-point gap on a 0–100 scale is notable.
  thresholds: {
    fast: 0.12,
    str:  0.10,
    air:  0.10,
    stam: 0.12,
    qual: 0.10
  },

  // Team-level absolute thresholds (0–100 metrics) for high-level suggestions.
  // These mirror your previous hard-coded values so UX doesn't change.
  teamThresholds: {
    backlinePaceMax:      70, // "slow backline"
    backlineAerialMax:    65, // "weak aerially"
    midfieldStaminaMax:   70, // "low stamina"
    midfieldPressMax:     65, // "low pressing threat" (tackling+positioning proxy)
    attackSpeedMin:       85, // "very fast attack"
    attackFinishingMin:   85  // "elite finishing"
  }
};