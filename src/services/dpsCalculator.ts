import type { Hero, Item, DPSCalculation } from '../types';

export class DPSCalculator {
  /**
   * Extract numeric value from item property
   */
  private static getPropertyValue(property: any): number {
    if (!property) return 0;
    const value = property.value;
    return typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
  }

  /**
   * Calculate total stat bonus from all items
   */
  private static calculateTotalBonus(items: Item[], propertyName: string): number {
    return items.reduce((total, item) => {
      const property = item.properties[propertyName];
      return total + this.getPropertyValue(property);
    }, 0);
  }

  /**
   * Get hero weapon stats from weapon item
   */
  private static getHeroWeaponStats(hero: Hero) {
    // Note: We need to fetch weapon items separately to get weapon_info
    // For now, use defaults if not provided
    const weaponInfo = hero.weapon_info || {};

    const bulletDamage = weaponInfo.bullet_damage || 10;
    const cycleTime = weaponInfo.cycle_time || 0.1;
    const fireRate = cycleTime > 0 ? 1 / cycleTime : 10;
    const clipSize = weaponInfo.clip_size || 20;
    const bullets = weaponInfo.bullets || 1;
    const reloadDuration = weaponInfo.reload_duration || 2.0;
    const headshotMultiplier = weaponInfo.crit_bonus_start || 1.8;

    return {
      bulletDamage,
      cycleTime,
      fireRate,
      clipSize,
      bullets,
      reloadDuration,
      headshotMultiplier,
    };
  }

  /**
   * Calculate DPS with selected items
   */
  static calculate(hero: Hero | null, items: Item[]): DPSCalculation {
    if (!hero) {
      return {
        baseDPS: 0,
        modifiedDPS: 0,
        headshotDPS: 0,
        damageIncrease: 0,
        effectiveFireRate: 0,
        effectiveClipSize: 0,
        burstDamage: 0,
        sustainedDPS: 0,
      };
    }

    const weaponStats = this.getHeroWeaponStats(hero);

    // Calculate base DPS
    const baseDPS = weaponStats.bulletDamage * weaponStats.fireRate * weaponStats.bullets;

    // Get bonuses from items
    const weaponDamagePercent = this.calculateTotalBonus(items, 'BaseAttackDamagePercent');
    const headshotBonusDamage = this.calculateTotalBonus(items, 'HeadShotBonusDamage');
    const clipSizePercent = this.calculateTotalBonus(items, 'BonusClipSizePercent');
    const fireRatePercent = this.calculateTotalBonus(items, 'FireRate');

    // Calculate modified stats
    const damageMultiplier = 1 + (weaponDamagePercent / 100);
    const modifiedBulletDamage = weaponStats.bulletDamage * damageMultiplier;

    const fireRateMultiplier = 1 + (fireRatePercent / 100);
    const effectiveFireRate = weaponStats.fireRate * fireRateMultiplier;

    const clipSizeMultiplier = 1 + (clipSizePercent / 100);
    const effectiveClipSize = Math.floor(weaponStats.clipSize * clipSizeMultiplier);

    // Calculate modified DPS
    const modifiedDPS = modifiedBulletDamage * effectiveFireRate * weaponStats.bullets;

    // Headshot DPS (using actual headshot multiplier from weapon stats + bonus damage)
    const headshotDamage = (modifiedBulletDamage * weaponStats.headshotMultiplier) + headshotBonusDamage;
    const headshotDPS = headshotDamage * effectiveFireRate * weaponStats.bullets;

    // Burst damage (damage from emptying full clip)
    const burstDamage = modifiedBulletDamage * effectiveClipSize * weaponStats.bullets;

    // Sustained DPS (accounting for reload time)
    const timeToEmptyClip = effectiveClipSize / effectiveFireRate;
    const totalCycleTime = timeToEmptyClip + weaponStats.reloadDuration;
    const sustainedDPS = (burstDamage / totalCycleTime);

    // Damage increase percentage
    const damageIncrease = baseDPS > 0 ? ((modifiedDPS - baseDPS) / baseDPS) * 100 : 0;

    return {
      baseDPS: Math.round(baseDPS * 100) / 100,
      modifiedDPS: Math.round(modifiedDPS * 100) / 100,
      headshotDPS: Math.round(headshotDPS * 100) / 100,
      damageIncrease: Math.round(damageIncrease * 100) / 100,
      effectiveFireRate: Math.round(effectiveFireRate * 100) / 100,
      effectiveClipSize,
      burstDamage: Math.round(burstDamage * 100) / 100,
      sustainedDPS: Math.round(sustainedDPS * 100) / 100,
    };
  }

  /**
   * Compare two builds
   */
  static compareBuild(
    hero: Hero | null,
    build1Items: Item[],
    build2Items: Item[]
  ): { build1: DPSCalculation; build2: DPSCalculation; difference: number } {
    const build1 = this.calculate(hero, build1Items);
    const build2 = this.calculate(hero, build2Items);
    const difference = build2.modifiedDPS - build1.modifiedDPS;

    return { build1, build2, difference };
  }

  /**
   * Get item efficiency (DPS increase per soul spent)
   */
  static getItemEfficiency(hero: Hero | null, item: Item, currentItems: Item[]): number {
    if (!hero || item.cost === 0) return 0;

    const currentDPS = this.calculate(hero, currentItems).modifiedDPS;
    const newDPS = this.calculate(hero, [...currentItems, item]).modifiedDPS;
    const dpsIncrease = newDPS - currentDPS;

    // Return DPS per 100 souls (for readability)
    return Math.round((dpsIncrease / item.cost) * 100 * 100) / 100;
  }

  /**
   * Find optimal build within budget
   */
  static optimizeBuild(
    hero: Hero | null,
    availableItems: Item[],
    budget: number,
    maxItems: number = 6
  ): { items: Item[]; totalCost: number; dps: DPSCalculation } {
    if (!hero) {
      return {
        items: [],
        totalCost: 0,
        dps: this.calculate(null, []),
      };
    }

    const selectedItems: Item[] = [];
    let remainingBudget = budget;

    // Greedy algorithm: repeatedly add the most efficient item
    for (let i = 0; i < maxItems; i++) {
      let bestItem: Item | null = null;
      let bestEfficiency = 0;

      for (const item of availableItems) {
        // Skip if already selected or too expensive
        if (selectedItems.includes(item) || item.cost > remainingBudget) continue;

        const efficiency = this.getItemEfficiency(hero, item, selectedItems);
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestItem = item;
        }
      }

      if (!bestItem) break;

      selectedItems.push(bestItem);
      remainingBudget -= bestItem.cost;
    }

    return {
      items: selectedItems,
      totalCost: budget - remainingBudget,
      dps: this.calculate(hero, selectedItems),
    };
  }
}
