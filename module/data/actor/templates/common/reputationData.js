import stat from './stats/statData.js';

export default class Reputation extends foundry.abstract.DataModel {
    static defineSchema() {
        return stat('WITCHER.Actor.DerStat.Rep');
    }

    prepareBaseData() {
        this.max = this.unmodifiedMax;
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.unmodifiedMax == 0) {
            source.unmodifiedMax = source.max;
        }

        return super.migrateData(source);
    }
}
