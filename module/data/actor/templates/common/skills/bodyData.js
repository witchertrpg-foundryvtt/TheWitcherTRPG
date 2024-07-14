import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function body() {
    return {
        physique: new fields.SchemaField(skill("WITCHER.SkBodyPhys")),
        endurance: new fields.SchemaField(skill("WITCHER.SkBodyEnd")),
    };
  }