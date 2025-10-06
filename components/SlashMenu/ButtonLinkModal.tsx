import { useState } from 'react';
import { Modal, TextInput, Button, Group, Text, Stack } from '@mantine/core';
import { IconPlayerPlay, IconMoodSmile } from '@tabler/icons-react';

interface ButtonLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text: string) => void;
  type: 'button' | 'social';
}

export function ButtonLinkModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type 
}: ButtonLinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [urlError, setUrlError] = useState('');

  const isButton = type === 'button';
  const icon = isButton ? IconPlayerPlay : IconMoodSmile;
  const title = isButton ? 'Add Button Link' : 'Add Social Link';
  const urlPlaceholder = isButton ? 'https://your-website.com' : 'https://twitter.com/username';
  const textPlaceholder = isButton ? 'Click me' : 'Twitter';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setUrlError('URL is required');
      return;
    }
    
    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//)) {
      finalUrl = 'https://' + finalUrl;
    }
    
    try {
      new URL(finalUrl);
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }
    
    const finalText = text.trim() || (isButton ? 'Click me' : 'Social');
    onConfirm(finalUrl, finalText);
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setText('');
    setUrlError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const Icon = icon;

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <Icon size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={600} size="lg">{title}</Text>
        </Group>
      }
      size="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 2,
      }}
      styles={{
        header: {
          backgroundColor: 'white',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          paddingBottom: '16px',
        },
        body: {
          padding: '24px',
          backgroundColor: 'white',
        },
        close: {
          color: 'var(--mantine-color-gray-6)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <TextInput
            label="URL"
            placeholder={urlPlaceholder}
            value={url}
            onChange={(e) => {
              setUrl(e.currentTarget.value);
              setUrlError('');
            }}
            error={urlError}
            required
            size="md"
            autoFocus
            onKeyDown={handleKeyDown}
            styles={{
              label: {
                fontWeight: 500,
                color: 'rgb(55, 53, 47)',
                marginBottom: '8px',
              },
              input: {
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: '6px',
                fontSize: '14px',
                padding: '12px',
                '&:focus': {
                  borderColor: 'rgb(35, 131, 226)',
                  boxShadow: '0 0 0 2px rgba(35, 131, 226, 0.1)',
                },
              },
            }}
          />
          
          <TextInput
            label={isButton ? "Button Text" : "Platform Name"}
            placeholder={textPlaceholder}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            size="md"
            onKeyDown={handleKeyDown}
            styles={{
              label: {
                fontWeight: 500,
                color: 'rgb(55, 53, 47)',
                marginBottom: '8px',
              },
              input: {
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: '6px',
                fontSize: '14px',
                padding: '12px',
                '&:focus': {
                  borderColor: 'rgb(35, 131, 226)',
                  boxShadow: '0 0 0 2px rgba(35, 131, 226, 0.1)',
                },
              },
            }}
          />
          
          <Text size="xs" c="dimmed" style={{ marginTop: '-8px' }}>
            Press ⌘+Enter to save quickly
          </Text>
          
          <Group justify="flex-end" gap="sm" style={{ marginTop: '8px' }}>
            <Button 
              variant="subtle" 
              onClick={handleClose}
              color="gray"
              size="md"
              styles={{
                root: {
                  color: 'rgb(55, 53, 47)',
                  '&:hover': {
                    backgroundColor: 'rgba(55, 53, 47, 0.1)',
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              size="md"
              styles={{
                root: {
                  backgroundColor: 'rgb(35, 131, 226)',
                  '&:hover': {
                    backgroundColor: 'rgb(25, 121, 216)',
                  },
                },
              }}
            >
              {isButton ? 'Add Button' : 'Add Social Link'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}