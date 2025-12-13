import { useState } from "react";
import {
  Stack,
  Text,
  TextInput,
  Button,
  Group,
  Card,
  Alert,
  Paper,
} from "@mantine/core";
import { IconCalendar, IconExternalLink, IconCheck } from "@tabler/icons-react";

interface CalendlyEmbedProps {
  candidateName: string;
  onScheduled?: (scheduledTime: string) => void;
  isLoading?: boolean;
}

const CalendlyEmbed = ({
  candidateName,
  onScheduled,
  isLoading = false,
}: CalendlyEmbedProps) => {
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Mock scheduling - in production this would integrate with Calendly's API
  const handleMockSchedule = () => {
    const scheduledTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    setIsScheduled(true);
    onScheduled?.(scheduledTime);
  };

  if (isScheduled) {
    return (
      <Alert
        icon={<IconCheck size={16} />}
        title="Interview Scheduled!"
        color="green"
        variant="light"
      >
        <Text size="sm">
          Your interview with {candidateName} has been scheduled. A confirmation
          message will be sent.
        </Text>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Schedule an interview with {candidateName} using your preferred scheduling tool.
      </Text>

      {/* Calendly URL Input */}
      <Card padding="md" radius="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Calendly / Cal.com Integration
          </Text>
          <TextInput
            placeholder="https://calendly.com/your-username"
            value={calendlyUrl}
            onChange={(e) => setCalendlyUrl(e.currentTarget.value)}
            leftSection={<IconCalendar size={16} />}
            description="Paste your scheduling link to embed it here"
          />

          {calendlyUrl && (
            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<IconExternalLink size={16} />}
                onClick={() => setShowEmbed(true)}
              >
                Load Calendar
              </Button>
              <Button
                variant="subtle"
                component="a"
                href={calendlyUrl}
                target="_blank"
              >
                Open in New Tab
              </Button>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Embedded Calendar (Mock) */}
      {showEmbed && calendlyUrl && (
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--mantine-color-gray-0)",
          }}
        >
          <Stack align="center" gap="md">
            <IconCalendar size={48} color="var(--mantine-color-blue-5)" />
            <Text size="sm" ta="center" c="dimmed">
              Calendly widget would load here from:
              <br />
              <Text span c="blue" size="xs">
                {calendlyUrl}
              </Text>
            </Text>
            <Button onClick={handleMockSchedule} loading={isLoading}>
              Simulate: Schedule Interview
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Quick Schedule Option */}
      {!showEmbed && (
        <Card padding="md" radius="md" withBorder bg="blue.0">
          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Quick Schedule (Demo)
            </Text>
            <Text size="xs" c="dimmed">
              For demo purposes, you can simulate scheduling without a Calendly account.
            </Text>
            <Button
              variant="filled"
              color="blue"
              leftSection={<IconCalendar size={16} />}
              onClick={handleMockSchedule}
              loading={isLoading}
            >
              Schedule Interview
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default CalendlyEmbed;

