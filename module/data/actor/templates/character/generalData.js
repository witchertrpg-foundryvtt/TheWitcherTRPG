
import valueLabel from "../valueLabelData.js";
import background from "./general/backgroundData.js";
import details from "./general/detailsData.js";
import homeland from "./general/homelandData.js";
import lifeEvents from "./general/lifeEventsData.js";

const fields = foundry.data.fields;

export default function general() {
    return {
        background: new fields.SchemaField(background()),
        details: new fields.SchemaField(details()),
        homeland: new fields.SchemaField(homeland()),
        reputation: new fields.SchemaField(valueLabel("WITCHER.Reputation")),
        socialStanding:  new fields.StringField({ initial: ''}),
        name:  new fields.StringField({ initial: ''}),
        race:  new fields.StringField({ initial: ''}),
        age:  new fields.NumberField({ initial: 0}),
        lifeEvents: new fields.SchemaField(lifeEvents()),
    }
  }