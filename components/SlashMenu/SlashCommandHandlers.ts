import {
  $createParagraphNode,
  $createTextNode,
  TextNode,
  $isRangeSelection,
  LexicalEditor
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode
} from '@lexical/rich-text';
import {
  $createListNode,
  $createListItemNode
} from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import { SlashMenuItem } from './SlashMenuItems';

interface PromptData {
  url?: string;
  text?: string;
  platform?: string;
}

type ModalTrigger = (type: 'link' | 'button' | 'social', onConfirm: (url: string, text: string) => void) => void;

export const handleSlashCommand = (
  item: SlashMenuItem,
  editor: LexicalEditor,
  onComplete: () => void,
  triggerModal?: ModalTrigger
) => {
  // Handle items that need modals
  if (['Link', 'Button Link', 'Social Link'].includes(item.title) && triggerModal) {
    const modalType = item.title === 'Link' ? 'link' : item.title === 'Button Link' ? 'button' : 'social';
    
    triggerModal(modalType, (url: string, text: string) => {
      const promptData = item.title === 'Social Link' ? { url, platform: text } : { url, text };
      executeSlashCommand(item, editor, promptData);
      onComplete();
    });
    return;
  }
  
  // Handle non-modal items immediately
  executeSlashCommand(item, editor, {});
  onComplete();
};

const executeSlashCommand = (
  item: SlashMenuItem,
  editor: LexicalEditor,
  promptData: PromptData
) => {

  editor.update(() => {
    const selection = editor.getEditorState().read(() => $getSelection());
    if (!$isRangeSelection(selection)) return;

    const node = selection.anchor.getNode();
    const text = node.getTextContent();
    const offset = selection.anchor.offset;
    const slashIndex = text.lastIndexOf('/', offset);
    
    if (slashIndex === -1 || !(node instanceof TextNode)) return;
    
    const beforeSlash = text.substring(0, slashIndex);
    const currentParagraph = node.getParent();
    
    if (!currentParagraph) return;
    
    const newNode = createNodeForCommand(item, promptData);
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
    focusNewNode(newNode, item.title);
  });
};

const createNodeForCommand = (item: SlashMenuItem, promptData: PromptData) => {
  switch (item.title) {
    case 'Text':
      return $createParagraphNode();
      
    case 'Heading 1':
      return $createHeadingNode('h1');
      
    case 'Heading 2':
      return $createHeadingNode('h2');
      
    case 'Heading 3':
      return $createHeadingNode('h3');
      
    case 'Quote':
      return $createQuoteNode();
      
    case 'Bulleted List':
      const bulletList = $createListNode('bullet');
      const bulletItem = $createListItemNode();
      bulletList.append(bulletItem);
      return bulletList;
      
    case 'Numbered List':
      const numberList = $createListNode('number');
      const numberItem = $createListItemNode();
      numberList.append(numberItem);
      return numberList;
      
    case 'Link':
      const linkParagraph = $createParagraphNode();
      const linkNode = $createLinkNode(promptData.url!);
      const textNode = $createTextNode(promptData.text!);
      linkNode.append(textNode);
      linkParagraph.append(linkNode);
      return linkParagraph;
      
    case 'Button Link':
      const buttonParagraph = $createParagraphNode();
      const buttonTextNode = $createTextNode(`🔗 [${promptData.text}](${promptData.url})`);
      buttonParagraph.append(buttonTextNode);
      return buttonParagraph;
      
    case 'Social Link':
      const socialParagraph = $createParagraphNode();
      const socialTextNode = $createTextNode(`📱 [${promptData.platform || 'Social'}](${promptData.url})`);
      socialParagraph.append(socialTextNode);
      return socialParagraph;
      
    case 'Divider':
      const dividerParagraph = $createParagraphNode();
      const dividerText = $createTextNode('---');
      dividerParagraph.append(dividerText);
      return dividerParagraph;
      
    default:
      return $createParagraphNode();
  }
};

const focusNewNode = (newNode: any, itemTitle: string) => {
  // Set focus to the new node
  if (itemTitle === 'Bulleted List' || itemTitle === 'Numbered List') {
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
};

// Import this function in the handlers file
import { $getSelection } from 'lexical';