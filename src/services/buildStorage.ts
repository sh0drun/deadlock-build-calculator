import type { Hero, Item } from '../types';

export interface SavedBuild {
  id: string;
  name: string;
  heroId: number;
  itemIds: number[];
  createdAt: number;
  updatedAt: number;
}

export interface BuildData {
  hero: Hero;
  items: Item[];
}

const STORAGE_KEY = 'deadlock_saved_builds';

export class BuildStorage {
  /**
   * Get all saved builds from localStorage
   */
  static getAllBuilds(): SavedBuild[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading builds:', error);
      return [];
    }
  }

  /**
   * Save a new build or update existing one
   */
  static saveBuild(name: string, hero: Hero, items: Item[]): SavedBuild {
    const builds = this.getAllBuilds();
    const timestamp = Date.now();

    const build: SavedBuild = {
      id: `build_${timestamp}`,
      name,
      heroId: hero.id,
      itemIds: items.map(item => item.id),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    builds.push(build);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
    return build;
  }

  /**
   * Update an existing build
   */
  static updateBuild(id: string, name: string, hero: Hero, items: Item[]): SavedBuild | null {
    const builds = this.getAllBuilds();
    const index = builds.findIndex(b => b.id === id);

    if (index === -1) return null;

    builds[index] = {
      ...builds[index],
      name,
      heroId: hero.id,
      itemIds: items.map(item => item.id),
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
    return builds[index];
  }

  /**
   * Delete a build by ID
   */
  static deleteBuild(id: string): boolean {
    const builds = this.getAllBuilds();
    const filtered = builds.filter(b => b.id !== id);

    if (filtered.length === builds.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Get a specific build by ID
   */
  static getBuildById(id: string): SavedBuild | null {
    const builds = this.getAllBuilds();
    return builds.find(b => b.id === id) || null;
  }

  /**
   * Export build to JSON string
   */
  static exportBuildToJSON(build: SavedBuild): string {
    return JSON.stringify(build, null, 2);
  }

  /**
   * Import build from JSON string
   */
  static importBuildFromJSON(jsonString: string): SavedBuild | null {
    try {
      const build = JSON.parse(jsonString) as SavedBuild;

      // Validate build structure
      if (!build.id || !build.name || !build.heroId || !Array.isArray(build.itemIds)) {
        throw new Error('Invalid build format');
      }

      // Add to storage
      const builds = this.getAllBuilds();

      // Generate new ID if it already exists
      if (builds.some(b => b.id === build.id)) {
        build.id = `build_${Date.now()}`;
      }

      builds.push(build);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
      return build;
    } catch (error) {
      console.error('Error importing build:', error);
      return null;
    }
  }

  /**
   * Encode build to base64 for URL sharing
   */
  static encodeBuildToURL(heroId: number, itemIds: number[]): string {
    const data = JSON.stringify({ h: heroId, i: itemIds });
    return btoa(data);
  }

  /**
   * Decode build from base64 URL parameter
   */
  static decodeBuildFromURL(encoded: string): { heroId: number; itemIds: number[] } | null {
    try {
      const decoded = atob(encoded);
      const data = JSON.parse(decoded);

      if (typeof data.h !== 'number' || !Array.isArray(data.i)) {
        return null;
      }

      return { heroId: data.h, itemIds: data.i };
    } catch (error) {
      console.error('Error decoding build from URL:', error);
      return null;
    }
  }
}
