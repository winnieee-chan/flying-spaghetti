import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Group,
  Text,
  ActionIcon,
  Collapse,
  ThemeIcon,
  Skeleton,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";

interface WorkflowStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  icon?: ReactNode;
  isExpanded: boolean;
  isCompleted: boolean;
  isActive: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const WorkflowStep = ({
  stepNumber,
  title,
  description,
  icon,
  isExpanded,
  isCompleted,
  isActive,
  isLoading = false,
  onToggle,
  children,
}: WorkflowStepProps) => {
  const getStepColor = () => {
    if (isCompleted) return "green";
    if (isActive) return "blue";
    return "gray";
  };

  return (
    <Card
      shadow="sm"
      padding={0}
      radius="md"
      withBorder
      style={{
        borderColor: isActive
          ? "var(--mantine-color-blue-4)"
          : isCompleted
          ? "var(--mantine-color-green-4)"
          : undefined,
        overflow: "hidden",
      }}
    >
      {/* Step Header */}
      <Group
        gap="sm"
        p="md"
        style={{
          cursor: "pointer",
          backgroundColor: isExpanded
            ? "var(--mantine-color-gray-0)"
            : undefined,
        }}
        onClick={onToggle}
      >
        {/* Step Number/Status Indicator */}
        <ThemeIcon
          size="lg"
          radius="xl"
          variant={isCompleted || isActive ? "filled" : "light"}
          color={getStepColor()}
        >
          {isCompleted ? (
            <IconCheck size={16} />
          ) : icon ? (
            icon
          ) : (
            <Text size="sm" fw={600}>
              {stepNumber}
            </Text>
          )}
        </ThemeIcon>

        {/* Title and Description */}
        <div style={{ flex: 1 }}>
          <Group gap="xs">
            <Text size="sm" fw={600}>
              {title}
            </Text>
            {isCompleted && (
              <Text size="xs" c="green">
                Done
              </Text>
            )}
            {isActive && !isCompleted && (
              <Text size="xs" c="blue">
                Active
              </Text>
            )}
          </Group>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        <ActionIcon variant="subtle" color="gray">
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </ActionIcon>
      </Group>

      {/* Step Content */}
      <Collapse in={isExpanded}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              padding: "0 16px 16px 16px",
              borderTop: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            {isLoading ? (
              <div style={{ paddingTop: 16 }}>
                <Skeleton height={20} width="60%" mb="sm" />
                <Skeleton height={100} mb="sm" />
                <Skeleton height={20} width="40%" />
              </div>
            ) : (
              <div style={{ paddingTop: 16 }}>{children}</div>
            )}
          </div>
        </motion.div>
      </Collapse>
    </Card>
  );
};

export default WorkflowStep;

