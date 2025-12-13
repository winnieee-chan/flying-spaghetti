import {
  Group,
  Stack,
  ScrollArea,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import useJobStore from "../../../stores/jobStore";
import { Candidate } from "../../../stores/jobStore";
import StageColumn from "./StageColumn";

interface PipelineViewProps {
  jobId: string;
}

const PipelineView = ({ jobId }: PipelineViewProps) => {
  const {
    candidates,
    getPipelineStages,
    updateCandidateStage,
    selectCandidate,
  } = useJobStore();

  const stages = getPipelineStages(jobId);

  // Only show candidates that are in the pipeline (have a pipelineStage set)
  const pipelineCandidates = candidates.filter(
    (c) => c.pipelineStage !== undefined && c.pipelineStage !== null
  );

  // Group candidates by stage
  const candidatesByStage = new Map<string, Candidate[]>();
  stages.forEach((stage) => {
    candidatesByStage.set(
      stage.id,
      pipelineCandidates.filter(
        (c) => c.pipelineStage === stage.id
      )
    );
  });

  const handleDrop = async (candidateId: string, targetStageId: string) => {
    try {
      await updateCandidateStage(jobId, candidateId, targetStageId);
      // Refresh candidates to ensure UI updates
      // The store should already update, but this ensures consistency
    } catch (error) {
      console.error("Failed to update candidate stage:", error);
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    selectCandidate(candidate);
  };

  return (
    <Stack gap="md">
      {pipelineCandidates.length === 0 ? (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="No candidates in pipeline"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            Add candidates to the pipeline from the candidate pool to see them here.
          </Text>
        </Alert>
      ) : (
        /* Pipeline Stages - Kanban Board */
        <ScrollArea>
          <Group gap="md" align="flex-start" style={{ minHeight: "500px" }}>
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                candidates={candidatesByStage.get(stage.id) || []}
                jobId={jobId}
                onCandidateClick={handleCandidateClick}
                onDrop={handleDrop}
              />
            ))}
          </Group>
        </ScrollArea>
      )}
    </Stack>
  );
};

export default PipelineView;

