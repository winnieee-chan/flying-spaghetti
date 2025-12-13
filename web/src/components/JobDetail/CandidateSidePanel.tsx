import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  ActionIcon,
  Divider,
  Select,
} from "@mantine/core";
import { IconX, IconStar, IconStarFilled, IconPlus } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import useJobStore from "../../stores/jobStore";

const CandidateSidePanel = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const {
    selectedCandidate,
    sidePanelOpen,
    setSidePanelOpen,
    toggleStarCandidate,
    starredCandidates,
    getPipelineStages,
    updateCandidateStage,
  } = useJobStore();

  if (!jobId) return null;

  const starredIds = starredCandidates.get(jobId) || new Set<string>();
  const isStarred = selectedCandidate
    ? starredIds.has(selectedCandidate.id)
    : false;

  const handleClose = () => {
    setSidePanelOpen(false);
  };

  const handleToggleStar = () => {
    if (selectedCandidate) {
      toggleStarCandidate(jobId, selectedCandidate.id);
    }
  };

  const handleStageChange = async (stageId: string) => {
    if (selectedCandidate && jobId) {
      await updateCandidateStage(jobId, selectedCandidate.id, stageId);
    }
  };

  const stages = jobId ? getPipelineStages(jobId) : [];
  const currentStage = selectedCandidate?.pipelineStage || "new";
  const isInPipeline = selectedCandidate?.pipelineStage !== undefined && selectedCandidate?.pipelineStage !== null;

  const handleAddToPipeline = async () => {
    if (selectedCandidate && jobId) {
      await updateCandidateStage(jobId, selectedCandidate.id, "new");
    }
  };

  return (
    <AnimatePresence>
      {sidePanelOpen && selectedCandidate && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "400px",
              maxWidth: "90vw",
              backgroundColor: "var(--mantine-color-body)",
              boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <Stack gap="md" p="xl">
              {/* Header */}
              <Group justify="space-between" align="flex-start">
                <Title order={2} style={{ flex: 1 }}>
                  {selectedCandidate.name}
                </Title>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color={isStarred ? "yellow" : "gray"}
                    onClick={handleToggleStar}
                  >
                    {isStarred ? (
                      <IconStarFilled size={20} />
                    ) : (
                      <IconStar size={20} />
                    )}
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={handleClose}>
                    <IconX size={20} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Headline */}
              {selectedCandidate.headline && (
                <Text size="sm" c="dimmed">
                  {selectedCandidate.headline}
                </Text>
              )}

              <Divider />

              {/* Contact Info */}
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Contact
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedCandidate.email}
                </Text>
              </Stack>

              <Divider />

              {/* Skills */}
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Skills
                </Text>
                <Group gap="xs">
                  {selectedCandidate.skills.map((skill) => (
                    <Badge key={skill} variant="light" color="blue">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              <Divider />

              {/* Experience & Location */}
              <Stack gap="md">
                <Group>
                  <Text size="sm" fw={500}>
                    Experience:
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedCandidate.experience}
                  </Text>
                </Group>
                <Group>
                  <Text size="sm" fw={500}>
                    Location:
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedCandidate.location}
                  </Text>
                </Group>
                {selectedCandidate.matchScore !== undefined && (
                  <Group>
                    <Text size="sm" fw={500}>
                      Match Score:
                    </Text>
                    <Badge
                      color={
                        selectedCandidate.matchScore >= 80
                          ? "green"
                          : selectedCandidate.matchScore >= 60
                          ? "yellow"
                          : "gray"
                      }
                    >
                      {selectedCandidate.matchScore}%
                    </Badge>
                  </Group>
                )}
              </Stack>

              <Divider />

              {/* Resume */}
              {selectedCandidate.resume && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Resume
                  </Text>
                  <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedCandidate.resume}
                  </Text>
                </Stack>
              )}

              <Divider />

              {/* Pipeline Stage */}
              {isInPipeline ? (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Pipeline Stage
                  </Text>
                  <Select
                    value={currentStage}
                    onChange={(val) => val && handleStageChange(val)}
                    data={stages.map((s) => ({ value: s.id, label: s.name }))}
                    size="sm"
                  />
                </Stack>
              ) : (
                <Button
                  fullWidth
                  variant="light"
                  color="blue"
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAddToPipeline}
                >
                  Add to Pipeline
                </Button>
              )}

              <Divider />

              {/* Actions */}
              <Button
                fullWidth
                variant="light"
                onClick={() => {
                  // Placeholder for hiring workflow
                  console.log("Launch hiring workflow for", selectedCandidate.id);
                }}
              >
                View Full Profile
              </Button>
            </Stack>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CandidateSidePanel;

