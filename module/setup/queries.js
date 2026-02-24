const system = 'TheWitcherTRPG';

async function addTemporaryHpToActor(queryData, { timeout }) {
    let actor = fromUuidSync(queryData.actorUuid);
    actor.addTemporaryHealth(queryData.temporaryHp.value, queryData.temporaryHp.duration, queryData.itemUuid, false);
    return true;
}

export function registerQueries() {
    CONFIG.queries[`${system}.addTemporaryHpToActor`] = addTemporaryHpToActor;
}
