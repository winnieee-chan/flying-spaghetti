import { motion } from "framer-motion";
import {
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Avatar,
  SimpleGrid,
  Progress,
  Divider,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Candidate } from "../../../stores/jobStore";

interface CandidateComparisonProps {
  currentCandidate: Candidate;
  otherCandidates: Candidate[];
}

const CandidateComparison = ({
  currentCandidate,
  otherCandidates,
}: CandidateComparisonProps) => {
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

  const compareSkills = (candidate: Candidate) => {
    const currentSkills = new Set(currentCandidate.skills);
    const otherSkills = candidate.skills;
    const shared = otherSkills.filter((s) => currentSkills.has(s));
    return {
      shared: shared.length,
      total: Math.max(currentCandidate.skills.length, otherSkills.length),
    };
  };

  if (otherCandidates.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder bg="gray.0">
        <Text size="sm" c="dimmed" ta="center">
          No other candidates in the Closing stage to compare.
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Current Candidate Highlight */}
      <Card padding="md" radius="md" withBorder bg="blue.0">
        <Group gap="sm">
          <Avatar size="md" radius="xl" color="blue">
            {currentCandidate.avatar ? (
              <img src={currentCandidate.avatar} alt={currentCandidate.name} />
            ) : (
              getInitials(currentCandidate.name)
            )}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Group gap="xs">
              <Text size="sm" fw={600}>
                {currentCandidate.name}
              </Text>
              <Badge size="xs" color="blue">
                Current
              </Badge>
            </Group>
            {currentCandidate.headline && (
              <Text size="xs" c="dimmed">
                {currentCandidate.headline}
              </Text>
            )}
          </div>
          <Badge
            size="lg"
            color={getScoreColor(currentCandidate.aiFitScore || currentCandidate.matchScore || 0)}
          >
            {currentCandidate.aiFitScore || currentCandidate.matchScore || 0}%
          </Badge>
        </Group>
      </Card>

      <Text size="sm" fw={500}>
        Compare with other candidates in Closing:
      </Text>

      {/* Comparison Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {otherCandidates.slice(0, 4).map((candidate, index) => {
          const currentScore = currentCandidate.aiFitScore || currentCandidate.matchScore || 0;
          const otherScore = candidate.aiFitScore || candidate.matchScore || 0;
          const scoreDiff = currentScore - otherScore;
          const skillsComparison = compareSkills(candidate);

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card padding="md" radius="md" withBorder>
                <Stack gap="sm">
                  {/* Header */}
                  <Group gap="sm">
                    <Avatar size="sm" radius="xl" color="gray">
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
                    </div>
                  </Group>

                  <Divider />

                  {/* Fit Score Comparison */}
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">
                        Fit Score
                      </Text>
                      <Group gap={4}>
                        <Badge size="xs" color={getScoreColor(otherScore)}>
                          {otherScore}%
                        </Badge>
                        {scoreDiff !== 0 && (
                          <Badge
                            size="xs"
                            variant="light"
                            color={scoreDiff > 0 ? "green" : "red"}
                          >
                            {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} vs current
                          </Badge>
                        )}
                      </Group>
                    </Group>
                    <Progress value={otherScore} color={getScoreColor(otherScore)} size="sm" />
                  </div>

                  {/* Experience */}
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Experience
                    </Text>
                    <Group gap={4}>
                      <Text size="xs">{candidate.experience}</Text>
                      {candidate.experience === currentCandidate.experience ? (
                        <IconCheck size={12} color="var(--mantine-color-green-5)" />
                      ) : (
                        <IconX size={12} color="var(--mantine-color-gray-4)" />
                      )}
                    </Group>
                  </Group>

                  {/* Skills Overlap */}
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Skills Overlap
                    </Text>
                    <Badge size="xs" variant="light">
                      {skillsComparison.shared}/{skillsComparison.total} shared
                    </Badge>
                  </Group>

                  {/* Location */}
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Location
                    </Text>
                    <Text size="xs">{candidate.location}</Text>
                  </Group>
                </Stack>
              </Card>
            </motion.div>
          );
        })}
      </SimpleGrid>

      {otherCandidates.length > 4 && (
        <Text size="xs" c="dimmed" ta="center">
          +{otherCandidates.length - 4} more candidates in Closing
        </Text>
      )}
    </Stack>
  );
};

export default CandidateComparison;

