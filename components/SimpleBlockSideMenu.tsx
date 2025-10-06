"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { 
  IconPlus, 
  IconGripVertical,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconQuote,
  IconMinus
} from '@tabler/icons-react';
import {
  $createParagraphNode,
  $getRoot,
  ElementNode,
  $createTextNode
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode
} from '@lexical/rich-text';
import {
  $createListItemNode,
  $createListNode
} from '@lexical/list';

// The list of DOM node types that we consider to be a "block"
const BLOCK_ELEMENT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'];

// Helper function to create a new Lexical node based on the block type string
const createNodeForBlockType = (blockType: string): ElementNode => {
  switch (blockType) {
    case 'Heading 1':
      return $createHeadingNode('h1');
    case 'Heading 2':
      return $createHeadingNode('h2');
    case 'Heading 3':
      return $createHeadingNode('h3');
    case 'Bulleted List':
      return $createListNode('bullet');
    case 'Numbered List':
      return $createListNode('number');
    case 'Quote':
      return $createQuoteNode();
    case 'Divider':
        const dividerParagraph = $createParagraphNode();
        // A proper implementation would use a custom HorizontalRuleNode
        dividerParagraph.append($createTextNode('---'));
        return dividerParagraph;
    case 'Text':
    default:
      return $createParagraphNode();
  }
};


export function SimpleBlockSideMenu({ editorContainerRef }: { editorContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const [editor] = useLexicalComposerContext();
  const [activeBlock, setActiveBlock] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [menuHovered, setMenuHovered] = useState(false);
  const [containerHovered, setContainerHovered] = useState(false);
  const hideTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // Cancel any pending hide
  const cancelHideMenu = useCallback(() => {
    if (hideTimeoutId.current) {
      clearTimeout(hideTimeoutId.current);
      hideTimeoutId.current = null;
    }
  }, []);

  // Hide menu only if neither container nor menu is hovered
  const maybeHideMenu = useCallback(() => {
    cancelHideMenu();
    hideTimeoutId.current = setTimeout(() => {
      if (!menuHovered && !containerHovered) {
        setActiveBlock(null);
      }
    }, 120);
  }, [menuHovered, containerHovered, cancelHideMenu]);

  useEffect(() => {
    const container = editorContainerRef.current;
    const editorElement = editor.getRootElement();
    if (!container || !editorElement) return;

    // Track hover state for container
    const handleContainerEnter = () => {
      setContainerHovered(true);
      cancelHideMenu();
    };
    const handleContainerLeave = () => {
      setContainerHovered(false);
      maybeHideMenu();
    };

    // Track mouse movement for block detection
    const handleMouseMove = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const { clientY } = mouseEvent;
      const allBlocks = Array.from(
        editorElement.querySelectorAll(BLOCK_ELEMENT_TAGS.join(', '))
      ) as HTMLElement[];
      if (allBlocks.length === 0) {
        return;
      }
      let closestBlock: HTMLElement | null = null;
      let minDistance = Infinity;
      for (const block of allBlocks) {
        const rect = block.getBoundingClientRect();
        const distance = Math.abs(clientY - (rect.top + rect.height / 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestBlock = block;
        }
      }
      if (closestBlock && closestBlock !== activeBlock) {
        setActiveBlock(closestBlock);
        const rect = closestBlock.getBoundingClientRect();
        // Position menu relative to the actual text content, not the container
        setPosition({
          top: rect.top + window.scrollY + rect.height / 2 - 12, // center vertically (12px = half of 24px icon height)
          left: rect.left - 60, // position to the left of the actual text content
        });
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleContainerEnter);
    container.addEventListener('mouseleave', handleContainerLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleContainerEnter);
      container.removeEventListener('mouseleave', handleContainerLeave);
      cancelHideMenu();
    };
  }, [editor, editorContainerRef, activeBlock, cancelHideMenu, maybeHideMenu]);

  // Menu hover handlers
  const handleMenuEnter = () => {
    setMenuHovered(true);
    cancelHideMenu();
  };
  const handleMenuLeave = () => {
    setMenuHovered(false);
    maybeHideMenu();
  };

  const handleInsertBlock = (blockType: string) => {
    if (!activeBlock) return;

    editor.update(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const targetNode = children.find(node => editor.getElementByKey(node.getKey()) === activeBlock);
        
        if (!targetNode) return;

        const newNode = createNodeForBlockType(blockType);

        if (blockType === 'Bulleted List' || blockType === 'Numbered List') {
            const listItem = $createListItemNode();
            newNode.append(listItem);
        }

        targetNode.insertAfter(newNode);
        
        if (newNode.select()) {
            const focusNode = (newNode.getType() === 'list') ? newNode.getFirstChild() : newNode;
            if (focusNode) {
                focusNode.selectEnd();
            }
        }
    });

    setActiveBlock(null);
  };

  if (!activeBlock) return null;

  return (
    <div
      data-block-side-menu
      style={{
        position: 'fixed',
        top: position.top, // align to block top
        left: position.left,
        zIndex: 1000,
        display: 'flex',
        gap: '2px',
        padding: '2px',
        alignItems: 'center',
      }}
      onMouseEnter={handleMenuEnter}
      onMouseLeave={handleMenuLeave}
    >
      {/* Plus Button */}
      <Menu position="bottom-start" withArrow shadow="md">
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm" style={{ width: '24px', height: '24px' }}>
            <IconPlus size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Insert Block</Menu.Label>
          <Menu.Item leftSection={<Text size="sm">T</Text>} onClick={() => handleInsertBlock('Text')}>
            Text
          </Menu.Item>
          <Menu.Item leftSection={<IconH1 size={16} />} onClick={() => handleInsertBlock('Heading 1')}>
            Heading 1
          </Menu.Item>
          <Menu.Item leftSection={<IconH2 size={16} />} onClick={() => handleInsertBlock('Heading 2')}>
            Heading 2
          </Menu.Item>
          <Menu.Item leftSection={<IconH3 size={16} />} onClick={() => handleInsertBlock('Heading 3')}>
            Heading 3
          </Menu.Item>
          <Menu.Item leftSection={<IconList size={16} />} onClick={() => handleInsertBlock('Bulleted List')}>
            Bulleted List
          </Menu.Item>
          <Menu.Item leftSection={<IconQuote size={16} />} onClick={() => handleInsertBlock('Quote')}>
            Quote
          </Menu.Item>
          <Menu.Item leftSection={<IconMinus size={16} />} onClick={() => handleInsertBlock('Divider')}>
             Divider
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Drag Handle */}
      <ActionIcon
        variant="subtle"
        size="sm"
        style={{ width: '24px', height: '24px', cursor: 'grab' }}
        onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing'; }}
        onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab'; }}
      >
        <IconGripVertical size={18} />
      </ActionIcon>
    </div>
  );
}