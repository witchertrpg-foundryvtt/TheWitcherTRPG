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
}
