import derivedStat from "./derivedStatData.js";

const fields = foundry.data.fields;

export default function derivedStats() {
    return {
        hp: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.HP")),
        shield: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.Shield")),
        sta: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.Sta")),
        resolve: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.Resolve")),
        focus: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.Focus")),
        vigor: new fields.SchemaField(derivedStat("WITCHER.Actor.DerStat.Vigor")),
        modifiersIsOpened: new fields.BooleanField({initial: false}),
    };
  }