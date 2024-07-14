import CommonItemData from "./commonItemData.js";

const fields = foundry.data.fields;

export default class ContainerData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      carry: new fields.NumberField({ initial: 0 }),
      storedWeight: new fields.NumberField({ initial: 0 }),
      content: new fields.ArrayField(new fields.StringField())
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    let content = this.content;
    this.storedWeight = 0;

    if (content) {
      this.itemContent = []
      content.forEach(itemId => {
        let item = fromUuidSync(itemId);
        this.storedWeight += item.system.quantity * item.system.weight
        this.itemContent.push({
          name: item.name,
          quantity: item.system.quantity,
          weight: item.system.weight,
          description: item.system.description,
          uuid: itemId,
        })
      });
    }
  }
}