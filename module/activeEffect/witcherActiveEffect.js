export default class WitcherActiveEffect extends ActiveEffect {
    get isSuppressed() {
        if (
            this.parent.system.isActive === false ||
            this.parent.system.equipped === false ||
            this.system.applySelf === true ||
            this.system.applyOnHit === true ||
            this.system.applyOnDamage === true
        )
            return true;

        return false;
    }
}
