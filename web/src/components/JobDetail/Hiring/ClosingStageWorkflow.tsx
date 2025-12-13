import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Card,
  Divider,
  ScrollArea,
  Collapse,
  Paper,
  Textarea,
  SegmentedControl,
} from "@mantine/core";
import {
  IconTimeline,
  IconUsers,
  IconCheck,
  IconX,
  IconMail,
  IconArchive,
  IconChevronDown,
  IconChevronRight,
  IconTrophy,
} from "@tabler/icons-react";
import useJobStore, { Candidate } from "../../../stores/jobStore";
import WorkflowStep from "./WorkflowStep";
import CandidateComparison from "./CandidateComparison";
import AIMessageEditor from "./AIMessageEditor";

interface ClosingStageWorkflowProps {
  jobId: string;
  candidate: Candidate;
  allClosingCandidates: Candidate[];
  onComplete?: () => void;
}

const ClosingStageWorkflow = ({
  jobId,
  candidate,
  allClosingCandidates,
  onComplete,
}: ClosingStageWorkflowProps) => {
  const {
    draftOffer,
    generateDecisionSummary,
    updateCandidateStage,
    getWorkflowState,
    updateWorkflowStep,
    sendMessage,
  } = useJobStore();

  const [expandedStep, setExpandedStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [decision, setDecision] = useState<"hire" | "reject" | null>(null);
  const [offerMessage, setOfferMessage] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(true);

  // Collapsible journey sections
  const [expandedJourney, setExpandedJourney] = useState<string | null>("new");

  // Load workflow state
  useEffect(() => {
    const state = getWorkflowState?.(candidate.id);
    if (state) {
      setCompletedSteps(state.completedSteps || []);
      setExpandedStep(state.currentStep || 0);
      if (state.decision) {
        setDecision(state.decision);
      }
    }
  }, [candidate.id, getWorkflowState]);

  // Other candidates for comparison (excluding current)
  const otherCandidates = allClosingCandidates.filter((c) => c.id !== candidate.id);

  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    try {
      const offer = await draftOffer(jobId, candidate.id);
      setOfferMessage(offer);
    } catch (error) {
      console.error("Failed to generate offer:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRejection = async () => {
    setIsGenerating(true);
    try {
      const summary = await generateDecisionSummary(jobId, candidate.id, "reject");
      setRejectionMessage(summary);
    } catch (error) {
      console.error("Failed to generate rejection:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHire = async () => {
    setIsSending(true);
    try {
      if (offerMessage) {
        await sendMessage?.(jobId, candidate.id, offerMessage);
      }
      await updateCandidateStage(jobId, candidate.id, "hired" as any);
      markStepComplete(3);
      onComplete?.();
    } catch (error) {
      console.error("Failed to complete hire:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReject = async () => {
    setIsSending(true);
    try {
      if (sendFeedback && feedbackMessage) {
        await sendMessage?.(jobId, candidate.id, feedbackMessage);
      }
      await updateCandidateStage(jobId, candidate.id, "rejected" as any);
      markStepComplete(3);
      onComplete?.();
    } catch (error) {
      console.error("Failed to complete rejection:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async () => {
    try {
      await updateCandidateStage(jobId, candidate.id, "archived" as any);
      onComplete?.();
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

  const toggleJourneySection = (section: string) => {
    setExpandedJourney(expandedJourney === section ? null : section);
  };

  // Journey data (mock - would come from actual history)
  const journeyData = {
    new: {
      fitScore: candidate.aiFitScore || candidate.matchScore || 0,
      summary: candidate.aiSummary || "Strong technical background with relevant experience.",
      outreachSent: true,
    },
    engaged: {
      messageCount: candidate.conversationHistory?.length || 3,
      interviewScheduled: true,
      keyInsights: [
        "Interested in the role",
        "Available in 2 weeks",
        "Salary expectations discussed",
      ],
    },
  };

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
            <Badge
              size="lg"
              color={
                candidate.aiFitScore && candidate.aiFitScore >= 75
                  ? "green"
                  : candidate.aiFitScore && candidate.aiFitScore >= 50
                  ? "yellow"
                  : "gray"
              }
            >
              {candidate.aiFitScore || candidate.matchScore || 0}% fit
            </Badge>
          </Group>

          <Divider />

          {/* Step 1: Review Journey */}
          <WorkflowStep
            stepNumber={1}
            title="Review Journey"
            description="See the candidate's full history with your company"
            icon={<IconTimeline size={16} />}
            isExpanded={expandedStep === 0}
            isCompleted={completedSteps.includes(0)}
            isActive={expandedStep === 0}
            onToggle={() => handleStepToggle(0)}
          >
            <Stack gap="md">
              {/* New Phase */}
              <Paper p="md" radius="md" withBorder>
                <Group
                  justify="space-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleJourneySection("new")}
                >
                  <Group gap="sm">
                    <Badge color="blue" variant="light">
                      New
                    </Badge>
                    <Text size="sm" fw={500}>
                      Initial Evaluation
                    </Text>
                  </Group>
                  {expandedJourney === "new" ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </Group>
                <Collapse in={expandedJourney === "new"}>
                  <Stack gap="sm" mt="md">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        AI Fit Score
                      </Text>
                      <Badge size="sm">{journeyData.new.fitScore}%</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Outreach Sent
                      </Text>
                      <Badge size="sm" color="green" variant="light">
                        Yes
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Summary: {journeyData.new.summary}
                    </Text>
                  </Stack>
                </Collapse>
              </Paper>

              {/* Engaged Phase */}
              <Paper p="md" radius="md" withBorder>
                <Group
                  justify="space-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleJourneySection("engaged")}
                >
                  <Group gap="sm">
                    <Badge color="violet" variant="light">
                      Engaged
                    </Badge>
                    <Text size="sm" fw={500}>
                      Conversations & Interviews
                    </Text>
                  </Group>
                  {expandedJourney === "engaged" ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </Group>
                <Collapse in={expandedJourney === "engaged"}>
                  <Stack gap="sm" mt="md">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Messages Exchanged
                      </Text>
                      <Badge size="sm">{journeyData.engaged.messageCount}</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Interview Scheduled
                      </Text>
                      <Badge size="sm" color="green" variant="light">
                        Yes
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Key insights:
                    </Text>
                    <Group gap="xs">
                      {journeyData.engaged.keyInsights.map((insight, i) => (
                        <Badge key={i} size="xs" variant="outline">
                          {insight}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Collapse>
              </Paper>

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

          {/* Step 2: Compare Candidates */}
          <WorkflowStep
            stepNumber={2}
            title="Compare Candidates"
            description="See how this candidate stacks up against others"
            icon={<IconUsers size={16} />}
            isExpanded={expandedStep === 1}
            isCompleted={completedSteps.includes(1)}
            isActive={expandedStep === 1}
            onToggle={() => handleStepToggle(1)}
          >
            <Stack gap="md">
              <CandidateComparison
                currentCandidate={candidate}
                otherCandidates={otherCandidates}
              />

              {!completedSteps.includes(1) && (
                <Button
                  variant="light"
                  onClick={() => markStepComplete(1)}
                  leftSection={<IconCheck size={16} />}
                >
                  Mark as Reviewed
                </Button>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 3: Make Decision */}
          <WorkflowStep
            stepNumber={3}
            title="Make Decision"
            description="Decide whether to hire or pass on this candidate"
            icon={<IconTrophy size={16} />}
            isExpanded={expandedStep === 2}
            isCompleted={completedSteps.includes(2)}
            isActive={expandedStep === 2}
            onToggle={() => handleStepToggle(2)}
          >
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Choose your decision:
              </Text>

              <SegmentedControl
                value={decision || ""}
                onChange={(val) => setDecision(val as "hire" | "reject" | null)}
                data={[
                  { label: "Hire", value: "hire" },
                  { label: "Reject", value: "reject" },
                ]}
                fullWidth
              />

              {/* Hire Flow */}
              {decision === "hire" && (
                <Stack gap="md">
                  <Divider label="Offer Message" labelPosition="left" />
                  <AIMessageEditor
                    value={offerMessage}
                    onChange={setOfferMessage}
                    onGenerate={handleGenerateOffer}
                    placeholder="Write your offer message..."
                    isLoading={isGenerating}
                    label="Informal Offer"
                  />
                </Stack>
              )}

              {/* Reject Flow */}
              {decision === "reject" && (
                <Stack gap="md">
                  <Divider label="Rejection Options" labelPosition="left" />

                  <Group>
                    <Button
                      variant={sendFeedback ? "filled" : "light"}
                      color="blue"
                      size="xs"
                      onClick={() => setSendFeedback(true)}
                    >
                      Send Feedback
                    </Button>
                    <Button
                      variant={!sendFeedback ? "filled" : "light"}
                      color="gray"
                      size="xs"
                      onClick={() => setSendFeedback(false)}
                    >
                      Archive Silently
                    </Button>
                  </Group>

                  {sendFeedback && (
                    <AIMessageEditor
                      value={feedbackMessage}
                      onChange={setFeedbackMessage}
                      onGenerate={handleGenerateRejection}
                      placeholder="Write your rejection message..."
                      isLoading={isGenerating}
                      label="Rejection Message"
                    />
                  )}
                </Stack>
              )}

              {!completedSteps.includes(2) && decision && (
                <Button
                  variant="light"
                  onClick={() => markStepComplete(2)}
                  leftSection={<IconCheck size={16} />}
                >
                  Decision Made
                </Button>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 4: Complete */}
          <WorkflowStep
            stepNumber={4}
            title="Complete"
            description="Finalize your decision and complete the process"
            icon={<IconCheck size={16} />}
            isExpanded={expandedStep === 3}
            isCompleted={completedSteps.includes(3)}
            isActive={expandedStep === 3}
            onToggle={() => handleStepToggle(3)}
          >
            <Stack gap="md">
              {!decision && (
                <Text size="sm" c="dimmed">
                  Make a decision in Step 3 first.
                </Text>
              )}

              {decision === "hire" && (
                <>
                  <Text size="sm" c="dimmed">
                    Ready to extend an offer to {candidate.name}?
                  </Text>
                  <Button
                    color="green"
                    leftSection={<IconMail size={16} />}
                    onClick={handleHire}
                    loading={isSending}
                    disabled={!offerMessage}
                  >
                    Send Offer & Complete
                  </Button>
                </>
              )}

              {decision === "reject" && (
                <>
                  <Text size="sm" c="dimmed">
                    {sendFeedback
                      ? `Ready to send rejection feedback to ${candidate.name}?`
                      : `Archive ${candidate.name} without sending a message?`}
                  </Text>
                  <Group>
                    <Button
                      color="red"
                      variant="light"
                      leftSection={sendFeedback ? <IconMail size={16} /> : <IconArchive size={16} />}
                      onClick={handleReject}
                      loading={isSending}
                      disabled={sendFeedback && !feedbackMessage}
                    >
                      {sendFeedback ? "Send Rejection & Complete" : "Archive & Complete"}
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </WorkflowStep>
        </Stack>
      </ScrollArea>
    </Card>
  );
};

export default ClosingStageWorkflow;

