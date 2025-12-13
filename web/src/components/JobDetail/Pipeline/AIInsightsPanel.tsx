import { useState, useEffect } from "react";
import {
  Card,
  Stack,
  Text,
  Badge,
  Button,
  Group,
  Divider,
  Collapse,
  ActionIcon,
  Textarea,
  Alert,
} from "@mantine/core";
import { IconSparkles, IconChevronDown, IconChevronUp, IconSend, IconClock } from "@tabler/icons-react";
import useJobStore from "../../../stores/jobStore";
import { Candidate } from "../../../stores/jobStore";

interface AIInsightsPanelProps {
  candidate: Candidate;
  jobId: string;
}

const AIInsightsPanel = ({ candidate, jobId }: AIInsightsPanelProps) => {
  const {
    analyzeCandidate,
    draftFirstMessage,
    summarizeConversation,
    suggestNextMessage,
    suggestInterviewTimes,
    draftOffer,
    helpNegotiate,
    generateDecisionSummary,
  } = useJobStore();

  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [draftedMessage, setDraftedMessage] = useState<string>("");
  const [conversationSummary, setConversationSummary] = useState<string>("");
  const [suggestedMessage, setSuggestedMessage] = useState<string>("");
  const [suggestedTimes, setSuggestedTimes] = useState<Date[]>([]);
  const [offerDraft, setOfferDraft] = useState<string>("");
  const [negotiationHelp, setNegotiationHelp] = useState<string>("");
  const [decisionSummary, setDecisionSummary] = useState<string>("");

  const stage = candidate.pipelineStage || "new";

  // Auto-analyze when candidate enters "new" stage
  useEffect(() => {
    if (stage === "new" && !candidate.aiFitScore && !loading) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, candidate.id, candidate.aiFitScore]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await analyzeCandidate(jobId, candidate.id);
    } catch (error) {
      console.error("Failed to analyze candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftMessage = async () => {
    setLoading(true);
    try {
      const message = await draftFirstMessage(jobId, candidate.id);
      setDraftedMessage(message);
    } catch (error) {
      console.error("Failed to draft message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeConversation = async () => {
    setLoading(true);
    try {
      const summary = await summarizeConversation(jobId, candidate.id);
      setConversationSummary(summary);
    } catch (error) {
      console.error("Failed to summarize conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestNextMessage = async () => {
    setLoading(true);
    try {
      const lastMessage = candidate.conversationHistory?.[candidate.conversationHistory.length - 1]?.content || "";
      const message = await suggestNextMessage(jobId, candidate.id, lastMessage);
      setSuggestedMessage(message);
    } catch (error) {
      console.error("Failed to suggest message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTimes = async () => {
    setLoading(true);
    try {
      const times = await suggestInterviewTimes(jobId, candidate.id);
      setSuggestedTimes(times);
    } catch (error) {
      console.error("Failed to suggest times:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftOffer = async () => {
    setLoading(true);
    try {
      const offer = await draftOffer(jobId, candidate.id);
      setOfferDraft(offer);
    } catch (error) {
      console.error("Failed to draft offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec?: string) => {
    if (!rec) return "gray";
    if (rec === "reach_out" || rec === "advance" || rec === "offer") return "green";
    if (rec === "wait") return "yellow";
    return "red";
  };

  const getRecommendationLabel = (rec?: string) => {
    if (!rec) return "No recommendation";
    const labels: Record<string, string> = {
      reach_out: "Reach Out",
      wait: "Wait",
      archive: "Archive",
      advance: "Advance",
      offer: "Make Offer",
      reject: "Reject",
    };
    return labels[rec] || rec;
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <IconSparkles size={18} color="var(--mantine-color-blue-6)" />
          <Text fw={600} size="sm">
            AI Insights
          </Text>
        </Group>
        <ActionIcon
          variant="subtle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </ActionIcon>
      </Group>

      <Collapse in={expanded}>
        {stage === "new" && (
          <Stack gap="md">
            {candidate.aiFitScore !== undefined && (
              <>
                <Group>
                  <Text size="sm" fw={500}>
                    AI Fit Score:
                  </Text>
                  <Badge
                    size="lg"
                    color={
                      candidate.aiFitScore >= 80
                        ? "green"
                        : candidate.aiFitScore >= 60
                        ? "yellow"
                        : "gray"
                    }
                  >
                    {candidate.aiFitScore}%
                  </Badge>
                  {candidate.aiRecommendation && (
                    <Badge
                      color={getRecommendationColor(candidate.aiRecommendation)}
                      variant="light"
                    >
                      {getRecommendationLabel(candidate.aiRecommendation)}
                    </Badge>
                  )}
                </Group>

                {candidate.aiSummary && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Analysis:
                    </Text>
                    <Text size="sm" c="dimmed">
                      {candidate.aiSummary}
                    </Text>
                  </div>
                )}

                <Divider />

                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconSend size={16} />}
                  onClick={handleDraftMessage}
                  loading={loading}
                  fullWidth
                >
                  Draft First Message
                </Button>

                {draftedMessage && (
                  <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                    <Text size="xs" fw={500} mb="xs">
                      AI-Drafted Message:
                    </Text>
                    <Textarea
                      value={draftedMessage}
                      onChange={(e) => setDraftedMessage(e.target.value)}
                      minRows={4}
                      maxRows={8}
                    />
                    <Button size="xs" mt="xs" fullWidth>
                      Copy Message
                    </Button>
                  </Card>
                )}
              </>
            )}

            {!candidate.aiFitScore && (
              <Button
                variant="light"
                onClick={handleAnalyze}
                loading={loading}
                fullWidth
              >
                Analyze Candidate
              </Button>
            )}
          </Stack>
        )}

        {stage === "engaged" && (
          <Stack gap="md">
            <Button
              variant="light"
              color="blue"
              onClick={handleSummarizeConversation}
              loading={loading}
              fullWidth
            >
              Summarize Conversation
            </Button>

            {conversationSummary && (
              <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                <Text size="xs" fw={500} mb="xs">
                  Conversation Summary:
                </Text>
                <Text size="sm" c="dimmed">
                  {conversationSummary}
                </Text>
              </Card>
            )}

            <Divider />

            <Button
              variant="light"
              color="blue"
              leftSection={<IconSend size={16} />}
              onClick={handleSuggestNextMessage}
              loading={loading}
              fullWidth
            >
              Suggest Next Message
            </Button>

            {suggestedMessage && (
              <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                <Text size="xs" fw={500} mb="xs">
                  Suggested Message:
                </Text>
                <Textarea
                  value={suggestedMessage}
                  onChange={(e) => setSuggestedMessage(e.target.value)}
                  minRows={3}
                  maxRows={6}
                />
                <Button size="xs" mt="xs" fullWidth>
                  Use Message
                </Button>
              </Card>
            )}

            <Button
              variant="light"
              leftSection={<IconClock size={16} />}
              onClick={handleSuggestTimes}
              loading={loading}
              fullWidth
            >
              Suggest Interview Times
            </Button>

            {suggestedTimes.length > 0 && (
              <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                <Text size="xs" fw={500} mb="xs">
                  Suggested Times:
                </Text>
                <Stack gap="xs">
                  {suggestedTimes.slice(0, 4).map((time, i) => (
                    <Button
                      key={i}
                      size="xs"
                      variant="outline"
                      fullWidth
                    >
                      {time.toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Button>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        )}

        {stage === "closing" && (
          <Stack gap="md">
            <Button
              variant="light"
              color="blue"
              onClick={handleDraftOffer}
              loading={loading}
              fullWidth
            >
              Draft Offer Letter
            </Button>

            {offerDraft && (
              <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                <Text size="xs" fw={500} mb="xs">
                  Offer Draft:
                </Text>
                <Textarea
                  value={offerDraft}
                  onChange={(e) => setOfferDraft(e.target.value)}
                  minRows={6}
                  maxRows={10}
                />
                <Button size="xs" mt="xs" fullWidth>
                  Use Offer
                </Button>
              </Card>
            )}

            <Divider />

            <Text size="sm" fw={500}>
              Negotiation Help
            </Text>
            <Textarea
              placeholder="Enter candidate's request or question..."
              minRows={2}
              onBlur={async (e) => {
                if (e.target.value) {
                  setLoading(true);
                  try {
                    const help = await helpNegotiate(jobId, candidate.id, e.target.value);
                    setNegotiationHelp(help);
                  } catch (error) {
                    console.error("Failed to get negotiation help:", error);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />

            {negotiationHelp && (
              <Alert color="blue" variant="light">
                <Text size="sm">{negotiationHelp}</Text>
              </Alert>
            )}

            <Divider />

            <Group grow>
              <Button
                variant="light"
                color="green"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const summary = await generateDecisionSummary(jobId, candidate.id, "hire");
                    setDecisionSummary(summary);
                  } catch (error) {
                    console.error("Failed to generate summary:", error);
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
              >
                Generate Hire Summary
              </Button>
              <Button
                variant="light"
                color="red"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const summary = await generateDecisionSummary(jobId, candidate.id, "reject");
                    setDecisionSummary(summary);
                  } catch (error) {
                    console.error("Failed to generate summary:", error);
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
              >
                Generate Reject Summary
              </Button>
            </Group>

            {decisionSummary && (
              <Card padding="sm" withBorder style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                <Text size="xs" fw={500} mb="xs">
                  Decision Summary:
                </Text>
                <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                  {decisionSummary}
                </Text>
              </Card>
            )}
          </Stack>
        )}
      </Collapse>
    </Card>
  );
};

export default AIInsightsPanel;

