const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherActiveEffect extends ActiveEffect {
    get isSuppressed() {
        if (
            this.parent.system.isActive === false ||
            this.parent.system.equipped === false ||
            this.system.applySelf === true ||
            this.system.applyOnTarget === true ||
            this.system.applyOnHit === true ||
            this.system.applyOnDamage === true
        )
            return true;

        return false;
    }

    get isDisabled() {
        return this.disabled || !(this.parent?.system?.equipped ?? true);
    }

    /**
     * Is this effect an temporary Item Improvement on an item
     * @type {boolean}
     */
    get isAppliedTemporaryItemImprovement() {
        return this.system.isTransferred;
    }

    get isTemporaryItemImprovement() {
        return this.type === 'temporaryItemImprovement';
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    /** @inheritDoc */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        if (
            (this.parent instanceof foundry.documents.Actor || this.system.isTransferred) &&
            this.start?.combat?.started
        ) {
            // Set start combatant to targeted actor's combatant, if present.
            // Adjust the duration of round-based effects depending on the current turn order.
            // If the target combatant has not acted yet (or is currently acting) we may need to decrease the duration.
            const effectUpdate = {};
            const combat = this.start.combat;
            const combatant = combat.getCombatantsByActor(this.parent)[0];
            if (combatant && combatant.turnNumber !== null) {
                effectUpdate.start = { combatant: combatant.id };
                const { units, value, expiry } = this.duration;
                if (units === 'rounds' && ['turnStart', 'turnEnd'].includes(expiry)) {
                    const isTurn = combatant.turnNumber === this.start.combat.turn;
                    const upcoming = combatant.turnNumber > this.start.combat.turn;
                    const decreaseDuration = upcoming || (expiry === 'turnEnd' && isTurn);
                    if (decreaseDuration) effectUpdate.duration = { value: value - 1 };
                }
            }
            this.updateSource(effectUpdate);
        }

        for await (let change of this._source.system.changes) {
            if (change.key.includes('@skill')) {
                await this.chooseSkill(change);
            }
        }
    }

    async chooseSkill(change) {
        let allSkills = Object.keys(CONFIG.WITCHER.skillMap)
            .map(key => {
                let skill = CONFIG.WITCHER.skillMap[key];
                return {
                    label: skill.label,
                    value: 'system.skills.' + skill.attribute.name + '.' + key + '.activeEffectModifiers',
                    group: game.i18n.localize('WITCHER.skills.name')
                };
            })
            .reduce((skills, skill) => {
                skills[skill.label] = skill;
                return skills;
            }, {});

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/activeEffects/wizard.hbs',
            {
                selects: allSkills
            }
        );

        let skill = await DialogV2.prompt({
            content: dialogTemplate,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.path.value;
                }
            },
            rejectClose: true
        });

        change.key = skill;
    }

    /** @inheritDoc */
    async _preUpdate(data, options, user) {
        const allowed = await super._preUpdate(data, options, user);
        if (allowed === false) return false;

        let phase = data.system?.applyAfterCalculations ? 'final' : 'initial';

        data.system?.changes.forEach(change => {
            change.phase = phase;
        });
    }
}
