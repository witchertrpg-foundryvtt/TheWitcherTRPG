import {
    applyActiveEffectToActor,
    applyActiveEffectToActorViaId
} from '../scripts/temporaryEffects/applyActiveEffect.js';
import { applyStatusEffectToActor } from '../scripts/statusEffects/applyStatusEffect.js';

const system = 'TheWitcherTRPG';

async function addTemporaryHpToActor(queryData, { timeout }) {
    let actor = fromUuidSync(queryData.actorUuid);
    actor.addTemporaryHealth(queryData.temporaryHp.value, queryData.temporaryHp.duration, queryData.itemUuid, false);
    return true;
}

async function applyTemporaryItemImprovementsToActor(queryData, { timeout }) {
    let actor = fromUuidSync(queryData.actorUuid);
    actor.applyTemporaryItemImprovements(queryData.effects);
    return true;
}

async function query(queryData, { timeout }) {
    let callableFunctions = {
        applyStatusEffectToActor,
        applyActiveEffectToActor,
        applyActiveEffectToActorViaId
    };

    let callableEntityFunctions = [
        //Actor
        'addItem',
        'addTemporaryHpToActor',
        'applyTemporaryItemImprovements',
        //Item
        'restoreReliability',
        //Region
        'createRegionFromTemplateUuids'
    ];

    if (queryData.function in callableFunctions) {
        callableFunctions[queryData.function](...queryData.data);
        return true;
    }

    if (queryData.function in callableEntityFunctions) {
        let actor = fromUuidSync(queryData.uuid);
        actor[queryData.function](...queryData.data);
        return true;
    }

    return false;
}

export function registerQueries() {
    CONFIG.queries[`${system}.addTemporaryHpToActor`] = addTemporaryHpToActor;
    CONFIG.queries[`${system}.applyTemporaryItemImprovements`] = applyTemporaryItemImprovementsToActor;
    CONFIG.queries[`${system}.query`] = query;
}
