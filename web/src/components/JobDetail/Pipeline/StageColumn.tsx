import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  Text,
  Group,
  Stack,
  Avatar,
  Badge,
} from "@mantine/core";
import { Candidate, PipelineStage } from "../../../stores/jobStore";
import useJobStore from "../../../stores/jobStore";

interface StageColumnProps {
  stage: PipelineStage;
  candidates: Candidate[];
  jobId: string;
  onCandidateClick?: (candidate: Candidate) => void;
  onDrop?: (candidateId: string, targetStageId: string) => void;
}

const StageColumn = ({
  stage,
  candidates,
  jobId,
  onCandidateClick,
  onDrop,
}: StageColumnProps) => {
  const { selectCandidate } = useJobStore();
  const [dragOver, setDragOver] = useState(false);
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCandidateClick = (candidate: Candidate, e?: React.MouseEvent) => {
    // Don't trigger click if we just finished dragging
    if (isDragging) {
      return;
    }
    selectCandidate(candidate);
    onCandidateClick?.(candidate);
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setIsDragging(true);
    setDraggedCandidate(candidateId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", candidateId);
    // Make the dragged element semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedCandidate(null);
    // Restore opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOver to false if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const candidateId = e.dataTransfer.getData("text/plain") || draggedCandidate;
    if (candidateId && onDrop) {
      onDrop(candidateId, stage.id);
    }
    setDraggedCandidate(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          minWidth: "220px",
          maxWidth: "280px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: dragOver ? "var(--mantine-color-blue-0)" : undefined,
          borderColor: dragOver ? "var(--mantine-color-blue-4)" : undefined,
        }}
      >
        {/* Stage Header */}
        <Group justify="space-between" mb="sm" align="center">
          <Text fw={600} size="sm" style={{ flex: 1 }}>
            {stage.name}
          </Text>
        </Group>

        {/* Count Badge */}
        <Badge
          size="lg"
          variant="light"
          color="blue"
          mb="md"
          style={{ alignSelf: "flex-start" }}
        >
          {candidates.length}
        </Badge>

        {/* Candidate Cards */}
        <Stack 
          gap="xs" 
          style={{ flex: 1, overflowY: "auto", minHeight: "300px" }}
        >
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              draggable
              onDragStart={(e) => handleDragStart(e, candidate.id)}
              onDragEnd={handleDragEnd}
              style={{ cursor: "grab" }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  padding="xs"
                  radius="sm"
                  withBorder
                  style={{
                    cursor: "grab",
                    backgroundColor: "var(--mantine-color-gray-0)",
                  }}
                  onClick={(e) => handleCandidateClick(candidate, e)}
                >
                  <Group gap="xs">
                    <Avatar size="sm" radius="xl" color="blue">
                      {candidate.avatar ? (
                        <img src={candidate.avatar} alt={candidate.name} />
                      ) : (
                        getInitials(candidate.name)
                      )}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="xs" fw={500} truncate>
                        {candidate.name}
                      </Text>
                      <Group gap={4} mt={2}>
                        {candidate.aiFitScore !== undefined ? (
                          <Badge
                            size="xs"
                            color={
                              candidate.aiFitScore >= 80
                                ? "green"
                                : candidate.aiFitScore >= 60
                                ? "yellow"
                                : "gray"
                            }
                            variant="light"
                          >
                            AI: {candidate.aiFitScore}%
                          </Badge>
                        ) : candidate.matchScore !== undefined ? (
                          <Badge
                            size="xs"
                            color={
                              candidate.matchScore >= 80
                                ? "green"
                                : candidate.matchScore >= 60
                                ? "yellow"
                                : "gray"
                            }
                            variant="light"
                          >
                            {candidate.matchScore}%
                          </Badge>
                        ) : null}
                        {candidate.aiRecommendation && (
                          <Badge
                            size="xs"
                            color={
                              candidate.aiRecommendation === "reach_out" || candidate.aiRecommendation === "advance" || candidate.aiRecommendation === "offer"
                                ? "green"
                                : candidate.aiRecommendation === "wait"
                                ? "yellow"
                                : "red"
                            }
                            variant="dot"
                          >
                            {candidate.aiRecommendation === "reach_out" ? "Reach Out" :
                             candidate.aiRecommendation === "wait" ? "Wait" :
                             candidate.aiRecommendation === "archive" ? "Archive" :
                             candidate.aiRecommendation === "advance" ? "Advance" :
                             candidate.aiRecommendation === "offer" ? "Offer" :
                             "Reject"}
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                </Card>
              </motion.div>
            </div>
          ))}

          {candidates.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="md">
              {dragOver ? "Drop here" : "No candidates"}
            </Text>
          )}
        </Stack>
      </Card>
    </motion.div>
  );
};

export default StageColumn;

