import { useState, useEffect } from 'react';
import { Paper, Text, Box, UnstyledButton } from '@mantine/core';
import { SlashMenuItem } from './SlashMenuItems';

interface SlashMenuProps {
  isVisible: boolean;
  items: SlashMenuItem[];
  onSelect: (item: SlashMenuItem) => void;
  onClose: () => void;
  position: { x: number; y: number };
  searchQuery: string;
}

export function SlashMenu({ 
  isVisible, 
  items, 
  onSelect, 
  onClose, 
  position,
  searchQuery 
}: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev + 1) % filteredItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => prev === 0 ? filteredItems.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
      }
    };

    // Use capture phase to intercept before editor gets the event
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isVisible, selectedIndex, filteredItems, onSelect, onClose]);

  if (!isVisible || filteredItems.length === 0) return null;

  return (
    <Paper
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        maxWidth: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid rgba(55, 53, 47, 0.16)',
        borderRadius: '6px',
        boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
        backgroundColor: 'white',
        padding: '6px',
      }}
    >
      {filteredItems.map((item, index) => (
        <UnstyledButton
          key={item.title}
          onClick={() => onSelect(item)}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '8px 10px',
            borderRadius: '4px',
            backgroundColor: index === selectedIndex ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
            transition: 'background-color 0.1s ease',
          }}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <Box
            style={{
              width: '20px',
              height: '20px',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(55, 53, 47, 0.6)',
            }}
          >
            <item.icon size={16} />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="sm" style={{ color: 'rgb(55, 53, 47)', fontWeight: 500 }}>
              {item.title}
            </Text>
            <Text size="xs" style={{ color: 'rgba(55, 53, 47, 0.6)' }}>
              {item.description}
            </Text>
          </Box>
        </UnstyledButton>
      ))}
    </Paper>
  );
}