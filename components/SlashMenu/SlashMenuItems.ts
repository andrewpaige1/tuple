import { 
  IconAlignLeft,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconMinus,
  IconPlayerPlay,
  IconMoodSmile
} from '@tabler/icons-react';

export interface SlashMenuItem {
  title: string;
  icon: any;
  description: string;
  keywords: string[];
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    title: 'Link',
    icon: IconLink,
    description: 'Add a link to another page',
    keywords: ['link', 'url', 'href']
  },
  {
    title: 'Text',
    icon: IconAlignLeft,
    description: 'Just start typing with plain text',
    keywords: ['text', 'paragraph', 'p']
  },
  {
    title: 'Heading 1',
    icon: IconH1, 
    description: 'Big section heading',
    keywords: ['heading', 'h1', 'title']
  },
  {
    title: 'Heading 2',
    icon: IconH2,
    description: 'Medium section heading', 
    keywords: ['heading', 'h2', 'subtitle']
  },
  {
    title: 'Heading 3',
    icon: IconH3,
    description: 'Small section heading',
    keywords: ['heading', 'h3']
  },
  {
    title: 'Bulleted List',
    icon: IconList,
    description: 'Create a simple bulleted list',
    keywords: ['list', 'bullet', 'ul', 'unordered']
  },
  {
    title: 'Numbered List',
    icon: IconListNumbers,
    description: 'Create a list with numbering',
    keywords: ['list', 'numbered', 'ol', 'ordered']
  },
  {
    title: 'Quote',
    icon: IconQuote,
    description: 'Capture a quote or citation',
    keywords: ['quote', 'blockquote', 'citation']
  },
  {
    title: 'Divider',
    icon: IconMinus,
    description: 'Visually divide blocks',
    keywords: ['divider', 'separator', 'hr', 'line']
  },
  {
    title: 'Button Link',
    icon: IconPlayerPlay,
    description: 'Create a clickable button for your bio',
    keywords: ['button', 'link', 'cta', 'action']
  },
  {
    title: 'Social Link',
    icon: IconMoodSmile,
    description: 'Add social media profiles',
    keywords: ['social', 'twitter', 'instagram', 'linkedin']
  }
];