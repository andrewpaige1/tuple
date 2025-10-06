import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isLinkNode, LinkNode } from '@lexical/link';
import { $getNearestNodeFromDOMNode } from 'lexical';

export function ClickableLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element is a link or inside a link
      const linkElement = target.closest('a[href]') as HTMLAnchorElement;
      
      if (linkElement) {
        event.preventDefault();
        
        // Get the URL from the link
        const url = linkElement.getAttribute('href');
        
        if (url) {
          // Open link in new tab
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    };

    // Add click listener to the editor root
    const editorRootElement = editor.getRootElement();
    if (editorRootElement) {
      editorRootElement.addEventListener('click', handleClick);
      
      return () => {
        editorRootElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor]);

  // Also handle link node rendering to ensure proper href attributes
  useEffect(() => {
    return editor.registerNodeTransform(LinkNode, (node) => {
      const url = node.getURL();
      if (url) {
        // Ensure the link has proper attributes for accessibility and functionality
        const dom = editor.getElementByKey(node.getKey());
        if (dom && dom instanceof HTMLAnchorElement) {
          dom.setAttribute('href', url);
          dom.setAttribute('target', '_blank');
          dom.setAttribute('rel', 'noopener noreferrer');
          dom.setAttribute('title', url);
        }
      }
    });
  }, [editor]);

  return null;
}