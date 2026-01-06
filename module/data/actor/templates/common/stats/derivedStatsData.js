import stat from './statData.js';

const fields = foundry.data.fields;

export default class DerivedStats extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            hp: new fields.SchemaField(stat('WITCHER.Actor.DerStat.HP')),
            shield: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Shield')),
            sta: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Sta')),
            resolve: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Resolve')),
            focus: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Focus')),
            vigor: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Vigor')),

            stun: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Stun')),
            run: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Run')),
            leap: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Leap')),
            enc: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Enc')),
            rec: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Rec')),
            woundTreshold: new fields.SchemaField(stat('WITCHER.Actor.DerStat.woundTreshold'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.stun?.unmodifiedMax == 0) {
            source.stun.unmodifiedMax = source.stun.max;
        }
        if (source.run?.unmodifiedMax == 0) {
            source.run.unmodifiedMax = source.run.max;
        }
        if (source.leap?.unmodifiedMax == 0) {
            source.leap.unmodifiedMax = source.leap.max;
        }
        if (source.enc?.unmodifiedMax == 0) {
            source.enc.unmodifiedMax = source.enc.max;
        }
        if (source.woundTreshold?.unmodifiedMax == 0) {
            source.woundTreshold.unmodifiedMax = source.woundTreshold.max;
        }
        if (source.vigor?.unmodifiedMax == 0) {
            source.vigor.unmodifiedMax = source.vigor.max;
        }

        return super.migrateData(source);
    }
}
