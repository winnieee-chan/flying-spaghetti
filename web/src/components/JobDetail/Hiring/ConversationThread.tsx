import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Avatar,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { Message } from "../../../stores/jobStore";

interface AIInsight {
  text: string;
  type: "salary" | "availability" | "interest" | "concern" | "question";
}

interface ConversationThreadProps {
  messages: Message[];
  candidateName: string;
  aiInsights?: AIInsight[];
  isLoading?: boolean;
}

const ConversationThread = ({
  messages,
  candidateName,
  aiInsights = [],
  isLoading = false,
}: ConversationThreadProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "salary":
        return "green";
      case "availability":
        return "blue";
      case "interest":
        return "violet";
      case "concern":
        return "orange";
      case "question":
        return "cyan";
      default:
        return "gray";
    }
  };

  const getInsightLabel = (type: AIInsight["type"]) => {
    switch (type) {
      case "salary":
        return "Salary Expectation";
      case "availability":
        return "Availability";
      case "interest":
        return "Interest Level";
      case "concern":
        return "Concern";
      case "question":
        return "Question";
      default:
        return "Insight";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (messages.length === 0) {
    return (
      <Card padding="xl" radius="md" withBorder bg="gray.0">
        <Stack align="center" gap="md">
          <Text size="sm" c="dimmed" ta="center">
            No messages yet. Start the conversation by sending a message.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* AI Insights Panel */}
      {aiInsights.length > 0 && (
        <Card padding="sm" radius="md" withBorder bg="violet.0">
          <Group gap="xs" mb="xs">
            <IconSparkles size={14} color="var(--mantine-color-violet-6)" />
            <Text size="xs" fw={500} c="violet.7">
              AI-Extracted Insights
            </Text>
          </Group>
          <Group gap="xs">
            {aiInsights.map((insight, index) => (
              <Tooltip key={index} label={insight.text} multiline w={250}>
                <Badge
                  size="sm"
                  color={getInsightColor(insight.type)}
                  variant="light"
                  style={{ cursor: "pointer" }}
                >
                  {getInsightLabel(insight.type)}: {insight.text.slice(0, 30)}
                  {insight.text.length > 30 ? "..." : ""}
                </Badge>
              </Tooltip>
            ))}
          </Group>
        </Card>
      )}

      {/* Message Thread */}
      <ScrollArea h={300} viewportRef={scrollRef} offsetScrollbars>
        <Stack gap="sm">
          {messages.map((message, index) => {
            const isFromFounder = message.from === "founder";
            return (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  padding="sm"
                  radius="md"
                  withBorder
                  style={{
                    borderLeft: `3px solid ${
                      isFromFounder
                        ? "var(--mantine-color-blue-5)"
                        : "var(--mantine-color-gray-4)"
                    }`,
                  }}
                >
                  <Group gap="sm" mb="xs">
                    <Avatar size="sm" radius="xl" color={isFromFounder ? "blue" : "gray"}>
                      {isFromFounder ? "You" : getInitials(candidateName)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {isFromFounder ? "You" : candidateName}
                        </Text>
                        {message.aiDrafted && (
                          <Badge size="xs" variant="light" color="violet">
                            AI Drafted
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </div>
                  </Group>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </Text>
                </Card>
              </motion.div>
            );
          })}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default ConversationThread;

