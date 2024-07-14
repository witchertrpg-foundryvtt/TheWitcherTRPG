import coreStats from "./templates/common/stats/coreStatsData.js";
import critWound from "./templates/common/critWoundData.js";
import currency from "./templates/common/currencyData.js"
import derivedStats from "./templates/common/stats/derivedStatsData.js";
import reputation from "./templates/common/reputationData.js";
import stats from "./templates/common/stats/statsData.js";
import adrenaline from "./templates/common/adrenalineData.js";
import skills from "./templates/common/skills/skillsData.js";
import focus from "./templates/common/focusData.js";
import note from "./templates/common/noteData.js";
import attackStats from "./templates/character/attackStatsData.js";
import pannels from "./templates/character/pannelsData.js";

const fields = foundry.data.fields;

export default class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      currency: new fields.SchemaField(currency()),
      woundTresholdApplied: new fields.BooleanField({ initial: false }),
      deathStateApplied: new fields.BooleanField({ initial: false }),
      deathSaves: new fields.NumberField({ initial: 0 }),
      critWounds: new fields.ArrayField(new fields.SchemaField(critWound())),

      stats: new fields.SchemaField(stats()),
      coreStats: new fields.SchemaField(coreStats()),
      derivedStats: new fields.SchemaField(derivedStats()),

      reputation: new fields.SchemaField(reputation()),
      adrenaline: new fields.SchemaField(adrenaline()),

      skills: new fields.SchemaField(skills()),
      attackStats: new fields.SchemaField(attackStats()),

      focus1: new fields.SchemaField(focus()),
      focus2: new fields.SchemaField(focus()),
      focus3: new fields.SchemaField(focus()),
      focus4: new fields.SchemaField(focus()),

      notes: new fields.ArrayField(new fields.SchemaField(note())),
      pannels: new fields.SchemaField(pannels()),
    }
  }

  /** @inheritdoc */
  static migrateData(source) {
    super.migrateData(source);
    if (source.derivedStats?.vigor?.unmodifiedMax == 0) {
      source.derivedStats.vigor.unmodifiedMax = source.derivedStats.vigor.value
    }
  }
}