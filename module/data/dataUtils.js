export async function createEnrichedText(system, field, fieldPath) {
    return {
        enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(field),
        value: field,
        systemField: system.schema.getField(fieldPath)
    };
}
