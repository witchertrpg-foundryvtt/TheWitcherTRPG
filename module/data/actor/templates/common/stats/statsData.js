import stat from "./statData.js"

const fields = foundry.data.fields;

export default function stats() {
    return {
        int: new fields.SchemaField(stat("WITCHER.Actor.Stat.Int")),
        ref: new fields.SchemaField(stat("WITCHER.Actor.Stat.Ref")),
        dex: new fields.SchemaField(stat("WITCHER.Actor.Stat.Dex")),
        body: new fields.SchemaField(stat("WITCHER.Actor.Stat.Body")),
        spd: new fields.SchemaField(stat("WITCHER.Actor.Stat.Spd")),
        emp: new fields.SchemaField(stat("WITCHER.Actor.Stat.Emp")),
        cra: new fields.SchemaField(stat("WITCHER.Actor.Stat.Cra")),
        will: new fields.SchemaField(stat("WITCHER.Actor.Stat.Will")),
        luck: new fields.SchemaField(stat("WITCHER.Actor.Stat.Luck")),
        toxicity: new fields.SchemaField(stat('WITCHER.Actor.Stat.Toxicity')),
    };
  }