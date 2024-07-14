import lifeEvent from "./lifeEventData.js";

const fields = foundry.data.fields;

export default function lifeEvents() {
    return {
        10:  new fields.SchemaField(lifeEvent(1)),
        20:  new fields.SchemaField(lifeEvent(2)),
        30:  new fields.SchemaField(lifeEvent(3)),
        40:  new fields.SchemaField(lifeEvent(4)),
        50:  new fields.SchemaField(lifeEvent(5)),
        60:  new fields.SchemaField(lifeEvent(6)),
        70:  new fields.SchemaField(lifeEvent(7)),
        80:  new fields.SchemaField(lifeEvent(8)),
        90:  new fields.SchemaField(lifeEvent(9)),
        100:  new fields.SchemaField(lifeEvent(10)),
        110:  new fields.SchemaField(lifeEvent(11)),
        120:  new fields.SchemaField(lifeEvent(12)),
        130:  new fields.SchemaField(lifeEvent(13)),
        140:  new fields.SchemaField(lifeEvent(14)),
        150:  new fields.SchemaField(lifeEvent(15)),
        160:  new fields.SchemaField(lifeEvent(16)),
        170:  new fields.SchemaField(lifeEvent(17)),
        180:  new fields.SchemaField(lifeEvent(18)),
        190:  new fields.SchemaField(lifeEvent(19)),
        200:  new fields.SchemaField(lifeEvent(20)),
        
    }
  }