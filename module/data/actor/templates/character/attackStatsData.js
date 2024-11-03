import attack from './attackData.js';

const fields = foundry.data.fields;

export default function attackStats() {
    return {
        meleeBonus: new fields.NumberField({ initial: 0 }),
        punch: new fields.SchemaField(attack('WITCHER.Actor.DerStat.Punch')),
        kick: new fields.SchemaField(attack('WITCHER.Actor.DerStat.Kick')),
        critLocationModifier: new fields.NumberField({ initial: 0 }),
        critEffectModifier: new fields.NumberField({ initial: 0 })
    };
}
