import { motion } from "framer-motion";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ScrollArea,
  ActionIcon,
} from "@mantine/core";
import { IconStarFilled, IconX } from "@tabler/icons-react";
import useJobStore, { type Candidate } from "../../stores/jobStore";

interface StarredDrawerProps {
  jobId: string;
}

const StarredDrawer = ({ jobId }: StarredDrawerProps) => {
  const { getStarredCandidates, selectCandidate, toggleStarCandidate } =
    useJobStore();

  const starredCandidates = getStarredCandidates(jobId);

  if (starredCandidates.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <Paper
        shadow="lg"
        p="md"
        radius="md"
        style={{
          pointerEvents: "auto",
          maxHeight: "200px",
        }}
      >
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconStarFilled size={20} style={{ color: "#fbbf24" }} />
            <Title order={4}>
              {starredCandidates.length} Starred Candidate
              {starredCandidates.length !== 1 ? "s" : ""}
            </Title>
          </Group>
        </Group>
        <ScrollArea h={120}>
          <Group gap="xs">
            {starredCandidates.map((candidate: Candidate) => (
              <motion.div
                key={candidate.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  size="lg"
                  variant="light"
                  color="yellow"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="yellow"
                      radius="xl"
                      variant="transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarCandidate(jobId, candidate.id);
                      }}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() => selectCandidate(candidate)}
                >
                  {candidate.name}
                </Badge>
              </motion.div>
            ))}
          </Group>
        </ScrollArea>
      </Paper>
    </motion.div>
  );
};

export default StarredDrawer;

