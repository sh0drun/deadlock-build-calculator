import type { Ability, AbilityProperty, Item } from '../types';
import { StatsCalculator } from './statsCalculator';

export interface AbilityCalculation {
  ability: Ability;
  baseDamage: number;
  scaledDamage: number;
  baseCooldown: number;
  scaledCooldown: number;
  baseDuration: number;
  scaledDuration: number;
  baseRange: string;
  scaledRange: string;
  charges: number;
  dps: number; // Damage per second accounting for cooldown
}

export class AbilityCalculator {
  /**
   * Parse a numeric value from an AbilityProperty
   */
  private static parseValue(value: number | string | undefined): number {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    // Remove 'm' suffix and other units
    const numStr = String(value).replace(/[^0-9.-]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Calculate scaled value based on spirit power
   */
  private static calculateScaling(
    baseValue: number,
    property: AbilityProperty | undefined,
    spiritPower: number,
    cooldownReduction: number
  ): number {
    if (!property?.scale_function) return baseValue;

    const scaleType = property.scale_function.specific_stat_scale_type;
    const scaleMultiplier = property.scale_function.stat_scale || 0;

    switch (scaleType) {
      case 'ETechPower':
        // Damage scaling: base + (spirit * multiplier)
        return baseValue + (spiritPower * scaleMultiplier);

      case 'ETechCooldown':
        // Cooldown reduction: base * (1 - reduction/100)
        return baseValue * (1 - cooldownReduction / 100);

      case 'ETechDuration':
        // Duration: base * (1 + duration_modifier)
        // Note: Duration items add flat percentages
        return baseValue; // Simplified for now

      case 'ETechRange':
        // Range scaling
        return baseValue; // Simplified for now

      default:
        return baseValue;
    }
  }

  /**
   * Calculate ability stats with current items
   */
  static calculate(ability: Ability, items: Item[]): AbilityCalculation {
    // Get spirit power and cooldown reduction from items
    const spiritPower = items.reduce((sum, item) => {
      const techPower = this.parseValue(item.properties.TechPower?.value);
      const bonusSpirit = this.parseValue(item.properties.BonusSpirit?.value);
      return sum + techPower + bonusSpirit;
    }, 0);

    const cooldownReduction = items.reduce((sum, item) => {
      return sum + this.parseValue(item.properties.CooldownReduction?.value);
    }, 0);

    // Base values
    const baseDamage = this.parseValue(ability.properties.Damage?.value);
    const baseCooldown = this.parseValue(ability.properties.AbilityCooldown?.value);
    const baseDuration = this.parseValue(ability.properties.AbilityDuration?.value);
    const baseRange = String(ability.properties.AbilityCastRange?.value || '0m');
    const baseCharges = this.parseValue(ability.properties.AbilityCharges?.value) || 1;

    // Scaled values
    const scaledDamage = this.calculateScaling(
      baseDamage,
      ability.properties.Damage,
      spiritPower,
      cooldownReduction
    );

    const scaledCooldown = this.calculateScaling(
      baseCooldown,
      ability.properties.AbilityCooldown,
      spiritPower,
      cooldownReduction
    );

    const scaledDuration = this.calculateScaling(
      baseDuration,
      ability.properties.AbilityDuration,
      spiritPower,
      cooldownReduction
    );

    // DPS = damage / cooldown (if ability deals damage)
    const dps = scaledCooldown > 0 && scaledDamage > 0
      ? scaledDamage / scaledCooldown
      : 0;

    return {
      ability,
      baseDamage,
      scaledDamage,
      baseCooldown,
      scaledCooldown,
      baseDuration,
      scaledDuration,
      baseRange,
      scaledRange: baseRange, // Simplified for now
      charges: baseCharges,
      dps,
    };
  }

  /**
   * Calculate all abilities for a hero
   */
  static calculateAll(abilities: Ability[], items: Item[]): AbilityCalculation[] {
    return abilities.map(ability => this.calculate(ability, items));
  }
}
