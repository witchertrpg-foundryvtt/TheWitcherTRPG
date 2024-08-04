// @ts-check
export var RollConfig = (function () {
    class RollConfig {
        constructor(options = {
            showResult: true
        }) {
            this.defense = false;
            this.threshold = -1;
            this.showCrit = true;
            this.showSuccess = true;
            this.showResult = options.showResult;
            this.reversal = false;
            this.thresholdDesc = "";
            this.messageOnSuccess = "";
            this.messageOnFailure = "";
            this.flagsOnSuccess = "";
            this.flagsOnFailure = "";
        }
    }
    return RollConfig;
})();
