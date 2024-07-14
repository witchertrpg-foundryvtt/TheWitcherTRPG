import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function int() {
    return {
        awareness: new fields.SchemaField(skill("WITCHER.SkIntAwareness")),
        business: new fields.SchemaField(skill("WITCHER.SkIntBusiness")),
        deduction: new fields.SchemaField(skill("WITCHER.SkIntDeduction")),
        education: new fields.SchemaField(skill("WITCHER.SkIntEducation")),
        commonsp: new fields.SchemaField(skill("WITCHER.SkIntCommon")),
        eldersp: new fields.SchemaField(skill("WITCHER.SkIntElder")),
        dwarven: new fields.SchemaField(skill("WITCHER.SkIntDwarven")),
        monster: new fields.SchemaField(skill("WITCHER.SkIntMonster")),
        socialetq: new fields.SchemaField(skill("WITCHER.SkIntSocialEt")),
        streetwise: new fields.SchemaField(skill("WITCHER.SkIntStreet")),
        tactics: new fields.SchemaField(skill("WITCHER.SkIntTactics")),
        teaching: new fields.SchemaField(skill("WITCHER.SkIntTeaching")),
        wilderness: new fields.SchemaField(skill("WITCHER.SkIntWilderness")),
    };
  }