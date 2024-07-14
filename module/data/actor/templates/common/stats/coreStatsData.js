import stat from "./statData.js"

const fields = foundry.data.fields;

export default function coreStats() {
    return {
        stun: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.Stun")),
        run: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.Run")),
        leap: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.Leap")),
        enc: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.Enc")),
        rec: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.Rec")),
        woundTreshold: new fields.SchemaField(stat("WITCHER.Actor.CoreStat.woundTreshold")),
    };
  }