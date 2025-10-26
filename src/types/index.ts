// API Response Types based on Deadlock API structure

export interface ItemProperty {
  value: string | number;
  label?: string;
  postfix?: string;
  prefix?: string;
  tooltip_section?: string;
  tooltip_is_elevated?: boolean;
  tooltip_is_important?: boolean;
}

export interface Item {
  id: number;
  class_name: string;
  name: string;
  cost: number;
  item_tier: number;
  item_slot_type: 'weapon' | 'vitality' | 'spirit';
  type: string;
  activation: 'passive' | 'active';
  is_active_item: boolean;
  shopable: boolean;
  shop_image: string;
  shop_image_small: string;
  description: {
    desc?: string;
  };
  properties: {
    // Weapon stats
    BaseAttackDamagePercent?: ItemProperty;
    BonusClipSizePercent?: ItemProperty;
    HeadShotBonusDamage?: ItemProperty;
    FireRate?: ItemProperty;
    BulletVelocity?: ItemProperty;
    CritChance?: ItemProperty;
    BulletLifesteal?: ItemProperty;

    // Vitality stats
    BonusHealth?: ItemProperty;
    BonusHealthRegen?: ItemProperty;
    BulletArmorDamageReduction?: ItemProperty;

    // Spirit stats
    TechPower?: ItemProperty;

    // General
    AbilityCooldown?: ItemProperty;
    AbilityDuration?: ItemProperty;
    ProcChance?: ItemProperty;
    [key: string]: ItemProperty | undefined;
  };
}

export interface WeaponInfo {
  bullet_damage?: number;
  rounds_per_second?: number;
  clip_size?: number;
  cycle_time?: number;
  bullets_per_shot?: number;
  bullets?: number;
  reload_duration?: number;
  crit_bonus_start?: number;
  crit_bonus_end?: number;
}

export interface Hero {
  id: number;
  class_name: string;
  name: string;
  description: {
    lore?: string;
    role?: string;
    playstyle?: string;
  };
  images: {
    icon_hero_card: string;
    icon_image_small: string;
    minimap_image: string;
  };
  weapon_info?: WeaponInfo;
  recommended_upgrades?: string[];
  complexity: number;
  items?: {
    signature1?: string;
    signature2?: string;
    signature3?: string;
    signature4?: string;
    [key: string]: string | undefined;
  };
  player_selectable?: boolean;
  disabled?: boolean;
  in_development?: boolean;
}

// Application State Types

export interface SelectedBuild {
  hero: Hero | null;
  items: Item[];
  totalCost: number;
}

export interface DPSCalculation {
  baseDPS: number;
  modifiedDPS: number;
  headshotDPS: number;
  damageIncrease: number;
  effectiveFireRate: number;
  effectiveClipSize: number;
  burstDamage: number;
  sustainedDPS: number;
}

// Weapon item from API
export interface WeaponItem {
  id: number;
  hero?: number;
  heroes?: number[];
  weapon_info?: WeaponInfo;
}

// Ability scaling function
export interface ScaleFunction {
  class_name: string;
  subclass_name?: string;
  specific_stat_scale_type?: string;
  stat_scale?: number;
  scaling_stats?: string[];
}

// Ability property
export interface AbilityProperty {
  value: number | string;
  label?: string;
  postfix?: string;
  prefix?: string;
  css_class?: string;
  scale_function?: ScaleFunction;
  icon?: string;
}

// Ability from API
export interface Ability {
  id: number;
  class_name: string;
  name: string;
  hero: number;
  heroes?: number[];
  image?: string;
  image_webp?: string;
  start_trained: boolean;
  description?: {
    desc?: string;
  };
  properties: {
    Damage?: AbilityProperty;
    DamagePerSecond?: AbilityProperty;
    AbilityCooldown?: AbilityProperty;
    AbilityCastRange?: AbilityProperty;
    AbilityDuration?: AbilityProperty;
    AbilityCharges?: AbilityProperty;
    [key: string]: AbilityProperty | undefined;
  };
}
