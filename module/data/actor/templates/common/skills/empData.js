import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function emp() {
    return {
        charisma: new fields.SchemaField(skill("WITCHER.SkEmpCharisma")),
        deceit: new fields.SchemaField(skill("WITCHER.SkEmpDeceit")),
        finearts: new fields.SchemaField(skill("WITCHER.SkEmpArts")),
        gambling: new fields.SchemaField(skill("WITCHER.SkEmpGambling")),
        grooming: new fields.SchemaField(skill("WITCHER.SkEmpGrooming")),
        perception: new fields.SchemaField(skill("WITCHER.SkEmpHumanPerc")),
        leadership: new fields.SchemaField(skill("WITCHER.SkEmpLeadership")),
        persuasion: new fields.SchemaField(skill("WITCHER.SkEmpPersuasion")),
        performance: new fields.SchemaField(skill("WITCHER.SkEmpPerformance")),
        seduction: new fields.SchemaField(skill("WITCHER.SkEmpSeduction")),
    };
  }