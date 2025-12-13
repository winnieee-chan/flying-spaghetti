import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Card,
  Badge,
  Avatar,
  SimpleGrid,
  Tabs,
  Paper,
  Divider,
  ScrollArea,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconMail,
  IconCalendar,
  IconTrophy,
  IconUserOff,
} from "@tabler/icons-react";
import { HiringDecision } from "../../../stores/jobStore";

interface HiringOutcomesProps {
  hiredCandidates: HiringDecision[];
  rejectedCandidates: HiringDecision[];
}

const HiringOutcomes = ({
  hiredCandidates,
  rejectedCandidates,
}: HiringOutcomesProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderDecisionCard = (decision: HiringDecision, isHired: boolean) => (
    <motion.div
      key={decision.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card padding="md" radius="md" withBorder>
        <Stack gap="sm">
          {/* Header */}
          <Group gap="sm">
            <Avatar
              size="md"
              radius="xl"
              color={isHired ? "green" : "gray"}
            >
              {getInitials(decision.candidateName)}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {decision.candidateName}
              </Text>
              {decision.candidateHeadline && (
                <Text size="xs" c="dimmed" truncate>
                  {decision.candidateHeadline}
                </Text>
              )}
            </div>
            <Badge
              size="lg"
              color={isHired ? "green" : "red"}
              variant="light"
              leftSection={isHired ? <IconCheck size={12} /> : <IconX size={12} />}
            >
              {isHired ? "Hired" : "Rejected"}
            </Badge>
          </Group>

          <Divider />

          {/* Details */}
          <Stack gap="xs">
            <Group gap="xs">
              <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                {formatDate(decision.decisionDate)}
              </Text>
            </Group>

            {decision.fitScore !== undefined && (
              <Group gap="xs">
                <Badge size="sm" variant="outline">
                  {decision.fitScore}% fit
                </Badge>
              </Group>
            )}

            {decision.feedbackSent && (
              <Group gap="xs">
                <IconMail size={14} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed">
                  {isHired ? "Offer sent" : "Feedback sent"}
                </Text>
              </Group>
            )}

            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {decision.candidateEmail}
              </Text>
            </Group>
          </Stack>

          {/* Message Preview */}
          {(decision.offerMessage || decision.rejectionMessage) && (
            <>
              <Divider />
              <Paper p="xs" radius="sm" bg="gray.0">
                <Text size="xs" c="dimmed" lineClamp={2}>
                  {decision.offerMessage || decision.rejectionMessage}
                </Text>
              </Paper>
            </>
          )}
        </Stack>
      </Card>
    </motion.div>
  );

  const totalDecisions = hiredCandidates.length + rejectedCandidates.length;

  if (totalDecisions === 0) {
    return (
      <Card padding="xl" radius="md" withBorder>
        <Stack align="center" gap="md" py="xl">
          <IconUserOff size={48} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed" ta="center">
            No hiring decisions yet. Complete candidates through the workflow
            to see them here.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Tabs defaultValue="hired" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="hired"
            leftSection={<IconTrophy size={14} />}
            color="green"
          >
            <Group gap={4}>
              <Text size="sm">Hired</Text>
              <Badge size="xs" color="green" variant="filled">
                {hiredCandidates.length}
              </Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab
            value="rejected"
            leftSection={<IconUserOff size={14} />}
            color="gray"
          >
            <Group gap={4}>
              <Text size="sm">Rejected</Text>
              <Badge size="xs" color="gray" variant="filled">
                {rejectedCandidates.length}
              </Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="hired" style={{ flex: 1, overflow: "hidden" }}>
          <ScrollArea style={{ height: "100%" }} offsetScrollbars>
            {hiredCandidates.length === 0 ? (
              <Paper p="xl" radius="md" bg="green.0">
                <Stack align="center" gap="md">
                  <IconTrophy size={32} color="var(--mantine-color-green-6)" />
                  <Text size="sm" c="green.7" ta="center">
                    No candidates hired yet for this role.
                  </Text>
                </Stack>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {hiredCandidates.map((d) => renderDecisionCard(d, true))}
              </SimpleGrid>
            )}
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="rejected" style={{ flex: 1, overflow: "hidden" }}>
          <ScrollArea style={{ height: "100%" }} offsetScrollbars>
            {rejectedCandidates.length === 0 ? (
              <Paper p="xl" radius="md" bg="gray.0">
                <Stack align="center" gap="md">
                  <IconUserOff size={32} color="var(--mantine-color-gray-5)" />
                  <Text size="sm" c="dimmed" ta="center">
                    No candidates rejected yet for this role.
                  </Text>
                </Stack>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {rejectedCandidates.map((d) => renderDecisionCard(d, false))}
              </SimpleGrid>
            )}
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
};

export default HiringOutcomes;

