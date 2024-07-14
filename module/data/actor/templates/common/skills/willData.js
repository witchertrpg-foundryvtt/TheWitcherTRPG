import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function will() {
    return {
        courage: new fields.SchemaField(skill("WITCHER.SkWillCourage")),
        hexweave: new fields.SchemaField(skill("WITCHER.SkWillHex")),
        intimidation: new fields.SchemaField(skill("WITCHER.SkWillIntim")),
        spellcast: new fields.SchemaField(skill("WITCHER.SkWillSpellcast")),
        resistmagic: new fields.SchemaField(skill("WITCHER.SkWillResistMag")),
        resistcoerc: new fields.SchemaField(skill("WITCHER.SkWillResistCoer")),
        ritcraft: new fields.SchemaField(skill("WITCHER.SkWillRitCraft")),
    };
  }