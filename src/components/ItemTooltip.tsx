import { useRef, useEffect, useState } from 'react';
import type { Item } from '../types';

interface ItemTooltipProps {
  item: Item;
}

export function ItemTooltip({ item }: ItemTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);

  const tierToRoman = (tier: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV'];
    return romanNumerals[tier - 1] || tier.toString();
  };

  useEffect(() => {
    const checkPosition = () => {
      if (tooltipRef.current) {
        const itemCard = tooltipRef.current.parentElement;
        if (itemCard) {
          const itemRect = itemCard.getBoundingClientRect();
          const tooltipWidth = 300; // approximate width
          const spaceOnRight = window.innerWidth - itemRect.right;

          // If not enough space on right (less than tooltip width + padding), show on left
          setShowLeft(spaceOnRight < tooltipWidth + 20);
        }
      }
    };

    checkPosition();
    window.addEventListener('resize', checkPosition);

    return () => {
      window.removeEventListener('resize', checkPosition);
    };
  }, []);

  // Get only important/visible properties with proper formatting
  const getItemProperties = () => {
    const props = [];
    for (const [key, prop] of Object.entries(item.properties)) {
      if (prop && prop.value && typeof prop.value !== 'object') {
        // Use the label from API if available, otherwise skip internal properties
        const label = prop.label;
        if (!label) continue; // Skip properties without labels (internal values)

        let prefix = prop.prefix || '';
        const postfix = prop.postfix || '';
        let value = prop.value;

        // Skip properties with 0 value
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(numValue) && numValue === 0) {
          continue;
        }

        // Format numbers nicely
        if (typeof value === 'number') {
          value = value % 1 === 0 ? value.toString() : value.toFixed(1);
        }

        // Replace template variables
        // {s:sign} should be + or - based on value
        if (prefix.includes('{s:sign}')) {
          const numValue = typeof prop.value === 'number' ? prop.value : parseFloat(String(prop.value));
          prefix = prefix.replace('{s:sign}', numValue >= 0 ? '+' : '');
        }

        const displayValue = `${prefix}${value}${postfix}`;

        props.push({
          label,
          displayValue,
          isImportant: prop.tooltip_is_important,
          isElevated: prop.tooltip_is_elevated,
        });
      }
    }
    return props;
  };

  const properties = getItemProperties();
  const slotColor =
    item.item_slot_type === 'weapon' ? '#ff6b35' :
    item.item_slot_type === 'vitality' ? '#4CAF50' :
    '#9C27B0';

  return (
    <div
      ref={tooltipRef}
      className={`item-tooltip ${showLeft ? 'tooltip-left' : 'tooltip-right'}`}
      style={{
        borderColor: slotColor
      }}
    >
      <div className="item-tooltip-header" style={{ backgroundColor: slotColor }}>
        <div className="item-tooltip-name">{item.name}</div>
      </div>

      <div className="item-tooltip-body">
        <div className="item-tooltip-meta">
          <span className="item-tooltip-cost">💰 {item.cost}</span>
          <span className="item-tooltip-tier">Tier {tierToRoman(item.item_tier)}</span>
        </div>

        {properties.length > 0 && (
          <div className="item-tooltip-stats">
            {properties.map((prop, idx) => (
              <div key={idx} className="item-tooltip-stat">
                <span className="stat-label">{prop.label}</span>
                <span className="stat-value">{prop.displayValue}</span>
              </div>
            ))}
          </div>
        )}

        {item.activation && item.activation !== 'passive' && (
          <div className="item-tooltip-activation">⚡ Active Ability</div>
        )}

        {item.description?.desc && (
          <div
            className="item-tooltip-description"
            dangerouslySetInnerHTML={{ __html: item.description.desc }}
          />
        )}
      </div>
    </div>
  );
}
