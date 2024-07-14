import body from "./bodyData.js";
import cra from "./craData.js";
import dex from "./dexData.js";
import emp from "./empData.js";
import int from "./intData.js";
import ref from "./refData.js";
import will from "./willData.js";

const fields = foundry.data.fields;

export default function skills() {
    return {
        int: new fields.SchemaField(int()),
        ref: new fields.SchemaField(ref()),
        dex: new fields.SchemaField(dex()),
        body: new fields.SchemaField(body()),
        emp: new fields.SchemaField(emp()),
        cra: new fields.SchemaField(cra()),
        will: new fields.SchemaField(will()),
    };
  }