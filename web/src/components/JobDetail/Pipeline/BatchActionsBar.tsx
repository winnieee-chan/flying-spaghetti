import { useState } from "react";
import {
  Card,
  Group,
  Button,
  Modal,
  Select,
  NumberInput,
  Text,
  Stack,
  Alert,
} from "@mantine/core";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";
import { PipelineStage } from "../../../stores/jobStore";

interface BatchActionsBarProps {
  jobId: string;
  stages: PipelineStage[];
}

const BatchActionsBar = ({ jobId, stages }: BatchActionsBarProps) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [minScore, setMinScore] = useState<number | "">(80);
  const [maxScore, setMaxScore] = useState<number | "">(100);
  const [targetStage, setTargetStage] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ count: number; stage: string } | null>(
    null
  );

  const handleAdvance80Plus = () => {
    // Visual only - no implementation
    setProcessing(true);
    setTimeout(() => {
      setResult({ count: 0, stage: "Screening" });
      setProcessing(false);
      setTimeout(() => setResult(null), 3000);
    }, 1000);
  };

  const handleArchiveBelow50 = () => {
    // Visual only - no implementation
    setProcessing(true);
    setTimeout(() => {
      setResult({ count: 0, stage: "Passed" });
      setProcessing(false);
      setTimeout(() => setResult(null), 3000);
    }, 1000);
  };

  const handleCustomMove = () => {
    // Visual only - no implementation
    if (!targetStage) return;
    setProcessing(true);
    setTimeout(() => {
      setResult({ count: 0, stage: stages.find((s) => s.id === targetStage)?.name || "" });
      setCustomModalOpen(false);
      setProcessing(false);
      setTimeout(() => setResult(null), 3000);
    }, 1000);
  };

  return (
    <>
      <Card shadow="sm" padding="sm" radius="md" withBorder mb="md">
        <Group gap="sm" align="center">
          <IconSparkles size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={500}>
            AI Batch Actions:
          </Text>
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={handleAdvance80Plus}
            loading={processing}
            disabled={stages.length < 2}
          >
            Advance 80%+ →
          </Button>
          <Button
            size="xs"
            variant="light"
            color="orange"
            onClick={handleArchiveBelow50}
            loading={processing}
          >
            Archive &lt;50%
          </Button>
          <Button
            size="xs"
            variant="light"
            onClick={() => setCustomModalOpen(true)}
          >
            Custom...
          </Button>
          {result && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="green"
              size="xs"
              style={{ padding: "4px 8px" }}
            >
              Moved {result.count} candidates to {result.stage}
            </Alert>
          )}
        </Group>
      </Card>

      <Modal
        opened={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="Custom Batch Move"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Move candidates based on match score criteria
          </Text>

          <Group grow>
            <NumberInput
              label="Min Score"
              placeholder="0"
              min={0}
              max={100}
              value={minScore}
              onChange={(val) => setMinScore(val)}
            />
            <NumberInput
              label="Max Score"
              placeholder="100"
              min={0}
              max={100}
              value={maxScore}
              onChange={(val) => setMaxScore(val)}
            />
          </Group>

          <Select
            label="Target Stage"
            placeholder="Select stage"
            data={stages.map((s) => ({ value: s.id, label: s.name }))}
            value={targetStage}
            onChange={(val) => setTargetStage(val || "")}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCustomMove}
              loading={processing}
              disabled={!targetStage}
            >
              Move Candidates
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default BatchActionsBar;

