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
} from "@mantine/core";
import {
  IconMessages,
  IconSend,
  IconCalendar,
  IconArrowRight,
  IconArchive,
  IconCheck,
} from "@tabler/icons-react";
import useJobStore, { Candidate, Message } from "../../../stores/jobStore";
import WorkflowStep from "./WorkflowStep";
import ConversationThread from "./ConversationThread";
import AIMessageEditor from "./AIMessageEditor";
import CalendlyEmbed from "./CalendlyEmbed";

interface EngagedStageWorkflowProps {
  jobId: string;
  candidate: Candidate;
  onAdvance?: () => void;
}

const EngagedStageWorkflow = ({
  jobId,
  candidate,
  onAdvance,
}: EngagedStageWorkflowProps) => {
  const {
    summarizeConversation,
    suggestNextMessage,
    updateCandidateStage,
    getWorkflowState,
    updateWorkflowStep,
    saveDraftMessage,
    sendMessage,
  } = useJobStore();

  const [expandedStep, setExpandedStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Mock conversation history - in production this would come from the candidate
  const conversationHistory: Message[] = candidate.conversationHistory || [];

  // AI-extracted insights (mock)
  const aiInsights = [
    { text: "Interested in remote work", type: "interest" as const },
    { text: "Available to start in 2 weeks", type: "availability" as const },
    { text: "Expecting $150k-$170k", type: "salary" as const },
  ];

  // Calculate engagement metrics
  const messageCount = conversationHistory.length;
  const daysInStage = 3; // Mock - would calculate from actual data

  // Load workflow state
  useEffect(() => {
    const state = getWorkflowState?.(candidate.id);
    if (state) {
      setCompletedSteps(state.completedSteps || []);
      setExpandedStep(state.currentStep || 0);
      if (state.draftMessage) {
        setDraftMessage(state.draftMessage);
      }
      if (state.scheduledInterview) {
        setIsScheduled(true);
      }
    }
  }, [candidate.id, getWorkflowState]);

  const handleGenerateResponse = async () => {
    setIsDrafting(true);
    try {
      const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || "";
      const message = await suggestNextMessage(jobId, candidate.id, lastMessage);
      setDraftMessage(message);
      saveDraftMessage?.(candidate.id, message);
    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendMessage = async () => {
    setIsSending(true);
    try {
      await sendMessage?.(jobId, candidate.id, draftMessage);
      setDraftMessage("");
      markStepComplete(1);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduled = (scheduledTime: string) => {
    setIsScheduled(true);
    markStepComplete(2);
    // Generate confirmation message
    const date = new Date(scheduledTime);
    setConfirmationMessage(
      `Hi ${candidate.name.split(" ")[0]},\n\nGreat news! I've scheduled our interview for ${date.toLocaleDateString(
        "en-US",
        { weekday: "long", month: "long", day: "numeric" }
      )} at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}.\n\nLooking forward to speaking with you!\n\nBest regards`
    );
  };

  const handleSendConfirmation = async () => {
    setIsSending(true);
    try {
      await sendMessage?.(jobId, candidate.id, confirmationMessage);
      setConfirmationMessage("");
    } catch (error) {
      console.error("Failed to send confirmation:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAdvanceToClosing = async () => {
    try {
      await updateCandidateStage(jobId, candidate.id, "closing");
      onAdvance?.();
    } catch (error) {
      console.error("Failed to advance:", error);
    }
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
            <Group gap="xs">
              <Badge variant="light" color="blue">
                {messageCount} messages
              </Badge>
              <Badge variant="outline" color="gray">
                {daysInStage} days
              </Badge>
            </Group>
          </Group>

          <Divider />

          {/* Step 1: Review Conversation */}
          <WorkflowStep
            stepNumber={1}
            title="Review Conversation"
            description="See the full conversation history and AI insights"
            icon={<IconMessages size={16} />}
            isExpanded={expandedStep === 0}
            isCompleted={completedSteps.includes(0)}
            isActive={expandedStep === 0}
            onToggle={() => handleStepToggle(0)}
          >
            <Stack gap="md">
              <ConversationThread
                messages={conversationHistory}
                candidateName={candidate.name}
                aiInsights={conversationHistory.length > 0 ? aiInsights : []}
              />

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

          {/* Step 2: Respond */}
          <WorkflowStep
            stepNumber={2}
            title="Respond"
            description="Send a follow-up message to continue the conversation"
            icon={<IconSend size={16} />}
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
                onGenerate={handleGenerateResponse}
                placeholder="Write your response..."
                isLoading={isDrafting}
                label="Your Response"
              />

              {draftMessage && (
                <Button
                  color="blue"
                  leftSection={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  loading={isSending}
                >
                  Send Message
                </Button>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 3: Schedule Interview */}
          <WorkflowStep
            stepNumber={3}
            title="Schedule Interview"
            description="Set up a time to meet with the candidate"
            icon={<IconCalendar size={16} />}
            isExpanded={expandedStep === 2}
            isCompleted={completedSteps.includes(2)}
            isActive={expandedStep === 2}
            onToggle={() => handleStepToggle(2)}
          >
            <Stack gap="md">
              <CalendlyEmbed
                candidateName={candidate.name}
                onScheduled={handleScheduled}
              />

              {/* Confirmation Message */}
              {isScheduled && confirmationMessage && (
                <>
                  <Divider label="Confirmation Message" labelPosition="left" />
                  <AIMessageEditor
                    value={confirmationMessage}
                    onChange={setConfirmationMessage}
                    onGenerate={async () => {}}
                    label="Interview Confirmation"
                    minRows={4}
                  />
                  <Button
                    color="blue"
                    leftSection={<IconSend size={16} />}
                    onClick={handleSendConfirmation}
                    loading={isSending}
                  >
                    Send Confirmation
                  </Button>
                </>
              )}
            </Stack>
          </WorkflowStep>

          {/* Step 4: Advance or Archive */}
          <WorkflowStep
            stepNumber={4}
            title="Advance or Archive"
            description="Move the candidate to the next stage or remove from pipeline"
            icon={<IconArrowRight size={16} />}
            isExpanded={expandedStep === 3}
            isCompleted={completedSteps.includes(3)}
            isActive={expandedStep === 3}
            onToggle={() => handleStepToggle(3)}
          >
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Ready to move this candidate to the closing stage?
              </Text>

              <Group>
                <Button
                  color="green"
                  leftSection={<IconArrowRight size={16} />}
                  onClick={handleAdvanceToClosing}
                >
                  Move to Closing
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
            </Stack>
          </WorkflowStep>
        </Stack>
      </ScrollArea>
    </Card>
  );
};

export default EngagedStageWorkflow;

