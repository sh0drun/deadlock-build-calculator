import type { Hero, Item } from '../types';

export interface HeroStats {
  // Weapon Stats
  bulletDamage: number;
  roundsPerSecond: number;
  fireRate: number;
  clipSize: number;
  reloadTime: number;
  bulletLifesteal: number;
  lightMeleeDamage: number;
  heavyMeleeDamage: number;

  // Vitality Stats
  maxHealth: number;
  baseHealthRegen: number;
  ooHealthRegen: number;
  bulletArmor: number;
  techArmor: number;
  meleeResist: number;

  // Spirit Stats
  techPower: number;
  techCooldown: number;

  // Mobility Stats
  maxMoveSpeed: number;
  sprintSpeed: number;
  stamina: number;
  staminaRegen: number;
}

export class StatsCalculator {
  /**
   * Calculate all hero stats including item bonuses
   */
  static calculate(hero: Hero | null, items: Item[]): HeroStats | null {
    if (!hero) return null;

    // Calculate rounds per second from cycle_time
    const cycleTime = hero.weapon_info?.cycle_time || 0.1;
    const baseRoundsPerSecond = cycleTime > 0 ? 1 / cycleTime : 0;

    // Start with base hero stats
    const stats: HeroStats = {
      // Weapon Stats
      bulletDamage: hero.weapon_info?.bullet_damage || 0,
      roundsPerSecond: baseRoundsPerSecond,
      fireRate: 1, // Base fire rate multiplier (used for calculations)
      clipSize: hero.weapon_info?.clip_size || 0,
      reloadTime: hero.weapon_info?.reload_duration || 0,
      bulletLifesteal: 0,
      lightMeleeDamage: hero.starting_stats?.light_melee_damage?.value || 0,
      heavyMeleeDamage: hero.starting_stats?.heavy_melee_damage?.value || 0,

      // Vitality Stats
      maxHealth: hero.starting_stats?.max_health?.value || 0,
      baseHealthRegen: hero.starting_stats?.base_health_regen?.value || 0,
      ooHealthRegen: 0,
      bulletArmor: 0,
      techArmor: 0,
      meleeResist: 0,

      // Spirit Stats
      techPower: 0,
      techCooldown: 0,

      // Mobility Stats
      maxMoveSpeed: hero.starting_stats?.max_move_speed?.value || 0,
      sprintSpeed: hero.starting_stats?.sprint_speed?.value || 0,
      stamina: hero.starting_stats?.stamina?.value || 0,
      staminaRegen: hero.starting_stats?.stamina_regen_per_second?.value || 0,
    };

    // Apply item bonuses
    items.forEach(item => {
      this.applyItemBonuses(stats, item, baseRoundsPerSecond);
    });

    return stats;
  }

  /**
   * Apply a single item's bonuses to the stats
   */
  private static applyItemBonuses(stats: HeroStats, item: Item, baseRoundsPerSecond: number): void {
    const props = item.properties;

    // Helper to safely get numeric value
    const getNum = (val: any): number => {
      if (val === null || val === undefined) return 0;
      const num = parseFloat(String(val));
      return isNaN(num) ? 0 : num;
    };

    // Weapon Damage (percentage)
    if (props.BaseAttackDamagePercent?.value) {
      const val = getNum(props.BaseAttackDamagePercent.value);
      if (val !== 0) stats.bulletDamage *= (1 + val / 100);
    }

    // Clip Size (percentage and fixed)
    if (props.BonusClipSizePercent?.value) {
      const val = getNum(props.BonusClipSizePercent.value);
      if (val !== 0) stats.clipSize *= (1 + val / 100);
    }
    if (props.BonusClipSize?.value) {
      const val = getNum(props.BonusClipSize.value);
      if (val !== 0) stats.clipSize += val;
    }

    // Fire Rate (percentage) - affects both fire rate multiplier and rounds per second
    if (props.BonusFireRate?.value) {
      const val = getNum(props.BonusFireRate.value);
      if (val !== 0) {
        const multiplier = 1 + val / 100;
        stats.fireRate *= multiplier;
        stats.roundsPerSecond = baseRoundsPerSecond * stats.fireRate;
      }
    }

    // Reload Speed (percentage reduction, negative values = faster reload)
    if (props.BonusReloadSpeed?.value) {
      const val = getNum(props.BonusReloadSpeed.value);
      if (val !== 0) stats.reloadTime *= (1 + val / 100);
    }

    // Bullet Lifesteal (percentage)
    if (props.BulletLifestealPercent?.value) {
      const val = getNum(props.BulletLifestealPercent.value);
      if (val !== 0) stats.bulletLifesteal += val;
    }

    // Melee Damage (percentage)
    if (props.BonusMeleeDamagePercent?.value) {
      const val = getNum(props.BonusMeleeDamagePercent.value);
      if (val !== 0) {
        const bonus = 1 + val / 100;
        stats.lightMeleeDamage *= bonus;
        stats.heavyMeleeDamage *= bonus;
      }
    }

    // Health (fixed and percentage)
    if (props.BonusHealth?.value) {
      const val = getNum(props.BonusHealth.value);
      if (val !== 0) stats.maxHealth += val;
    }

    // Health Regen (fixed)
    if (props.BonusHealthRegen?.value) {
      const val = getNum(props.BonusHealthRegen.value);
      if (val !== 0) stats.baseHealthRegen += val;
    }

    // Out of Combat Health Regen
    if (props.OutOfCombatHealthRegen?.value) {
      const val = getNum(props.OutOfCombatHealthRegen.value);
      if (val !== 0) stats.ooHealthRegen += val;
    }

    // Bullet Armor/Resist (percentage)
    if (props.BulletResist?.value) {
      const val = getNum(props.BulletResist.value);
      if (val !== 0) stats.bulletArmor += val;
    }
    if (props.BulletArmor?.value) {
      const val = getNum(props.BulletArmor.value);
      if (val !== 0) stats.bulletArmor += val;
    }

    // Tech Armor/Resist (percentage)
    if (props.TechResist?.value) {
      const val = getNum(props.TechResist.value);
      if (val !== 0) stats.techArmor += val;
    }
    if (props.TechArmor?.value) {
      const val = getNum(props.TechArmor.value);
      if (val !== 0) stats.techArmor += val;
    }

    // Melee Resist (percentage)
    if (props.MeleeResistPercent?.value) {
      const val = getNum(props.MeleeResistPercent.value);
      if (val !== 0) stats.meleeResist += val;
    }

    // Spirit Power (fixed)
    if (props.TechPower?.value) {
      const val = getNum(props.TechPower.value);
      if (val !== 0) stats.techPower += val;
    }
    if (props.BonusSpirit?.value) {
      const val = getNum(props.BonusSpirit.value);
      if (val !== 0) stats.techPower += val;
    }

    // Cooldown Reduction (percentage)
    if (props.CooldownReduction?.value) {
      const val = getNum(props.CooldownReduction.value);
      if (val !== 0) stats.techCooldown += val;
    }

    // Move Speed (fixed, in m/s)
    if (props.BonusMoveSpeed?.value) {
      const val = getNum(props.BonusMoveSpeed.value);
      if (val !== 0) stats.maxMoveSpeed += val;
    }

    // Sprint Speed (fixed, in m/s)
    if (props.BonusSprintSpeed?.value) {
      const valStr = String(props.BonusSprintSpeed.value);
      // Remove 'm' suffix if present
      const val = getNum(valStr.replace('m', ''));
      if (val !== 0) stats.sprintSpeed += val;
    }

    // Stamina (fixed)
    if (props.Stamina?.value) {
      const val = getNum(props.Stamina.value);
      if (val !== 0) stats.stamina += val;
    }

    // Stamina Regen (fixed)
    if (props.StaminaRegenIncrease?.value) {
      const val = getNum(props.StaminaRegenIncrease.value);
      if (val !== 0) stats.staminaRegen += val;
    }
  }
}
