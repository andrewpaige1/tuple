import { useState, useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $insertNodes,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_EDITOR,
  KEY_ENTER_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND
} from 'lexical';
import { SlashMenu } from './SlashMenu';
import { SLASH_MENU_ITEMS, SlashMenuItem } from './SlashMenuItems';
import { handleSlashCommand } from './SlashCommandHandlers';
import { LinkModal } from './LinkModal';
import { ButtonLinkModal } from './ButtonLinkModal';

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [pendingModalCallback, setPendingModalCallback] = useState<((url: string, text: string) => void) | null>(null);

  // Register commands to block editor key handling when menu is open
  useEffect(() => {
    const unregisterCommands = [
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (isMenuVisible) {
            event?.preventDefault();
            return true; // Block the command
          }
          // Handle normal Enter key to prevent double spacing
          event?.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const paragraph = $createParagraphNode();
              $insertNodes([paragraph]);
              paragraph.selectStart();
            }
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          if (isMenuVisible) {
            event?.preventDefault();
            return true; // Block the command
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          if (isMenuVisible) {
            event?.preventDefault();
            return true; // Block the command
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (event) => {
          if (isMenuVisible) {
            event?.preventDefault();
            setIsMenuVisible(false);
            return true; // Block the command
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    ];

    return () => {
      unregisterCommands.forEach(unregister => unregister());
    };
  }, [editor, isMenuVisible]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          const text = node.getTextContent();
          const offset = selection.anchor.offset;
          
          // Check if we just typed '/'
          if (text.charAt(offset - 1) === '/' && offset > 0) {
            const rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
            if (rect) {
              setMenuPosition({
                x: rect.left,
                y: rect.bottom + 5
              });
              setSearchQuery('');
              setIsMenuVisible(true);
            }
          }
          // Check if we're continuing to type after '/'
          else if (isMenuVisible) {
            const slashIndex = text.lastIndexOf('/', offset);
            if (slashIndex !== -1 && slashIndex < offset) {
              const query = text.substring(slashIndex + 1, offset);
              setSearchQuery(query);
            } else {
              setIsMenuVisible(false);
            }
          }
        }
      });
    });
  }, [editor, isMenuVisible]);

    const triggerModal = useCallback((type: 'link' | 'button' | 'social', onConfirm: (url: string, text: string) => void) => {
    setPendingModalCallback(() => onConfirm);
    setIsMenuVisible(false);
    
    switch (type) {
      case 'link':
        setIsLinkModalOpen(true);
        break;
      case 'button':
        setIsButtonModalOpen(true);
        break;
      case 'social':
        setIsSocialModalOpen(true);
        break;
    }
  }, []);

  const handleModalConfirm = useCallback((url: string, text: string) => {
    if (pendingModalCallback) {
      pendingModalCallback(url, text);
      setPendingModalCallback(null);
    }
  }, [pendingModalCallback]);

  const handleModalClose = useCallback(() => {
    setIsLinkModalOpen(false);
    setIsButtonModalOpen(false);
    setIsSocialModalOpen(false);
    setPendingModalCallback(null);
  }, []);

  const handleMenuSelect = useCallback((item: SlashMenuItem) => {
    handleSlashCommand(item, editor, () => {
      setIsMenuVisible(false);
    }, triggerModal);
  }, [editor, triggerModal]);

  const handleMenuClose = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  return (
    <>
      <SlashMenu
        isVisible={isMenuVisible}
        items={SLASH_MENU_ITEMS}
        onSelect={handleMenuSelect}
        onClose={handleMenuClose}
        position={menuPosition}
        searchQuery={searchQuery}
      />
      
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
      
      <ButtonLinkModal
        isOpen={isButtonModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        type="button"
      />
      
      <ButtonLinkModal
        isOpen={isSocialModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        type="social"
      />
    </>
  );
}