import stat from './stats/statData.js';

export default class Reputation extends foundry.abstract.DataModel {
    static defineSchema() {
        return stat('WITCHER.Actor.DerStat.Rep');
    }
}
