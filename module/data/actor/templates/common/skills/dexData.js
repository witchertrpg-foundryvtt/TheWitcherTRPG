import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function dex() {
    return {
        archery: new fields.SchemaField(skill("WITCHER.SkDexArchery")),
        athletics: new fields.SchemaField(skill("WITCHER.SkDexAthletics")),
        crossbow: new fields.SchemaField(skill("WITCHER.SkDexCrossbow")),
        sleight: new fields.SchemaField(skill("WITCHER.SkDexSleight")),
        stealth: new fields.SchemaField(skill("WITCHER.SkDexStealth")),
    };
  }