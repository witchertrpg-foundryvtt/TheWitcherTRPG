export function migrateDamageProperties(source) {
    if (!source.damageProperties) {
        source.damageProperties = {}
    }

    if (source.armorPiercing) {
        source.damageProperties.armorPiercing = source.armorPiercing
    }

    if (source.improvedArmorPiercing) {
        source.damageProperties.improvedArmorPiercing = source.improvedArmorPiercing
    }

    if (source.ablating) {
        source.damageProperties.ablating = source.ablating
    }

    if (source.crushingForce) {
        source.damageProperties.crushingForce = source.crushingForce
    }

    if (source.effects) {
        source.damageProperties.effects = source.effects
    }
}