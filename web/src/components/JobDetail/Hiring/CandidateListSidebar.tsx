import { motion } from "framer-motion";
import {
  Card,
  Text,
  Group,
  Stack,
  Avatar,
  Badge,
  ScrollArea,
  TextInput,
  Select,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { Candidate } from "../../../stores/jobStore";

interface CandidateListSidebarProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onCandidateSelect: (candidate: Candidate) => void;
  currentStage: "new" | "engaged" | "closing";
  getStepStatus?: (candidateId: string) => string;
}

const CandidateListSidebar = ({
  candidates,
  selectedCandidateId,
  onCandidateSelect,
  currentStage,
  getStepStatus,
}: CandidateListSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | null>("match");

  const filteredAndSortedCandidates = useMemo(() => {
    let result = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.headline?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "match") {
      result = [...result].sort(
        (a, b) => (b.aiFitScore || b.matchScore || 0) - (a.aiFitScore || a.matchScore || 0)
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [candidates, searchQuery, sortBy]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "green";
    if (score >= 50) return "yellow";
    return "red";
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "new":
        return "Evaluate & Reach Out";
      case "engaged":
        return "Converse & Schedule";
      case "closing":
        return "Decide & Offer";
      default:
        return stage;
    }
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        width: "300px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm">
          {getStageLabel(currentStage)}
        </Text>
        <Badge variant="light" color="blue">
          {candidates.length}
        </Badge>
      </Group>

      {/* Search and Sort */}
      <Stack gap="xs" mb="md">
        <TextInput
          placeholder="Search candidates..."
          size="xs"
          leftSection={<IconSearch size={14} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <Select
          size="xs"
          placeholder="Sort by"
          value={sortBy}
          onChange={setSortBy}
          data={[
            { value: "match", label: "Match Score" },
            { value: "name", label: "Name" },
          ]}
        />
      </Stack>

      {/* Candidate List */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <Stack gap="xs">
          {filteredAndSortedCandidates.map((candidate) => {
            const isSelected = selectedCandidateId === candidate.id;
            const score = candidate.aiFitScore || candidate.matchScore || 0;
            const stepStatus = getStepStatus?.(candidate.id);

            return (
              <motion.div
                key={candidate.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  padding="sm"
                  radius="sm"
                  withBorder
                  style={{
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "var(--mantine-color-blue-0)"
                      : "var(--mantine-color-gray-0)",
                    borderColor: isSelected
                      ? "var(--mantine-color-blue-4)"
                      : undefined,
                  }}
                  onClick={() => onCandidateSelect(candidate)}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Avatar size="md" radius="xl" color="blue">
                      {candidate.avatar ? (
                        <img src={candidate.avatar} alt={candidate.name} />
                      ) : (
                        getInitials(candidate.name)
                      )}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {candidate.name}
                      </Text>
                      {candidate.headline && (
                        <Text size="xs" c="dimmed" truncate>
                          {candidate.headline}
                        </Text>
                      )}
                      <Group gap={4} mt={4}>
                        <Badge
                          size="xs"
                          color={getScoreColor(score)}
                          variant="light"
                        >
                          {score}% match
                        </Badge>
                        {stepStatus && (
                          <Badge size="xs" variant="outline" color="gray">
                            {stepStatus}
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                </Card>
              </motion.div>
            );
          })}

          {filteredAndSortedCandidates.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              {searchQuery
                ? "No candidates match your search"
                : "No candidates in this stage"}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Card>
  );
};

export default CandidateListSidebar;

