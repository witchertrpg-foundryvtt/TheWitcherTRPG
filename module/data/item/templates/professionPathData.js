import professionSkill from "./professionSkillData.js";

const fields = foundry.data.fields;

export default function professionPath() {
    return {
        pathName: new fields.StringField({ initial: ""}),
        skill1: new fields.SchemaField(professionSkill()),
        skill2: new fields.SchemaField(professionSkill()),
        skill3: new fields.SchemaField(professionSkill()),
    };
  }