import type { Hero, Item } from '../types';

const API_BASE_URL = 'https://assets.deadlock-api.com/v2';

export class DeadlockAPI {
  /**
   * Fetch all heroes from the API
   */
  static async getHeroes(): Promise<Hero[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/heroes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch heroes: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching heroes:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific hero by ID
   */
  static async getHeroById(id: number): Promise<Hero> {
    try {
      const response = await fetch(`${API_BASE_URL}/heroes/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch hero ${id}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching hero ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all upgrade items (shop items)
   */
  static async getUpgradeItems(): Promise<Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/by-type/upgrade`);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      const data = await response.json();
      // Filter to only shopable items
      return data.filter((item: Item) => item.shopable);
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Fetch items by slot type (weapon, vitality, spirit)
   */
  static async getItemsBySlotType(slotType: 'weapon' | 'vitality' | 'spirit'): Promise<Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/by-slot-type/${slotType}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${slotType} items: ${response.statusText}`);
      }
      const data = await response.json();
      return data.filter((item: Item) => item.shopable);
    } catch (error) {
      console.error(`Error fetching ${slotType} items:`, error);
      throw error;
    }
  }

  /**
   * Fetch items by tier
   */
  static async getItemsByTier(items: Item[], tier: number): Promise<Item[]> {
    return items.filter(item => item.item_tier === tier);
  }
}
