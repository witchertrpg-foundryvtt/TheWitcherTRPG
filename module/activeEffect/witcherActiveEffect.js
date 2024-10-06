export default class WitcherActiveEffect extends ActiveEffect {
    get isSuppressed() {
        if (this.parent.system.isActive === false) return true;
        if (this.parent.system.equipped === false) return true;
        return false;
    }
}
