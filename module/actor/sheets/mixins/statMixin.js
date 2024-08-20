import { extendedRoll } from "../../../scripts/rolls/extendedRoll.js";
import { RollConfig } from "../../../scripts/rollConfig.js";

export let statMixin = {

    _onStatModifierDisplay(event) {
        event.preventDefault();
        let stat = event.currentTarget.closest(".stat-display").dataset.stat;

        if (stat == "reputation") {
            this.actor.update({ [`system.${stat}.isOpened`]: !this.actor.system[stat].isOpened });
        }
        else {
            this.actor.update({ [`system.${this.statMap[stat].origin}.${stat}.isOpened`]: !this.actor.system[this.statMap[stat].origin][stat].isOpened });
        }
    },

    _onDerivedModifierDisplay(event) {
        this.actor.update({ 'system.derivedStats.modifiersIsOpened': !this.actor.system.derivedStats.modifiersIsOpened });
    },

    async _onAddStatModifier(event) {
        event.preventDefault();
        let stat = event.currentTarget.closest(".stat-display").dataset.stat;

        if (stat == "reputation") {
            let newModifierList = this.actor.system.reputation.modifiers
            newModifierList.push({ name: "Modifier", value: 0 })
            this.actor.update({ [`system.${stat}.modifiers`]: newModifierList });
        }
        else {
            let newModifierList = this.actor.system[this.statMap[stat].origin][stat].modifiers;
            newModifierList.push({ name: "Modifier", value: 0 })
            this.actor.update({ [`system.${this.statMap[stat].origin}.${stat}.modifiers`]: newModifierList });
        }
    },

    async _onEditStatModifier(event) {
        event.preventDefault();
        let stat = event.currentTarget.closest(".stat-display").dataset.stat;

        let element = event.currentTarget;
        let itemId = element.closest(".list-modifiers").dataset.id;

        let field = element.dataset.field;
        let value = element.value
        let modifiers = []

        if (stat == "reputation") {
            modifiers = this.actor.system.reputation.modifiers
        }
        else {
            modifiers = this.actor.system[this.statMap[stat].origin][stat].modifiers;
        }

        let objIndex = modifiers.findIndex((obj => obj.id == itemId));
        modifiers[objIndex][field] = value

        if (stat == "reputation") {
            this.actor.update({ [`system.${stat}.modifiers`]: modifiers });
        }
        else {
            this.actor.update({ [`system.${this.statMap[stat].origin}.${stat}.modifiers`]: modifiers });
        }

        this.actor.updateDerived();
    },

    async _onRemoveStatModifier(event) {
        event.preventDefault();
        let stat = event.currentTarget.closest(".stat-display").dataset.stat;
        let type = event.currentTarget.closest(".stat-display").dataset.type;
        let prevModList = []
        if (type == "coreStat") {
            prevModList = this.actor.system.coreStats[stat].modifiers;
        } else if (type == "derivedStat") {
            prevModList = this.actor.system.derivedStats[stat].modifiers;
        } else if (type == "reputation") {
            prevModList = this.actor.system.reputation.modifiers;
        } else {
            prevModList = this.actor.system.stats[stat].modifiers;
        }
        const newModList = Object.values(prevModList).map((details) => details);
        const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
        newModList.splice(idxToRm, 1);

        if (stat == "reputation") {
            this.actor.update({ [`system.${stat}.modifiers`]: newModList });
        }
        else {
            this.actor.update({ [`system.${this.statMap[stat].origin}.${stat}.modifiers`]: newModList });
        }

        this.actor.updateDerived();
    },

    /** Do not delete. This method is here to give external modules the possibility to make skill rolls. */
    async _onStatSaveRoll(event) {
        let stat = event.currentTarget.closest(".stat-display").dataset.stat;
        let statValue = this.actor.system.stats[stat].current;
        let statName = `WITCHER.St${stat.charAt(0).toUpperCase() + stat.slice(1)}`;

        let messageData = { speaker: ChatMessage.getSpeaker({ actor: this.actor }) }
        messageData.flavor = `
        <h2>${game.i18n.localize(statName)}</h2>
        <div class="roll-summary">
            <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")} <b>${statValue}</b></div>
        </div>
        <hr />`

        let config = new RollConfig()
        config.showCrit = true
        config.showSuccess = true
        config.reversal = true
        config.threshold = statValue
        config.thresholdDesc = statName
        await extendedRoll(`1d10`, messageData, config)
    },

    async _onReputation(event) {
        let dialogTemplate = `
        <h1>${game.i18n.localize("WITCHER.Reputation")}</h1>`;
        if (this.actor.system.reputation.modifiers.length > 0) {
            dialogTemplate += `<label>${game.i18n.localize("WITCHER.Apply.Mod")}</label>`;
            this.actor.system.reputation.modifiers.forEach(mod => dialogTemplate += `<div><input id="${mod.name.replace(/\s/g, '')}" type="checkbox" unchecked/> ${mod.name}(${mod.value})</div>`)
        }
        new Dialog({
            title: game.i18n.localize("WITCHER.ReputationTitle"),
            content: dialogTemplate,
            buttons: {
                t1: {
                    label: `${game.i18n.localize("WITCHER.ReputationButton.Save")}`,
                    callback: (async html => {
                        let statValue = this.actor.system.reputation.max

                        this.actor.system.reputation.modifiers.forEach(mod => {
                            const noSpacesName = mod.name.replace(/\s/g, '')
                            if (html.find(`#${noSpacesName}`)[0].checked) {
                                statValue += Number(mod.value)
                            }
                        });

                        let messageData = { speaker: ChatMessage.getSpeaker({ actor: this.actor }) }
                        messageData.flavor = `
                <h2>${game.i18n.localize("WITCHER.ReputationTitle")}: ${game.i18n.localize("WITCHER.ReputationSave.Title")}</h2>
                <div class="roll-summary">
                  <div class="dice-formula">${game.i18n.localize("WITCHER.Chat.SaveText")}: <b>${statValue}</b></div>
                </div>
                <hr />`

                        let config = new RollConfig()
                        config.showSuccess = true
                        config.reversal = true
                        config.threshold = statValue

                        await extendedRoll(`1d10`, messageData, config)
                    })
                },
                t2: {
                    label: `${game.i18n.localize("WITCHER.ReputationButton.FaceDown")}`,
                    callback: (async html => {
                        let repValue = this.actor.system.reputation.max

                        this.actor.system.reputation.modifiers.forEach(mod => {
                            const noSpacesName = mod.name.replace(/\s/g, '')
                            if (html.find(`#${noSpacesName}`)[0].checked) {
                                repValue += Number(mod.value)
                            }
                        });

                        let messageData = { speaker: ChatMessage.getSpeaker({ actor: this.actor }) }
                        let rollFormula = `1d10 + ${Number(repValue)}[${game.i18n.localize("WITCHER.Reputation")}] + ${Number(this.actor.system.stats.will.current)}[${game.i18n.localize("WITCHER.StWill")}]`
                        messageData.flavor = `
                <h2>${game.i18n.localize("WITCHER.ReputationTitle")}: ${game.i18n.localize("WITCHER.ReputationFaceDown.Title")}</h2>
                <div class="roll-summary">
                  <div class="dice-formula">${game.i18n.localize("WITCHER.Context.Result")}: <b>${rollFormula}</b></div>
                </div>
                <hr />`

                        await extendedRoll(rollFormula, messageData, new RollConfig())
                    })
                }
            }
        }).render(true);
    },

    _onHPChanged(event) {
        this.actor.updateDerived()
    },

    calc_total_stats(context) {
        let totalStats = 0;
        for (let element in context.system.stats) {
            totalStats += context.system.stats[element].max;
        }
        return totalStats;
    },

    async _onLuckMinus(event) {
        event.preventDefault();
        if (this.actor.system.stats.luck.total > 0) {
            await this.actor.update({ 'system.stats.luck.total': this.actor.system.stats.luck.total - 1 });
        }
    },

    async _onLuckReset(event) {
        event.preventDefault();
        await this.actor.update({ 'system.stats.luck.total': this.actor.system.stats.luck.max });
    },

    async _onAdrenalineMinus(event) {
        event.preventDefault();
        if (this.actor.system.adrenaline.current > 0) {
            await this.actor.update({ 'system.adrenaline.current': this.actor.system.adrenaline.current - 1 });
        }
    },

    async _onAdrenalinePlus(event) {
        event.preventDefault();
        await this.actor.update({ 'system.adrenaline.current': this.actor.system.adrenaline.current + 1 });
    },

    statListener(html) {
        html.find("input.stat-max").on("change", this.actor.updateDerived());

        html.find(".hp-value").change(this._onHPChanged.bind(this));

        html.find(".stat-roll").on("click", this._onStatSaveRoll.bind(this));
        html.find(".reputation-roll").on("click", this._onReputation.bind(this));

        html.find(".stat-modifier-display").on("click", this._onStatModifierDisplay.bind(this));
        html.find(".derived-modifier-display").on("click", this._onDerivedModifierDisplay.bind(this));

        html.find(".add-modifier").on("click", this._onAddStatModifier.bind(this));
        html.find(".delete-stat").on("click", this._onRemoveStatModifier.bind(this));
        html.find(".list-mod-edit").on("blur", this._onEditStatModifier.bind(this));

        html.find('.luck-minus').on('click', this._onLuckMinus.bind(this));
        html.find('.luck-reset').on('click', this._onLuckReset.bind(this));
        html.find('.adrenaline-minus').on('click', this._onAdrenalineMinus.bind(this));
        html.find('.adrenaline-plus').on('click', this._onAdrenalinePlus.bind(this));
    },
};