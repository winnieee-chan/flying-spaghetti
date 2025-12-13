import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Stack,
  Textarea,
  Button,
  Group,
  Text,
  Tooltip,
  ActionIcon,
  Skeleton,
  Paper,
} from "@mantine/core";
import { IconSparkles, IconRefresh, IconCopy, IconCheck } from "@tabler/icons-react";

interface AIMessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  onRegenerateSelection?: (selection: string) => Promise<string>;
  placeholder?: string;
  isLoading?: boolean;
  label?: string;
  minRows?: number;
  maxLength?: number;
}

const AIMessageEditor = ({
  value,
  onChange,
  onGenerate,
  onRegenerateSelection,
  placeholder = "Your message...",
  isLoading = false,
  label = "Message",
  minRows = 6,
  maxLength = 2000,
}: AIMessageEditorProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectedText(value.substring(start, end));
        setSelectionRange({ start, end });
      } else {
        setSelectedText("");
        setSelectionRange(null);
      }
    }
  };

  const handleRegenerateSelection = async () => {
    if (!selectedText || !selectionRange || !onRegenerateSelection) return;

    setIsRegenerating(true);
    try {
      const newText = await onRegenerateSelection(selectedText);
      const before = value.substring(0, selectionRange.start);
      const after = value.substring(selectionRange.end);
      onChange(before + newText + after);
      setSelectedText("");
      setSelectionRange(null);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const characterCount = value.length;
  const isOverLimit = maxLength && characterCount > maxLength;

  if (isLoading) {
    return (
      <Stack gap="sm">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        <Skeleton height={150} radius="md" />
        <Group gap="xs">
          <Skeleton height={36} width={120} radius="md" />
          <Skeleton height={36} width={100} radius="md" />
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        <Group gap="xs">
          {value && (
            <Tooltip label={copied ? "Copied!" : "Copy message"}>
              <ActionIcon
                variant="subtle"
                color={copied ? "green" : "gray"}
                onClick={handleCopy}
                size="sm"
              >
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </ActionIcon>
            </Tooltip>
          )}
          <Text size="xs" c={isOverLimit ? "red" : "dimmed"}>
            {characterCount}/{maxLength}
          </Text>
        </Group>
      </Group>

      <div style={{ position: "relative" }}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          placeholder={placeholder}
          minRows={minRows}
          autosize
          styles={{
            input: {
              fontFamily: "inherit",
              lineHeight: 1.6,
            },
          }}
        />

        {/* Selection tooltip */}
        {selectedText && onRegenerateSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <Paper shadow="md" p="xs" radius="md" withBorder>
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {selectedText.length} chars selected
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconRefresh size={12} />}
                  onClick={handleRegenerateSelection}
                  loading={isRegenerating}
                >
                  Regenerate
                </Button>
              </Group>
            </Paper>
          </motion.div>
        )}
      </div>

      <Group gap="xs">
        <Button
          variant="light"
          color="violet"
          leftSection={<IconSparkles size={16} />}
          onClick={onGenerate}
          loading={isLoading}
        >
          {value ? "Regenerate with AI" : "Generate with AI"}
        </Button>
      </Group>

      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <Paper p="md" radius="md" bg="gray.0" withBorder>
            <Text size="xs" c="dimmed" mb="xs">
              Preview
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {value}
            </Text>
          </Paper>
        </motion.div>
      )}
    </Stack>
  );
};

export default AIMessageEditor;

