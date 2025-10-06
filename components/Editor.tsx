"use client";
import { 
  $getRoot, 
  $getSelection, 
  $createParagraphNode, 
  $insertNodes,
  $getNodeByKey,
  TextNode,
  $createTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  LexicalCommand,
  $isRangeSelection,
  KEY_ENTER_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { 
  $createHeadingNode, 
  $createQuoteNode, 
  HeadingNode, 
  QuoteNode,
  registerRichText
} from '@lexical/rich-text';
import { 
  $createListNode, 
  $createListItemNode, 
  ListNode, 
  ListItemNode 
} from '@lexical/list';
import { $createLinkNode, LinkNode } from '@lexical/link';
import { 
  $getSelectionStyleValueForProperty,
  $patchStyleText 
} from '@lexical/selection';

import { 
  Box, 
  Paper, 
  Text, 
  Group, 
  ActionIcon, 
  Divider,
  Stack,
  Container,
  Menu,
  UnstyledButton,
  Kbd
} from '@mantine/core';
import { 
  IconBold, 
  IconItalic, 
  IconUnderline,
  IconList,
  IconListNumbers,
  IconQuote,
  IconH1,
  IconH2,
  IconH3,
  IconLink,
  IconPhoto,
  IconTable,
  IconColumns,
  IconCode,
  IconPlayerPlay,
  IconMoodSmile,
  IconCalendar,
  IconCheck,
  IconMinus,
  IconAlignLeft
} from '@tabler/icons-react';
import styles from './Editor.module.css';

const theme = {
  root: 'editor-root',
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  quote: 'editor-quote',
  link: 'editor-link',
};

// Slash menu items configuration
const SLASH_MENU_ITEMS = [
  {
    title: 'Text',
    icon: IconAlignLeft,
    description: 'Just start typing with plain text',
    keywords: ['text', 'paragraph', 'p'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const paragraph = $createParagraphNode();
          $insertNodes([paragraph]);
        }
      });
    }
  },
  {
    title: 'Heading 1',
    icon: IconH1, 
    description: 'Big section heading',
    keywords: ['heading', 'h1', 'title'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const heading = $createHeadingNode('h1');
          $insertNodes([heading]);
        }
      });
    }
  },
  {
    title: 'Heading 2',
    icon: IconH2,
    description: 'Medium section heading', 
    keywords: ['heading', 'h2', 'subtitle'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const heading = $createHeadingNode('h2');
          $insertNodes([heading]);
        }
      });
    }
  },
  {
    title: 'Heading 3',
    icon: IconH3,
    description: 'Small section heading',
    keywords: ['heading', 'h3'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const heading = $createHeadingNode('h3');
          $insertNodes([heading]);
        }
      });
    }
  },
  {
    title: 'Bulleted List',
    icon: IconList,
    description: 'Create a simple bulleted list',
    keywords: ['list', 'bullet', 'ul', 'unordered'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const list = $createListNode('bullet');
          const listItem = $createListItemNode();
          list.append(listItem);
          $insertNodes([list]);
        }
      });
    }
  },
  {
    title: 'Numbered List',
    icon: IconListNumbers,
    description: 'Create a list with numbering',
    keywords: ['list', 'numbered', 'ol', 'ordered'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const list = $createListNode('number');
          const listItem = $createListItemNode();
          list.append(listItem);
          $insertNodes([list]);
        }
      });
    }
  },
  {
    title: 'Quote',
    icon: IconQuote,
    description: 'Capture a quote or citation',
    keywords: ['quote', 'blockquote', 'citation'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const quote = $createQuoteNode();
          $insertNodes([quote]);
        }
      });
    }
  },
  {
    title: 'Link',
    icon: IconLink,
    description: 'Add a link to another page',
    keywords: ['link', 'url', 'href'],
    action: (editor: any) => {
      const url = prompt('Enter URL:');
      const text = prompt('Enter link text:') || 'Link';
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if (selection) {
            const linkNode = $createLinkNode(url);
            const textNode = $createTextNode(text);
            linkNode.append(textNode);
            $insertNodes([linkNode]);
          }
        });
      }
    }
  },
  {
    title: 'Divider',
    icon: IconMinus,
    description: 'Visually divide blocks',
    keywords: ['divider', 'separator', 'hr', 'line'],
    action: (editor: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode('---');
          paragraph.append(textNode);
          $insertNodes([paragraph]);
        }
      });
    }
  },
  {
    title: 'Button Link',
    icon: IconPlayerPlay,
    description: 'Create a clickable button for your bio',
    keywords: ['button', 'link', 'cta', 'action'],
    action: (editor: any) => {
      const url = prompt('Enter button URL:');
      const text = prompt('Enter button text:') || 'Click me';
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if (selection) {
            const paragraph = $createParagraphNode();
            const buttonText = $createTextNode(`🔗 [${text}](${url})`);
            paragraph.append(buttonText);
            $insertNodes([paragraph]);
          }
        });
      }
    }
  },
  {
    title: 'Social Link',
    icon: IconMoodSmile,
    description: 'Add social media profiles',
    keywords: ['social', 'twitter', 'instagram', 'linkedin'],
    action: (editor: any) => {
      const platform = prompt('Social platform (Twitter, Instagram, etc.):') || 'Social';
      const url = prompt('Enter profile URL:');
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if (selection) {
            const paragraph = $createParagraphNode();
            const socialText = $createTextNode(`📱 [${platform}](${url})`);
            paragraph.append(socialText);
            $insertNodes([paragraph]);
          }
        });
      }
    }
  }
];

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
  console.error(error);
}

// Slash menu component
function SlashMenu({ 
  isVisible, 
  items, 
  onSelect, 
  onClose, 
  position,
  searchQuery 
}: {
  isVisible: boolean;
  items: typeof SLASH_MENU_ITEMS;
  onSelect: (item: typeof SLASH_MENU_ITEMS[0]) => void;
  onClose: () => void;
  position: { x: number; y: number };
  searchQuery: string;
}) {
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

// Slash command plugin
function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

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
          return false;
        },
        COMMAND_PRIORITY_HIGH
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

  const handleMenuSelect = useCallback((item: typeof SLASH_MENU_ITEMS[0]) => {
    // Handle prompts outside of editor.update to avoid state conflicts
    let promptData: { url?: string; text?: string; platform?: string } = {};
    
    if (item.title === 'Link') {
      const url = prompt('Enter URL:');
      const linkText = prompt('Enter link text:') || 'Link';
      if (!url) return;
      promptData = { url, text: linkText };
    } else if (item.title === 'Button Link') {
      const url = prompt('Enter button URL:');
      const text = prompt('Enter button text:') || 'Click me';
      if (!url) return;
      promptData = { url, text };
    } else if (item.title === 'Social Link') {
      const platform = prompt('Social platform (Twitter, Instagram, etc.):') || 'Social';
      const url = prompt('Enter profile URL:');
      if (!url) return;
      promptData = { url, platform };
    }

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const text = node.getTextContent();
        const offset = selection.anchor.offset;
        const slashIndex = text.lastIndexOf('/', offset);
        
        if (slashIndex !== -1 && node instanceof TextNode) {
          // Remove the slash command text (including the slash and query)
          const beforeSlash = text.substring(0, slashIndex);
          const afterQuery = text.substring(offset);
          const currentParagraph = node.getParent();
          
          if (!currentParagraph) return;
          
          let newNode;
          
          // Create the appropriate node type
          switch (item.title) {
            case 'Text':
              newNode = $createParagraphNode();
              break;
            case 'Heading 1':
              newNode = $createHeadingNode('h1');
              break;
            case 'Heading 2':
              newNode = $createHeadingNode('h2');
              break;
            case 'Heading 3':
              newNode = $createHeadingNode('h3');
              break;
            case 'Quote':
              newNode = $createQuoteNode();
              break;
            case 'Bulleted List':
              newNode = $createListNode('bullet');
              const bulletItem = $createListItemNode();
              newNode.append(bulletItem);
              break;
            case 'Numbered List':
              newNode = $createListNode('number');
              const numberItem = $createListItemNode();
              newNode.append(numberItem);
              break;
            case 'Link':
              newNode = $createParagraphNode();
              const linkNode = $createLinkNode(promptData.url!);
              const textNode = $createTextNode(promptData.text!);
              linkNode.append(textNode);
              newNode.append(linkNode);
              break;
            case 'Button Link':
              newNode = $createParagraphNode();
              const buttonTextNode = $createTextNode(`🔗 [${promptData.text}](${promptData.url})`);
              newNode.append(buttonTextNode);
              break;
            case 'Social Link':
              newNode = $createParagraphNode();
              const socialTextNode = $createTextNode(`📱 [${promptData.platform}](${promptData.url})`);
              newNode.append(socialTextNode);
              break;
            case 'Divider':
              newNode = $createParagraphNode();
              const dividerText = $createTextNode('---');
              newNode.append(dividerText);
              break;
            default:
              newNode = $createParagraphNode();
          }
          
          if (!newNode) return;
          
          // If there's text before the slash, keep it and create new block after
          if (beforeSlash.trim()) {
            node.setTextContent(beforeSlash);
            currentParagraph.insertAfter(newNode);
          } else {
            // Replace the entire current paragraph
            currentParagraph.replace(newNode);
          }
          
          // Set focus to the new node
          if (item.title === 'Bulleted List' || item.title === 'Numbered List') {
            // For lists, focus the first list item
            const listItem = newNode.getFirstChild();
            if (listItem && listItem.isAttached()) {
              listItem.selectStart();
            }
          } else {
            // For other nodes, select at the end
            if (newNode.isAttached()) {
              newNode.selectEnd();
            }
          }
        }
      }
    });
    
    setIsMenuVisible(false);
  }, [editor]);

  const handleMenuClose = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  return (
    <SlashMenu
      isVisible={isMenuVisible}
      items={SLASH_MENU_ITEMS}
      onSelect={handleMenuSelect}
      onClose={handleMenuClose}
      position={menuPosition}
      searchQuery={searchQuery}
    />
  );
}

// Floating toolbar component (Notion-style)
function EditorToolbar() {
  return (
    <Box 
      style={{
        position: 'sticky',
        top: '10px',
        zIndex: 10,
        display: 'none', // Hidden by default, shows on selection
        backgroundColor: 'white',
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '-40px',
      }}
    >
      <Group gap={2}>
        <ActionIcon variant="transparent" size="sm" c="gray.6">
          <IconBold size={14} />
        </ActionIcon>
        <ActionIcon variant="transparent" size="sm" c="gray.6">
          <IconItalic size={14} />
        </ActionIcon>
        <ActionIcon variant="transparent" size="sm" c="gray.6">
          <IconUnderline size={14} />
        </ActionIcon>
        <ActionIcon variant="transparent" size="sm" c="gray.6">
          <IconLink size={14} />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default function Editor() {
  const [title, setTitle] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  
  const initialConfig = {
    namespace: 'TuupleEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode
    ],
    editorState: null,
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {/* Floating Toolbar - Hidden by default, shows on selection */}
        <EditorToolbar />
        
        {/* Full-screen Notion-like Editor */}
        <Box 
          style={{ 
            minHeight: '100vh',
            fontSize: '16px',
            lineHeight: '1.7',
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '60px 96px 200px 96px',
            width: '100%',
            boxSizing: 'border-box',
          }}
          className={styles.editorContainer}
        >
          {/* Notion-style Title Input */}
          <Box style={{ position: 'relative', marginBottom: '2px' }}>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              placeholder="Untitled"
              className={styles.titleInput}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent',
                fontSize: '2.25rem',
                fontWeight: 700,
                lineHeight: '1.2',
                color: 'rgb(55, 53, 47)',
                padding: 0,
                margin: 0,
                fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                minHeight: '1.2em',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '1.2em';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            {!title && !titleFocused && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  color: 'rgb(159, 155, 150)',
                  lineHeight: '1.2',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
                }}
              >
                Untitled
              </div>
            )}
          </Box>

          {/* Main Content Editor */}
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={styles.editorContent}
                style={{
                  minHeight: 'calc(100vh - 200px)',
                  outline: 'none',
                  border: 'none',
                }}
                aria-placeholder="Type '/' for commands"
                placeholder={
                  <div 
                    className={styles.contentPlaceholder}
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      color: 'rgb(159, 155, 150)',
                      lineHeight: '1.7',
                      margin: 0,
                      padding: 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    Type '/' for commands
                  </div>
                }
              />
            }
            placeholder={
              <div 
                className={styles.contentPlaceholder}
                style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  color: 'rgb(159, 155, 150)',
                  lineHeight: '1.7',
                  margin: 0,
                  padding: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                Type '/' for commands
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </Box>
        
        {/* Plugins */}
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <SlashCommandPlugin />
      </LexicalComposer>
    </Box>
  );
}