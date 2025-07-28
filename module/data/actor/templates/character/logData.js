import currencyLog from './currencyLogData.js';
import ipLog from './ipLogData.js';

const fields = foundry.data.fields;

export default class Log extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            ipLog: new fields.ArrayField(new fields.SchemaField(ipLog())),
            currencyLog: new fields.ArrayField(new fields.SchemaField(currencyLog()))
        };
    }

    addIpReward(label, ip, isMagic) {
        this.ipLog.push({ label: label, ip: ip, isMagic: isMagic });
        if (!isMagic) {
            this.parent.parent.update({
                'system.logs.ipLog': this.ipLog,
                'system.improvementPoints': this.parent.improvementPoints + ip
            });
        }

        if (isMagic) {
            this.parent.parent.update({
                'system.logs.ipLog': this.ipLog,
                'system.magic.magicImprovementPoints': this.parent.magic.magicImprovementPoints + ip
            });
        }
    }
}
