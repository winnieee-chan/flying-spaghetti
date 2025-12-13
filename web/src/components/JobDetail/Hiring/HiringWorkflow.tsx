import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Group,
  Stack,
  Text,
  Stepper,
  Button,
  Card,
  Alert,
} from "@mantine/core";
import {
  IconUserSearch,
  IconMessageCircle,
  IconChecklist,
  IconArrowLeft,
  IconPlus,
  IconTrophy,
} from "@tabler/icons-react";
import useJobStore, { Candidate } from "../../../stores/jobStore";
import CandidateListSidebar from "./CandidateListSidebar";
import NewStageWorkflow from "./NewStageWorkflow";
import EngagedStageWorkflow from "./EngagedStageWorkflow";
import ClosingStageWorkflow from "./ClosingStageWorkflow";
import HiringOutcomes from "./HiringOutcomes";

interface HiringWorkflowProps {
  jobId: string;
  onNavigateToPool?: () => void;
}

const STAGES = [
  { id: "new", label: "New", icon: IconUserSearch, description: "Evaluate & Reach Out" },
  { id: "engaged", label: "Engaged", icon: IconMessageCircle, description: "Converse & Schedule" },
  { id: "closing", label: "Closing", icon: IconChecklist, description: "Decide & Offer" },
  { id: "outcomes", label: "Outcomes", icon: IconTrophy, description: "Hired & Rejected" },
] as const;

type StageId = typeof STAGES[number]["id"];
type PipelineStageId = "new" | "engaged" | "closing";

const HiringWorkflow = ({ jobId, onNavigateToPool }: HiringWorkflowProps) => {
  const { candidates, getWorkflowState, getHiredCandidates, getRejectedCandidates } = useJobStore();
  const [activeStage, setActiveStage] = useState<StageId>("new");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Filter candidates by pipeline stage
  const candidatesByStage = useMemo(() => {
    const result: Record<PipelineStageId, Candidate[]> = {
      new: [],
      engaged: [],
      closing: [],
    };

    candidates.forEach((c) => {
      if (c.pipelineStage && result[c.pipelineStage as PipelineStageId]) {
        result[c.pipelineStage as PipelineStageId].push(c);
      }
    });

    return result;
  }, [candidates]);

  // Get hiring outcomes
  const hiredCandidates = getHiredCandidates(jobId);
  const rejectedCandidates = getRejectedCandidates(jobId);

  const currentStageCandidates = useMemo(() => {
    return activeStage === "outcomes" ? [] : candidatesByStage[activeStage as PipelineStageId];
  }, [activeStage, candidatesByStage]);

  // Derive effective selected candidate - if current selection is invalid, use first candidate
  const effectiveSelectedCandidate = useMemo(() => {
    if (currentStageCandidates.length === 0) {
      return null;
    }
    if (selectedCandidate) {
      const stillInStage = currentStageCandidates.some(
        (c) => c.id === selectedCandidate.id
      );
      if (stillInStage) {
        return selectedCandidate;
      }
    }
    return currentStageCandidates[0];
  }, [currentStageCandidates, selectedCandidate]);

  const handleStageChange = (stageIndex: number) => {
    const stageId = STAGES[stageIndex].id;
    setActiveStage(stageId);
    setSelectedCandidate(null);
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const getStepStatus = (candidateId: string): string => {
    const state = getWorkflowState?.(candidateId);
    if (!state) return "Not started";
    
    const completed = state.completedSteps?.length || 0;
    const total = activeStage === "new" ? 3 : activeStage === "engaged" ? 4 : 4;
    
    if (completed === 0) return "Not started";
    if (completed >= total) return "Complete";
    return `Step ${state.currentStep + 1}/${total}`;
  };

  const activeStageIndex = STAGES.findIndex((s) => s.id === activeStage);

  const renderStageWorkflow = () => {
    // Outcomes stage - show hired/rejected candidates
    if (activeStage === "outcomes") {
      return (
        <HiringOutcomes
          hiredCandidates={hiredCandidates}
          rejectedCandidates={rejectedCandidates}
        />
      );
    }

    if (!effectiveSelectedCandidate) {
      return (
        <Card shadow="sm" padding="xl" radius="md" withBorder style={{ flex: 1 }}>
          <Stack align="center" justify="center" h="100%" gap="md">
            <Alert
              icon={<IconPlus size={16} />}
              title={`No candidates in ${STAGES[activeStageIndex].label}`}
              color="blue"
              variant="light"
            >
              <Text size="sm">
                Add candidates to your pipeline from the Pool view to get started.
              </Text>
            </Alert>
            {onNavigateToPool && (
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={onNavigateToPool}
              >
                Go to Pool View
              </Button>
            )}
          </Stack>
        </Card>
      );
    }

    switch (activeStage) {
      case "new":
        return (
          <NewStageWorkflow
            jobId={jobId}
            candidate={effectiveSelectedCandidate}
            onAdvance={() => {
              // Candidate will move to engaged stage - clear selection to auto-select next
              setSelectedCandidate(null);
            }}
          />
        );
      case "engaged":
        return (
          <EngagedStageWorkflow
            jobId={jobId}
            candidate={effectiveSelectedCandidate}
            onAdvance={() => {
              setSelectedCandidate(null);
            }}
          />
        );
      case "closing":
        return (
          <ClosingStageWorkflow
            jobId={jobId}
            candidate={effectiveSelectedCandidate}
            allClosingCandidates={candidatesByStage.closing}
            onComplete={() => {
              setSelectedCandidate(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stack gap="md" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
      {/* Stage Stepper */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stepper
            active={activeStageIndex}
            onStepClick={handleStageChange}
            size="sm"
            styles={{
              step: { cursor: "pointer" },
            }}
          >
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const count = stage.id === "outcomes" 
                ? hiredCandidates.length + rejectedCandidates.length
                : candidatesByStage[stage.id as PipelineStageId].length;
              return (
                <Stepper.Step
                  key={stage.id}
                  icon={<Icon size={18} />}
                  label={
                    <Group gap={4}>
                      <Text size="sm" fw={500}>
                        {stage.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({count})
                      </Text>
                    </Group>
                  }
                  description={stage.description}
                />
              );
            })}
          </Stepper>
        </Card>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}
      >
        {activeStage === "outcomes" ? (
          // Full width for outcomes view
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            {renderStageWorkflow()}
          </div>
        ) : (
          <Group gap="md" align="stretch" wrap="nowrap" style={{ flex: 1, height: "100%", overflow: "hidden" }}>
            {/* Candidate List Sidebar */}
            <CandidateListSidebar
              candidates={currentStageCandidates}
              selectedCandidateId={effectiveSelectedCandidate?.id || null}
              onCandidateSelect={handleCandidateSelect}
              currentStage={activeStage as PipelineStageId}
              getStepStatus={getStepStatus}
            />

            {/* Workflow Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
              {renderStageWorkflow()}
            </div>
          </Group>
        )}
      </motion.div>
    </Stack>
  );
};

export default HiringWorkflow;

