import coreStats from './templates/common/stats/coreStatsData.js';
import critWound from './templates/common/critWoundData.js';
import currency from './templates/common/currencyData.js';
import derivedStats from './templates/common/stats/derivedStatsData.js';
import reputation from './templates/common/reputationData.js';
import stats from './templates/common/stats/statsData.js';
import adrenaline from './templates/common/adrenalineData.js';
import skills from './templates/common/skills/skillsData.js';
import focus from './templates/common/focusData.js';
import note from './templates/common/noteData.js';
import attackStats from './templates/character/attackStatsData.js';
import pannels from './templates/character/pannelsData.js';
import specialSkillModifier from './templates/character/specialSkillModifierData.js';
import lifepathData from './templates/common/lifepathData.js';
import damageTypeModification from './templates/character/general/damage/damageTypeModificationData.js';

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
            damageTypeModification: new fields.SchemaField(damageTypeModification()),

            focus1: new fields.SchemaField(focus()),
            focus2: new fields.SchemaField(focus()),
            focus3: new fields.SchemaField(focus()),
            focus4: new fields.SchemaField(focus()),

            notes: new fields.ArrayField(new fields.SchemaField(note())),
            pannels: new fields.SchemaField(pannels()),

            lifepathModifiers: new fields.SchemaField(lifepathData())
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);
        if (source.derivedStats?.vigor?.unmodifiedMax == 0) {
            source.derivedStats.vigor.unmodifiedMax = source.derivedStats.vigor.value;
        }

        this.migrateCalculatedStats(source);
    }

    static migrateCalculatedStats(source) {
        if (source?.attackStats?.meleeBonus) source.attackStats.meleeBonus = 0;

        if (source?.stats?.int?.totalModifiers) source.stats.int.totalModifiers = 0;
        if (source?.stats?.ref?.totalModifiers) source.stats.ref.totalModifiers = 0;
        if (source?.stats?.dex?.totalModifiers) source.stats.dex.totalModifiers = 0;
        if (source?.stats?.body?.totalModifiers) source.stats.body.totalModifiers = 0;
        if (source?.stats?.spd?.totalModifiers) source.stats.spd.totalModifiers = 0;
        if (source?.stats?.emp?.totalModifiers) source.stats.emp.totalModifiers = 0;
        if (source?.stats?.cra?.totalModifiers) source.stats.cra.totalModifiers = 0;
        if (source?.stats?.will?.totalModifiers) source.stats.will.totalModifiers = 0;
        if (source?.stats?.luck?.totalModifiers) source.stats.luck.totalModifiers = 0;

        if (source?.coreStats?.stun?.totalModifiers) source.coreStats.stun.totalModifiers = 0;
        if (source?.coreStats?.enc?.totalModifiers) source.coreStats.enc.totalModifiers = 0;
        if (source?.coreStats?.run?.totalModifiers) source.coreStats.run.totalModifiers = 0;
        if (source?.coreStats?.leap?.totalModifiers) source.coreStats.leap.totalModifiers = 0;
        if (source?.coreStats?.rec?.totalModifiers) source.coreStats.rec.totalModifiers = 0;
        if (source?.coreStats?.woundTreshold?.totalModifiers) source.coreStats.woundTreshold.totalModifiers = 0;
    }
}
