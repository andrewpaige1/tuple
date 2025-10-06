import {
  Button,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Stack,
  Container,
  Box,
  Anchor,
  List,
  ListItem,
  SimpleGrid,
  ThemeIcon,
  Avatar,
  Paper,
} from '@mantine/core';
import { 
  IconLayout2, 
  IconPalette, 
  IconMail, 
  IconChartBar, 
  IconLockOff, 
  IconMoodSad, 
  IconCoin,
  IconCheck,
  IconSparkles
} from '@tabler/icons-react';
import Link from 'next/link';
import { ReactNode } from 'react';

// Type definitions for component props
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  color: string;
  children: ReactNode;
}

interface TestimonialProps {
  author: string;
  role: string;
  text: string;
  avatar: string;
}

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Container size="lg" py={{ base: 60, md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" verticalSpacing={60}>
          <Stack justify="center" gap="lg">
            <Badge size="lg" variant="light" color="blue" leftSection={<IconSparkles size={16} />}>
              Built for Indie Makers
            </Badge>
            
            <Title 
              order={1} 
              style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.2 }} 
              fw={800}
            >
              Your link-in-bio, <Text span c="blue.5" inherit>unchained</Text>.
            </Title>
            
            <Text 
              size="xl" 
              c="dimmed" 
            >
              The link-in-bio for people who care about design. More powerful than Linktree, 
              simpler than building your own. Create professional pages in minutes with Tuuple's 
              block-based canvas editor.
            </Text>
            
            <Group gap="md" mt="md">
              <Button size="lg" component={Link} href="/create" variant="filled" color="blue">
                Start Building Free
              </Button>
              <Button size="lg" variant="default">
                See Examples
              </Button>
            </Group>
            
            <Text size="sm" c="dimmed" mt="xs">
              Free forever • No credit card required • Custom domain available
            </Text>
          </Stack>

          {/* Visual Mockup of the Product */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper withBorder shadow="xl" radius="md" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)'}}>
              <Stack>
                <Paper withBorder radius="sm" p="xs" shadow="xs">
                  <Group>
                    <Avatar color="blue" radius="xl">JD</Avatar>
                    <Text fw={500}>Jane Doe</Text>
                  </Group>
                </Paper>
                <SimpleGrid cols={2} spacing="xs">
                  <Paper withBorder p="md" radius="sm" shadow="xs"><Text size="sm">My SaaS</Text></Paper>
                  <Paper withBorder p="md" radius="sm" shadow="xs"><Text size="sm">Newsletter</Text></Paper>
                  <Paper withBorder p="md" radius="sm" shadow="xs" style={{ gridColumn: '1 / 3' }}><Text size="sm">Latest Blog Post</Text></Paper>
                  <Paper withBorder p="md" radius="sm" shadow="xs"><Text size="sm">Follow on X</Text></Paper>
                  <Paper withBorder p="md" radius="sm" shadow="xs"><Text size="sm">Connect on LI</Text></Paper>
                </SimpleGrid>
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Container>

      {/* Problem Section */}
      <Box bg="gray.0" py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Stack align="center" gap="md" mb={60}>
            <Title order={2} ta="center" size={36}>
              Stop settling for <Text span c="red" inherit>generic</Text> link pages
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>
              Every indie maker deserves a professional web presence that matches the quality of their work.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            <Card shadow="sm" padding="lg" radius="md">
              <Stack gap="md">
                <ThemeIcon size={48} radius="md" variant="light" color="red"><IconMoodSad size={28} /></ThemeIcon>
                <Title order={3} size="h4">Looks Unprofessional</Title>
                <Text c="dimmed">
                  Generic templates that don't reflect the quality of your work. 
                  Your SaaS looks polished, but your link page looks like 2015.
                </Text>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md">
              <Stack gap="md">
                <ThemeIcon size={48} radius="md" variant="light" color="orange"><IconLockOff size={28} /></ThemeIcon>
                <Title order={3} size="h4">Limited Control</Title>
                <Text c="dimmed">
                  Single-column lists only. Can't prioritize or group related content effectively. 
                  No strategic control over your most important links.
                </Text>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md">
              <Stack gap="md">
                <ThemeIcon size={48} radius="md" variant="light" color="yellow"><IconCoin size={28} /></ThemeIcon>
                <Title order={3} size="h4">Expensive & Limited</Title>
                <Text c="dimmed">
                  Pro features cost $5-24/mo. Poor email capture, weak analytics, 
                  and everyone's page looks exactly the same.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Solution Section */}
      <Container size="lg" py={{ base: 60, md: 100 }}>
        <Stack align="center" gap="md" mb={60}>
          <Title order={2} ta="center" size={36}>
            The Modern Link-in-Bio for Makers
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={700}>
            Tuuple is the block-based platform designed for founders and creators who need professional results, fast.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <FeatureCard icon={<IconLayout2 />} title="Multi-Column Canvas" color="blue">
            Drag blocks side-by-side to create flexible layouts. 
            Place your email signup next to your product link so visitors see both immediately.
          </FeatureCard>
          <FeatureCard icon={<IconPalette />} title="Professional Themes" color="green">
            Carefully crafted themes that make your page look professional instantly. 
            Customize colors, fonts, and spacing to match your brand perfectly.
          </FeatureCard>
          <FeatureCard icon={<IconMail />} title="Built-in Email Capture" color="violet">
            Direct integration with Mailchimp and ConvertKit. 
            Collect emails from day one with customizable signup blocks.
          </FeatureCard>
          <FeatureCard icon={<IconChartBar />} title="Privacy-First Analytics" color="orange">
            Track page views, link clicks, and top referrers without cookies or invasive tracking. 
            Know which links drive the most engagement.
          </FeatureCard>
        </SimpleGrid>
      </Container>
      
      {/* Social Proof / Testimonials Section - NEW */}
      <Box bg="gray.0" py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Stack align="center" gap="md" mb={60}>
            <Title order={2} ta="center" size={36}>
              Loved by makers like you
            </Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Testimonial
              author="Sarah Knight"
              role="Creator of MakerLog"
              avatar="https://randomuser.me/api/portraits/women/68.jpg"
              text="Tuuple finally lets my link-in-bio page reflect the design quality of my actual products. The multi-column layout is a game-changer."
            />
            <Testimonial
              author="Alex Chen"
              role="Founder of ShipFast"
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
              text="I set up my custom domain and had a beautiful page running in 10 minutes. The analytics are simple, clean, and exactly what I need."
            />
            <Testimonial
              author="Maria Garcia"
              role="Indie Developer"
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
              text="I was tired of my Linktree looking like everyone else's. With Tuuple, I have full creative control without writing a single line of code."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Container size="lg" py={{ base: 60, md: 100 }}>
        <Stack align="center" gap="md" mb={60}>
          <Title order={2} ta="center" size={36}>
            Simple, maker-friendly pricing
          </Title>
          <Text size="lg" c="dimmed" ta="center">
            Start free, upgrade when you need more power.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" maw={800} mx="auto">
          <Card shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h3">Free</Title>
              </Group>
              <Text c="dimmed">For makers getting started.</Text>
              <Title order={2}>$0<Text span size="lg" c="dimmed" fw={400}>/month</Text></Title>
              <List spacing="sm" size="sm" mt="md" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCheck size={14} /></ThemeIcon>}>
                <ListItem>tuuple.com/username URL</ListItem>
                <ListItem>Multi-column block editor</ListItem>
                <ListItem>5 professional themes</ListItem>
                <ListItem>Basic analytics (7 days)</ListItem>
                <ListItem>"Made with Tuuple" badge</ListItem>
              </List>
              <Button variant="default" size="md" fullWidth mt="md">
                Get Started
              </Button>
            </Stack>
          </Card>

          <Card shadow="md" padding="xl" radius="md" withBorder style={{
              borderColor: 'var(--mantine-color-blue-5)',
              boxShadow: '0 10px 30px -10px var(--mantine-color-blue-1)'
            }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h3">Pro</Title>
                <Badge variant="filled" color="blue">Best Value</Badge>
              </Group>
              <Text c="dimmed">For professionals who need more.</Text>
              <Title order={2}>$10<Text span size="lg" c="dimmed" fw={400}>/month</Text></Title>
              <List spacing="sm" size="sm" mt="md" icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCheck size={14} /></ThemeIcon>}>
                <ListItem><b>All Free features, plus:</b></ListItem>
                <ListItem>Custom domain (yoursite.com)</ListItem>
                <ListItem>Remove Tuuple branding</ListItem>
                <ListItem>Email capture + integrations</ListItem>
                <ListItem>Full analytics (30+ days)</ListItem>
                <ListItem>All fonts & advanced design controls</ListItem>
                <ListItem>Priority support</ListItem>
              </List>
              <Button variant="filled" color="blue" size="md" fullWidth mt="md">
                Upgrade to Pro
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Box bg="gray.9" py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Title order={2} ta="center" size={36} c="white">
              Ready to build a page you're proud of?
            </Title>
            <Text size="lg" ta="center" c="gray.4" maw={600}>
              Join thousands of indie makers who've ditched generic link-in-bio tools 
              for something that actually represents their work.
            </Text>
            <Button size="xl" variant="white" color="dark">
              Create Your Free Page
            </Button>
            <Text size="sm" c="gray.6">
              No credit card required • 2 minutes to set up • Cancel anytime
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Container size="lg" py={40}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            © 2025 Tuuple. Built for makers, by makers.
          </Text>
          <Group gap="md">
            <Anchor href="#" size="sm" c="dimmed">Privacy</Anchor>
            <Anchor href="#" size="sm" c="dimmed">Terms</Anchor>
            <Anchor href="#" size="sm" c="dimmed">Support</Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

// Helper component for features
function FeatureCard({ icon, title, color, children }: FeatureCardProps) {
  return (
    <Group align="flex-start" wrap="nowrap">
      <ThemeIcon size={48} radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
      <Stack gap={4}>
        <Title order={3} size="h4">{title}</Title>
        <Text c="dimmed">{children}</Text>
      </Stack>
    </Group>
  );
}

// Helper component for testimonials
function Testimonial({ author, role, text, avatar }: TestimonialProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md">
      <Stack gap="md">
        <Text>{text}</Text>
        <Group>
          <Avatar src={avatar} alt={author} radius="xl" />
          <Box>
            <Text fw={500} size="sm">{author}</Text>
            <Text size="xs" c="dimmed">{role}</Text>
          </Box>
        </Group>
      </Stack>
    </Card>
  );
}