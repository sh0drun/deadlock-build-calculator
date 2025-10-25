import { useState, useMemo, useCallback } from 'react';
import type { Item } from '../types';
import { ItemTooltip } from './ItemTooltip';

interface ItemSelectorProps {
  items: Item[];
  selectedItems: Item[];
  onAddItem: (item: Item) => void;
  onRemoveItem: (item: Item) => void;
  onReorderItems: (items: Item[]) => void;
  loading?: boolean;
}

export function ItemSelector({ items, selectedItems, onAddItem, onRemoveItem, onReorderItems, loading }: ItemSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'weapon' | 'vitality' | 'spirit'>('all');
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const tierToRoman = (tier: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV'];
    return romanNumerals[tier - 1] || tier.toString();
  };

  if (loading) {
    return <div className="item-selector loading">Loading items...</div>;
  }

  // Filter items - memoized to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSlotType = filter === 'all' || item.item_slot_type === filter;
        const matchesTier = tierFilter === 'all' || item.item_tier === tierFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const notSelected = !selectedItems.find(si => si.id === item.id);
        return matchesSlotType && matchesTier && matchesSearch && notSelected;
      })
      .sort((a, b) => {
        // Sort by tier first (ascending: 1, 2, 3, 4)
        if (a.item_tier !== b.item_tier) {
          return a.item_tier - b.item_tier;
        }
        // Then by name alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [items, filter, tierFilter, searchTerm, selectedItems]);

  const totalCost = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.cost, 0);
  }, [selectedItems]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Create a sparse array representation
    const itemsBySlot: { [key: number]: Item } = {};
    selectedItems.forEach((item, index) => {
      itemsBySlot[index] = item;
    });

    const draggedItem = itemsBySlot[draggedIndex];
    const targetItem = itemsBySlot[dropIndex];

    // Swap the items
    if (draggedItem) {
      delete itemsBySlot[draggedIndex];
      itemsBySlot[dropIndex] = draggedItem;
    }

    if (targetItem) {
      itemsBySlot[draggedIndex] = targetItem;
    }

    // Convert back to array maintaining order
    const newItems: Item[] = [];
    for (let i = 0; i < 12; i++) {
      if (itemsBySlot[i]) {
        newItems.push(itemsBySlot[i]);
      }
    }

    onReorderItems(newItems);

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, selectedItems, onReorderItems]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const getItemStats = (item: Item) => {
    const stats: string[] = [];
    if (item.properties.BaseAttackDamagePercent) {
      stats.push(`+${item.properties.BaseAttackDamagePercent.value}% Weapon Damage`);
    }
    if (item.properties.BonusClipSizePercent) {
      stats.push(`+${item.properties.BonusClipSizePercent.value}% Ammo`);
    }
    if (item.properties.HeadShotBonusDamage) {
      stats.push(`+${item.properties.HeadShotBonusDamage.value} Headshot Damage`);
    }
    if (item.properties.FireRate) {
      stats.push(`+${item.properties.FireRate.value}% Fire Rate`);
    }
    if (item.properties.BonusHealth) {
      stats.push(`+${item.properties.BonusHealth.value} Health`);
    }
    if (item.properties.TechPower) {
      stats.push(`+${item.properties.TechPower.value} Spirit Power`);
    }
    return stats;
  };

  return (
    <div className="item-selector">
      <h2>Select Items</h2>

      {/* Selected Items */}
      <div className="selected-items">
        <h3>Selected Items ({selectedItems.length}/12)</h3>
        <div className="selected-items-list">
          {Array.from({ length: 12 }).map((_, index) => {
            const item = selectedItems[index];
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return item ? (
              <div
                key={item.id}
                className={`selected-item-card filled ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                title={item.name}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="slot-number">{index + 1}</div>
                <img src={item.shop_image_small} alt={item.name} />
                <button onClick={() => onRemoveItem(item)} className="remove-btn">×</button>
                <div className="selected-item-name">{item.name}</div>
              </div>
            ) : (
              <div
                key={`empty-${index}`}
                className={`selected-item-card empty ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="slot-number empty-slot">{index + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="total-cost">
          <strong>Total Cost: {totalCost} souls</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="item-filters">
        <div className="filter-group">
          <label>Slot Type:</label>
          <div className="button-group">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={filter === 'weapon' ? 'active' : ''}
              onClick={() => setFilter('weapon')}
            >
              Weapon
            </button>
            <button
              className={filter === 'vitality' ? 'active' : ''}
              onClick={() => setFilter('vitality')}
            >
              Vitality
            </button>
            <button
              className={filter === 'spirit' ? 'active' : ''}
              onClick={() => setFilter('spirit')}
            >
              Spirit
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Tier:</label>
          <div className="button-group">
            <button
              className={tierFilter === 'all' ? 'active' : ''}
              onClick={() => setTierFilter('all')}
            >
              All
            </button>
            {[1, 2, 3, 4].map((tier) => (
              <button
                key={tier}
                className={tierFilter === tier ? 'active' : ''}
                onClick={() => setTierFilter(tier)}
              >
                {tierToRoman(tier)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Available Items */}
      <div className="available-items">
        <h3>Available Items ({filteredItems.length})</h3>
        <div className="items-grid">
          {filteredItems.map((item) => {
            const isActive = item.activation && item.activation !== 'passive';
            return (
              <div
                key={item.id}
                className={`item-card tier-${item.item_tier} ${item.item_slot_type} ${isActive ? 'active-item' : ''}`}
                onClick={() => onAddItem(item)}
              >
                <img src={item.shop_image_small} alt={item.name} className="item-image" />
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-cost">{item.cost} souls</div>
                  <div className="item-tier-badge">{tierToRoman(item.item_tier)}</div>
                  {isActive && (
                    <div className="active-badge" title="Active Ability">⚡</div>
                  )}
                  <div className="item-stats">
                    {getItemStats(item).slice(0, 3).map((stat, idx) => (
                      <div key={idx} className="stat">{stat}</div>
                    ))}
                  </div>
                </div>
                <ItemTooltip item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
