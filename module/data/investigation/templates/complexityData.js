const fields = foundry.data.fields;

export default function complexity(){
    return {
      complexity: new fields.NumberField({initial: 25}),
      difficulty: new fields.StringField({ initial: 'Easy'}),
    }
}