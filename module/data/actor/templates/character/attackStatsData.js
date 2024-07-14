import attack from "./attackData.js";

const fields = foundry.data.fields;

export default function attackStats() {
    return {
        meleeBonus:  new fields.StringField({ initial: ''}),
        punch: new fields.SchemaField(attack( "WITCHER.Actor.DerStat.Punch")),
        kick: new fields.SchemaField(attack( "WITCHER.Actor.DerStat.Kick")),
    }
  }