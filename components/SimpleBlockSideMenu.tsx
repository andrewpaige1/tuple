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
  $getNodeByKey,
  $getNearestNodeFromDOMNode,
  ElementNode,
  $createTextNode,
  NodeKey,
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

// Helper to find the closest block element to the mouse position
const findClosestBlock = (clientY: number, editorElement: HTMLElement): HTMLElement | null => {
  const allBlocks = Array.from(
    editorElement.querySelectorAll(BLOCK_ELEMENT_TAGS.join(', '))
  ) as HTMLElement[];

  if (allBlocks.length === 0) {
    return null;
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
  return closestBlock;
};


export function SimpleBlockSideMenu({ editorContainerRef }: { editorContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const [editor] = useLexicalComposerContext();
  const [activeBlock, setActiveBlock] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [menuHovered, setMenuHovered] = useState(false);
  const [containerHovered, setContainerHovered] = useState(false);
  const hideTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // --- Drag and Drop State ---
  const [isDragging, setIsDragging] = useState(false);
  const dragDataRef = useRef<{
    sourceKey: NodeKey | null;
    targetKey: NodeKey | null;
    dropPosition: 'before' | 'after' | null;
  }>({ sourceKey: null, targetKey: null, dropPosition: null });
  const ghostElementRef = useRef<HTMLDivElement | null>(null);
  const dropIndicatorRef = useRef<HTMLDivElement | null>(null);
  // --- End Drag and Drop State ---

  const cancelHideMenu = useCallback(() => {
    if (hideTimeoutId.current) {
      clearTimeout(hideTimeoutId.current);
      hideTimeoutId.current = null;
    }
  }, []);

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

    const handleContainerEnter = () => {
      setContainerHovered(true);
      cancelHideMenu();
    };
    const handleContainerLeave = () => {
      setContainerHovered(false);
      maybeHideMenu();
    };

    const handleMouseMove = (event: Event) => {
      if (isDragging) return;

      const mouseEvent = event as MouseEvent;
      const closestBlock = findClosestBlock(mouseEvent.clientY, editorElement);

      if (closestBlock && closestBlock !== activeBlock) {
        setActiveBlock(closestBlock);
        const rect = closestBlock.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY + rect.height / 2 - 12,
          left: rect.left - 60,
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
  }, [editor, editorContainerRef, activeBlock, cancelHideMenu, maybeHideMenu, isDragging]);

  const handleMenuEnter = () => {
    setMenuHovered(true);
    cancelHideMenu();
  };
  const handleMenuLeave = () => {
    setMenuHovered(false);
    maybeHideMenu();
  };

  // --- Drag and Drop Handlers ---
  const handleDragMove = useCallback((event: MouseEvent) => {
    const { clientX, clientY } = event;

    if (ghostElementRef.current) {
        ghostElementRef.current.style.left = `${clientX}px`;
        ghostElementRef.current.style.top = `${clientY}px`;
    }

    const editorElement = editor.getRootElement();
    if (!editorElement || !dropIndicatorRef.current) return;

    const targetBlock = findClosestBlock(clientY, editorElement);

    if (targetBlock) {
      editor.update(() => {
        const targetNode = $getNearestNodeFromDOMNode(targetBlock);
        if (!targetNode || targetNode.getKey() === dragDataRef.current.sourceKey) {
            dropIndicatorRef.current!.style.display = 'none';
            dragDataRef.current.targetKey = null;
            return;
        }

        dragDataRef.current.targetKey = targetNode.getKey();
        const rect = targetBlock.getBoundingClientRect();
        const isTopHalf = clientY < rect.top + rect.height / 2;

        if (isTopHalf) {
            dropIndicatorRef.current!.style.top = `${rect.top - 2}px`;
            dragDataRef.current.dropPosition = 'before';
        } else {
            dropIndicatorRef.current!.style.top = `${rect.bottom}px`;
            dragDataRef.current.dropPosition = 'after';
        }
        dropIndicatorRef.current!.style.left = `${rect.left}px`;
        dropIndicatorRef.current!.style.width = `${rect.width}px`;
        dropIndicatorRef.current!.style.display = 'block';
      });
    } else if (dropIndicatorRef.current) {
        dropIndicatorRef.current.style.display = 'none';
        dragDataRef.current.targetKey = null;
    }
  }, [editor]);

  const handleDragEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.body.style.cursor = '';

    if (ghostElementRef.current) {
      document.body.removeChild(ghostElementRef.current);
      ghostElementRef.current = null;
    }
    if (dropIndicatorRef.current) {
      document.body.removeChild(dropIndicatorRef.current);
      dropIndicatorRef.current = null;
    }

    const { sourceKey, targetKey, dropPosition } = dragDataRef.current;
    if (sourceKey && targetKey && dropPosition && sourceKey !== targetKey) {
        editor.update(() => {
            const sourceNode = $getNodeByKey(sourceKey);
            const targetNode = $getNodeByKey(targetKey);

            if (sourceNode && targetNode) {
                if (dropPosition === 'before') {
                    targetNode.insertBefore(sourceNode);
                } else {
                    targetNode.insertAfter(sourceNode);
                }
                sourceNode.selectEnd();
            }
        });
    }

    setIsDragging(false);
    dragDataRef.current = { sourceKey: null, targetKey: null, dropPosition: null };
  }, [editor, handleDragMove]);

  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (!activeBlock) return;
    event.preventDefault();

    let sourceKey: NodeKey | null = null;

    editor.read(() => {
      const node = $getNearestNodeFromDOMNode(activeBlock);
      if (node) {
        sourceKey = node.getKey();
      }
    });

    if (!sourceKey) {
      return;
    }

    dragDataRef.current.sourceKey = sourceKey;
    setIsDragging(true);

    const ghost = activeBlock.cloneNode(true) as HTMLDivElement;
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '1001';
    ghost.style.opacity = '0.7';
    ghost.style.pointerEvents = 'none';
    ghost.style.width = `${activeBlock.offsetWidth}px`;
    ghost.style.transform = 'translate(-20px, -10px)';
    document.body.appendChild(ghost);
    ghostElementRef.current = ghost;

    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.zIndex = '1001';
    indicator.style.backgroundColor = '#4d90fe';
    indicator.style.height = '2px';
    indicator.style.display = 'none';
    document.body.appendChild(indicator);
    dropIndicatorRef.current = indicator;

    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd, { once: true });

  }, [activeBlock, editor, handleDragEnd, handleDragMove]);
  // --- End Drag and Drop Handlers ---

  const handleInsertBlock = (blockType: string) => {
    if (!activeBlock) return;

    editor.update(() => {
        const root = $getRoot();
        const targetNode = $getNearestNodeFromDOMNode(activeBlock);
        
        if (!targetNode) return;

        const newNode = createNodeForBlockType(blockType);

        if (blockType === 'Bulleted List' || blockType === 'Numbered List') {
            const listItem = $createListItemNode();
            newNode.append(listItem);
        }

        targetNode.insertAfter(newNode);
        
        const focusNode = (newNode.getType() === 'list') ? newNode.getFirstChild() : newNode;
        if (focusNode) {
            focusNode.selectEnd();
        }
    });

    setActiveBlock(null);
  };

  if (!activeBlock || isDragging) return null;

  return (
    <div
      data-block-side-menu
      style={{
        position: 'fixed',
        top: position.top,
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

      <ActionIcon
        variant="subtle"
        size="sm"
        style={{ width: '24px', height: '24px', cursor: 'grab' }}
        onMouseDown={handleDragStart}
      >
        <IconGripVertical size={18} />
      </ActionIcon>
    </div>
  );
}