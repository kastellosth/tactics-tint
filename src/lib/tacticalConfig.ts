// Default tactical configuration - can be customized per team/match
export const TACTICAL_CONFIG = {
  // Thresholds for individual matchup detection (0-1 scale)
  thresholds: {
    fast: 0.12,    // pace/agility edge threshold
    air: 0.10,     // aerial ability edge threshold
    qual: 0.10,    // technical quality edge threshold
    str: 0.10,     // strength edge threshold
    stam: 0.12,    // stamina edge threshold
  },

  // Team-level analysis thresholds (0-100 scale)
  teamThresholds: {
    backlinePaceMax: 70,       // below this = slow defense
    backlineAerialMax: 65,     // below this = weak aerially
    midfieldStaminaMax: 70,    // below this = low endurance
    midfieldPressMax: 65,      // below this = poor pressing
    attackSpeedMin: 85,        // above this = dangerous pace
    attackFinishingMin: 85,    // above this = clinical finishing
  },

  // Impact multipliers for different stat categories
  deltaImpact: {
    speed: 1.2,     // speed advantages matter more
    stamina: 1.0,   // standard impact
    jumping: 0.9,   // aerial slightly less impactful
    quality: 1.1,   // technical quality important
  },

  // Category weights for final suggestions
  suggestionWeights: {
    wings: 1.2,     // wing play emphasis
    midfield: 1.0,  // standard midfield
    aerial: 0.9,    // aerial less critical
    defense: 1.0,   // standard defense
    creation: 1.1,  // creativity valued
  }
};