// ===== 人物关系系统 =====

class RelationshipSystem {
  constructor(game) {
    this.game = game;
  }

  getRelationshipLabel(charId) {
    const charsData = window.CharactersData || {};
    const charData = charsData[charId];
    const value = this.game.getRelationship(charId);
    if (!charData || !charData.relationshipThresholds) {
      return this.defaultLabel(value);
    }

    const thresholds = Object.keys(charData.relationshipThresholds)
      .map(Number)
      .sort((a, b) => b - a);
    for (const t of thresholds) {
      if (value >= t) return charData.relationshipThresholds[t];
    }
    return this.defaultLabel(value);
  }

  defaultLabel(value) {
    if (value >= 60) return '亲密';
    if (value >= 30) return '友好';
    if (value >= 0) return '中立';
    if (value >= -30) return '冷淡';
    return '敌意';
  }
}
