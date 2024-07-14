
const fields = foundry.data.fields;

export default function pannels() {
    return {
        vitriolIsOpen:  new fields.BooleanField({ initial: false}),
        rebisIsOpen:  new fields.BooleanField({ initial: false}),
        aetherIsOpen:  new fields.BooleanField({ initial: false}),
        quebrithIsOpen:  new fields.BooleanField({ initial: false}),
        hydragenumIsOpen:  new fields.BooleanField({ initial: false}),
        vermilionIsOpen:  new fields.BooleanField({ initial: false}),
        solIsOpen:  new fields.BooleanField({ initial: false}),
        caelumIsOpen:  new fields.BooleanField({ initial: false}),
        fulgurIsOpen:  new fields.BooleanField({ initial: false}),

        noviceSpellIsOpen:  new fields.BooleanField({ initial: false}),
        journeymanSpellIsOpen:  new fields.BooleanField({ initial: false}),
        masterSpellIsOpen:  new fields.BooleanField({ initial: false}),
        ritualIsOpen:  new fields.BooleanField({ initial: false}),
        hexIsOpen:  new fields.BooleanField({ initial: false}),
        magicalgiftIsOpen:  new fields.BooleanField({ initial: false}),

        intIsOpen:  new fields.BooleanField({ initial: false}),
        refIsOpen:  new fields.BooleanField({ initial: false}),
        dexIsOpen:  new fields.BooleanField({ initial: false}),
        bodyIsOpen:  new fields.BooleanField({ initial: false}),
        empIsOpen:  new fields.BooleanField({ initial: false}),
        craIsOpen:  new fields.BooleanField({ initial: false}),
        willIsOpen:  new fields.BooleanField({ initial: false}),
    }
  }