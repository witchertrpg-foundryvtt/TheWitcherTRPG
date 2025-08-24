import currency from './templates/common/currencyData.js';

const fields = foundry.data.fields;

export default class LootData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            maxWeight: new fields.NumberField({ initial: 0 }),
            description: new fields.StringField({ initial: '' }),
            currency: new fields.SchemaField(currency())
        };
    }

    calcCurrencyWeight() {
        let totalPieces =
            Number(this.currency.bizant) +
            Number(this.currency.ducat) +
            Number(this.currency.lintar) +
            Number(this.currency.floren) +
            Number(this.currency.crown) +
            Number(this.currency.oren) +
            Number(this.currency.falsecoin);
        return Number(totalPieces * 0.001);
    }
}
