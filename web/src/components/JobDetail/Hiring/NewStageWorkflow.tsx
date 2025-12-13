import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Card,
  Divider,
  ScrollArea,
} from "@mantine/core";
import {
  IconSearch,
  IconMail,
  IconCheck,
  IconClock,
  IconArchive,
} from "@tabler/icons-react";
import useJobStore, { Candidate } from "../../../stores/jobStore";
import WorkflowStep from "./WorkflowStep";
import FitScoreGauge from "./FitScoreGauge";
import AIMessageEditor from "./AIMessageEditor";

interface NewStageWorkflowProps {
  jobId: string;
  candidate: Candidate;
  onAdvance?: () => void;
}

const NewStageWorkflow = ({
  jobId,
  candidate,
  onAdvance,
}: NewStageWorkflowProps) => {
  const {
    currentJob,
    analyzeCandidate,
    draftFirstMessage,
    updateCandidateStage,
    getWorkflowState,
    updateWorkflowStep,
    saveDraftMessage,
    sendMessage,
  } = useJobStore();

  const [expandedStep, setExpandedStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Load workflow state on mount
  useEffect(() => {
    const state = getWorkflowState?.(candidate.id);
    if (state) {
      setCompletedSteps(state.completedSteps || []);
      setExpandedStep(state.currentStep || 0);
      if (state.draftMessage) {
        setDraftMessage(state.draftMessage);
      }
    } else {
      setCompletedSteps([]);
      setExpandedStep(0);
      setDraftMessage("");
    }
  }, [candidate.id, getWorkflowState]);

  // Auto-analyze if no fit score
  useEffect(() => {
    if (candidate.aiFitScore === undefined && !isAnalyzing) {
      handleAnalyze();
    }
  }, [candidate.id]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeCandidate(jobId, candidate.id);
      markStepComplete(0);
    } catch (error) {
      console.error("Failed to analyze candidate:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMessage = async () => {
    setIsDrafting(true);
    try {
      const message = await draftFirstMessage(jobId, candidate.id);
      setDraftMessage(message);
      saveDraftMessage?.(candidate.id, message);
    } catch (error) {
      console.error("Failed to generate message:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleRegenerateSelection = async (selection: string): Promise<string> => {
    // For now, just return a slightly modified version
    // In production, this would call an API
    await new Promise((r) => setTimeout(r, 500));
    return selection.split("").reverse().join(""); // placeholder transformation
  };

  const handleSendAndAdvance = async () => {
    setIsSending(true);
    try {
      // Send the message
      await sendMessage?.(jobId, candidate.id, draftMessage);
      // Move to engaged stage
      await updateCandidateStage(jobId, candidate.id, "engaged");
      onAdvance?.();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleWait = async () => {
    // Keep in "new" stage but mark as reviewed
    markStepComplete(2);
    updateWorkflowStep?.(candidate.id, 2, true);
  };

  const handleArchive = async () => {
    try {
      await updateCandidateStage(jobId, candidate.id, "archived" as any);
      onAdvance?.();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      const newCompleted = [...completedSteps, step];
      setCompletedSteps(newCompleted);
      updateWorkflowStep?.(candidate.id, step, true);
    }
  };

  const handleStepToggle = (step: number) => {
    setExpandedStep(expandedStep === step ? -1 : step);
  };

  const getRecommendationStyle = (rec: string | undefined) => {
    switch (rec) {
      case "reach_out":
        return { color: "green", variant: "filled" as const };
      case "wait":
        return { color: "yellow", variant: "light" as const };
      case "archive":
        return { color: "red", variant: "light" as const };
      default:
        return { color: "gray", variant: "light" as const };
    }
  };

  const jobRequirements = currentJob?.filters || {};

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <Stack gap="md">
          {/* Candidate Header */}
          <Group justify="space-between">
            <div>
              <Text size="lg" fw={600}>
                {candidate.name}
              </Text>
              {candidate.headline && (
                <Text size="sm" c="dimmed">
                  {candidate.headline}
                </Text>
              )}
            </div>
            {candidate.aiRecommendation && (
              <Badge
                size="lg"
                {...getRecommendationStyle(candidate.aiRecommendation)}
              >
                AI: {candidate.aiRecommendation === "reach_out"
                  ? "Reach Out"
                  : candidate.aiRecommendation === "wait"
                  ? "Wait"
                  : "Archive"}
              </Badge>
            )}
          </Group>

          <Divider />

          {/* Step 1: Review AI Analysis */}
          <WorkflowStep
            stepNumber={1}
            title="Review AI Analysis"
            description="See how well this candidate matches your requirements"
            icon={<IconSearch size={16} />}
            isExpanded={expandedStep === 0}
            isCompleted={completedSteps.includes(0)}
            isActive={expandedStep === 0}
            isLoading={isAnalyzing}
            onToggle={() => handleStepToggle(0)}
          >
            <Stack gap="lg">
              {/* Fit Score Gauge */}
              <FitScoreGauge
                score={candidate.aiFitScore || candidate.matchScore || 0}
                confidence={85}
                summary={candidate.aiSummary}
                isLoading={isAnalyzing}
              />

              {/* Profile with Matching Highlights */}
              <Divider label="Profile Details" labelPosition="left" />

              <Stack gap="sm">
                <Group>
                  <Text size="sm" fw={500} w={100}>
                    Experience:
                  </Text>
                  <Badge
                    variant={
                      jobRequirements.experience?.includes(candidate.experience)
                        ? "filled"
                        : "light"
                    }
                    color={
                      jobRequirements.experience?.includes(candidate.experience)
                        ? "green"
                        : "gray"
                    }
                  >
                    {candidate.experience}
                  </Badge>
                </Group>

                <Group>
                  <Text size="sm" fw={500} w={100}>
                    Location:
                  </Text>
                  <Badge
                    variant={
                      jobRequirements.location?.includes(candidate.location)
                        ? "filled"
                        : "light"
                    }
                    color={
                      jobRequirements.location?.includes(candidate.location)
                        ? "green"
                        : "gray"
                    }
                  >
                    {candidate.location}
                  </Badge>
                </Group>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Skills:
                  </Text>
                  <Group gap="xs">
                    {candidate.skills.map((skill) => {
                      const isMatch = jobRequirements.skills?.includes(skill);
                      return (
                        <Badge
                          key={skill}
                          variant={isMatch ? "filled" : "light"}
                          color={isMatch ? "green" : "gray"}
                          size="sm"
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </Group>
                </div>

                {candidate.resume && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Resume Summary:
                    </Text>
                    <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                      {candidate.resume}
                    </Text>
                  </div>
                )}
              </Stack>

              {!completedSteps.includes(0) && (
                <Button
                  variant="light"
                  onClick={() => markStepComplete(0)}
                  leftSection={<IconCheck size={16} />}
                >
                  Mark as Reviewed
                </Button>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 2: Draft Outreach Message */}
          <WorkflowStep
            stepNumber={2}
            title="Draft Outreach Message"
            description="Compose a personalized message to reach out"
            icon={<IconMail size={16} />}
            isExpanded={expandedStep === 1}
            isCompleted={completedSteps.includes(1)}
            isActive={expandedStep === 1}
            isLoading={isDrafting}
            onToggle={() => handleStepToggle(1)}
          >
            <Stack gap="md">
              <AIMessageEditor
                value={draftMessage}
                onChange={(val) => {
                  setDraftMessage(val);
                  saveDraftMessage?.(candidate.id, val);
                }}
                onGenerate={handleGenerateMessage}
                onRegenerateSelection={handleRegenerateSelection}
                placeholder="Write your outreach message here, or click Generate to let AI help..."
                isLoading={isDrafting}
                label="Outreach Message"
              />

              {draftMessage && !completedSteps.includes(1) && (
                <Button
                  variant="light"
                  onClick={() => markStepComplete(1)}
                  leftSection={<IconCheck size={16} />}
                >
                  Message Ready
                </Button>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 3: Take Action */}
          <WorkflowStep
            stepNumber={3}
            title="Take Action"
            description="Decide how to proceed with this candidate"
            icon={<IconCheck size={16} />}
            isExpanded={expandedStep === 2}
            isCompleted={completedSteps.includes(2)}
            isActive={expandedStep === 2}
            onToggle={() => handleStepToggle(2)}
          >
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Choose an action based on your review:
              </Text>

              <Group>
                <Button
                  color="green"
                  variant={candidate.aiRecommendation === "reach_out" ? "filled" : "light"}
                  leftSection={<IconMail size={16} />}
                  onClick={handleSendAndAdvance}
                  loading={isSending}
                  disabled={!draftMessage}
                >
                  Reach Out
                  {candidate.aiRecommendation === "reach_out" && " (Recommended)"}
                </Button>

                <Button
                  color="yellow"
                  variant={candidate.aiRecommendation === "wait" ? "filled" : "light"}
                  leftSection={<IconClock size={16} />}
                  onClick={handleWait}
                >
                  Wait
                  {candidate.aiRecommendation === "wait" && " (Recommended)"}
                </Button>

                <Button
                  color="red"
                  variant="subtle"
                  leftSection={<IconArchive size={16} />}
                  onClick={handleArchive}
                >
                  Archive
                </Button>
              </Group>

              {!draftMessage && (
                <Text size="xs" c="dimmed">
                  Draft a message in Step 2 before reaching out.
                </Text>
              )}
            </Stack>
          </WorkflowStep>
        </Stack>
      </ScrollArea>
    </Card>
  );
};

export default NewStageWorkflow;

