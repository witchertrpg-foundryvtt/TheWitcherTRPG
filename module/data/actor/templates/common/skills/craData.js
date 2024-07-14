import skill from "./skillData.js";

const fields = foundry.data.fields;

export default function cra() {
    return {
        alchemy: new fields.SchemaField(skill("WITCHER.SkCraAlchemy")),
        crafting: new fields.SchemaField(skill("WITCHER.SkCraCrafting")),
        disguise: new fields.SchemaField(skill("WITCHER.SkCraDisguise")),
        firstaid: new fields.SchemaField(skill("WITCHER.SkCraAid")),
        forgery: new fields.SchemaField(skill("WITCHER.SkCraForge")),
        picklock: new fields.SchemaField(skill("WITCHER.SkCraPick")),
        trapcraft: new fields.SchemaField(skill("WITCHER.SkCraTrapCraft")),
    };
  }