import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function ref() {
    return {
        brawling: new fields.SchemaField(skill("WITCHER.SkRefBrawling")),
        dodge: new fields.SchemaField(skill("WITCHER.SkRefDodge")),
        melee: new fields.SchemaField(skill("WITCHER.SkRefMelee")),
        riding: new fields.SchemaField(skill("WITCHER.SkRefRiding")),
        sailing: new fields.SchemaField(skill("WITCHER.SkRefSailing")),
        smallblades: new fields.SchemaField(skill("WITCHER.SkRefSmall")),
        staffspear: new fields.SchemaField(skill("WITCHER.SkRefStaff")),
        swordsmanship: new fields.SchemaField(skill("WITCHER.SkRefSwordsmanship")),
    };
  }