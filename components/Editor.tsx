"use client";
import { useState } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { 
  HeadingNode, 
  QuoteNode
} from '@lexical/rich-text';
import { 
  ListNode, 
  ListItemNode 
} from '@lexical/list';
import { LinkNode } from '@lexical/link';

import { Box, Group, ActionIcon } from '@mantine/core';
import { 
  IconBold, 
  IconItalic, 
  IconUnderline,
  IconLink
} from '@tabler/icons-react';
import styles from './Editor.module.css';
import { SlashCommandPlugin, ClickableLinkPlugin } from './SlashMenu';

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

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
  console.error(error);
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
        <ClickableLinkPlugin />
        <SlashCommandPlugin />
      </LexicalComposer>
    </Box>
  );
}