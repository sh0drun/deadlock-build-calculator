import { useState, useEffect } from 'react';
import type { Hero, Item } from './types';
import { DeadlockAPI } from './services/deadlockApi';
import { DPSCalculator } from './services/dpsCalculator';
import { HeroSelector } from './components/HeroSelector';
import { ItemSelector } from './components/ItemSelector';
import { DPSDisplay } from './components/DPSDisplay';
import './App.css';

function App() {
  console.log('App component mounted');
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [weaponData, setWeaponData] = useState<any[]>([]);

  // Fetch heroes and items on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [heroesData, itemsData, weaponItems] = await Promise.all([
          DeadlockAPI.getHeroes(),
          DeadlockAPI.getUpgradeItems(),
          fetch('https://assets.deadlock-api.com/v2/items/by-type/weapon').then(r => r.json())
        ]);

        // Filter to only playable heroes (not in development or disabled)
        const playableHeroes = heroesData.filter((hero: any) =>
          hero.player_selectable && !hero.disabled && !hero.in_development
        );

        setHeroes(playableHeroes);
        setItems(itemsData);
        setWeaponData(weaponItems);

        console.log(`Loaded ${playableHeroes.length} playable heroes (${heroesData.length} total) and ${itemsData.length} items`);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Merge weapon_info into hero when selected
  const handleSelectHero = (hero: Hero) => {
    const heroWeapon = weaponData.find(w => w.hero === hero.id || w.heroes?.includes(hero.id));
    const heroWithWeapon = {
      ...hero,
      weapon_info: heroWeapon?.weapon_info || {},
    };
    setSelectedHero(heroWithWeapon);
    console.log('Selected hero:', heroWithWeapon.name, 'Weapon info:', heroWithWeapon.weapon_info);
  };

  const handleAddItem = (item: Item) => {
    if (selectedItems.length < 12) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (item: Item) => {
    setSelectedItems(selectedItems.filter(i => i.id !== item.id));
  };

  // Calculate DPS
  const dpsResults = DPSCalculator.calculate(selectedHero, selectedItems);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Deadlock Build Calculator & DPS Optimizer</h1>
        <p>Select a hero and items to calculate DPS and optimize your build</p>
      </header>

      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Deadlock data...</p>
        </div>
      ) : (
        <div className="app-content">
          <div className="left-panel">
            <HeroSelector
              heroes={heroes}
              selectedHero={selectedHero}
              onSelectHero={handleSelectHero}
            />

            {selectedHero && (
              <DPSDisplay
                dps={dpsResults}
                heroName={selectedHero.name}
              />
            )}
          </div>

          <div className="right-panel">
            {selectedHero ? (
              <ItemSelector
                items={items}
                selectedItems={selectedItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <div className="no-hero-selected">
                <p>Select a hero to start building</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
