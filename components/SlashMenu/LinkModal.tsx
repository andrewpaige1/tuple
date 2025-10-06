import { useState } from 'react';
import { Modal, TextInput, Button, Group, Text, Stack } from '@mantine/core';
import { IconLink, IconX } from '@tabler/icons-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text: string) => void;
  title?: string;
  urlPlaceholder?: string;
  textPlaceholder?: string;
}

export function LinkModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Add Link",
  urlPlaceholder = "https://example.com",
  textPlaceholder = "Link text (optional)"
}: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url.trim()) {
      setUrlError('URL is required');
      return;
    }
    
    // Add https:// if no protocol is specified
    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//)) {
      finalUrl = 'https://' + finalUrl;
    }
    
    // Basic URL format validation
    try {
      new URL(finalUrl);
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }
    
    onConfirm(finalUrl, text.trim() || finalUrl);
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

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconLink size={20} color="var(--mantine-color-blue-6)" />
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
              setUrlError(''); // Clear error when user types
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
            label="Display Text"
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
              Add Link
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}