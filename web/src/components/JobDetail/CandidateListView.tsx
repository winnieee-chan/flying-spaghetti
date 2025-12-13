import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Card,
  TextInput,
  ScrollArea,
  Avatar,
  Grid,
  ActionIcon,
} from "@mantine/core";
import { IconSearch, IconStar, IconStarFilled, IconMapPin, IconBriefcase } from "@tabler/icons-react";
import useJobStore, { type Candidate } from "../../stores/jobStore";
import {
  searchCandidates,
  sortByMatchScore,
  getCandidateStats,
  hasActiveFilters,
} from "../../utils/candidateUtils";

interface CandidateListViewProps {
  opened: boolean;
  onClose: () => void;
  jobId: string;
}

const CandidateListView = ({ opened, onClose, jobId }: CandidateListViewProps) => {
  const { 
    filteredCandidates, 
    candidates,
    activeFilters,
    selectCandidate, 
    toggleStarCandidate, 
    starredCandidates 
  } = useJobStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const starredIds = starredCandidates.get(jobId) || new Set<string>();
  
  // Use filtered candidates from store if filters are active, otherwise all candidates
  const displayCandidates = hasActiveFilters(activeFilters) ? filteredCandidates : candidates;
  
  // Apply local search on top of store filters using shared utility
  const searchedCandidates = useMemo(
    () => searchCandidates(displayCandidates, searchQuery),
    [displayCandidates, searchQuery]
  );
  
  // Sort by match score using shared utility
  const sortedCandidates = useMemo(
    () => sortByMatchScore(searchedCandidates),
    [searchedCandidates]
  );
  
  // Get all stats at once using shared utility
  const stats = useMemo(
    () => getCandidateStats(displayCandidates),
    [displayCandidates]
  );
  
  const { topMatches, locations: locationStats, experiences: experienceStats, skills: topSkills } = stats;

  const handleCandidateClick = (candidate: Candidate) => {
    selectCandidate(candidate);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="sm">
          <Title order={3}>Candidate Pool</Title>
          <Badge size="lg" variant="light" color="blue">
            {displayCandidates.length} candidates
          </Badge>
        </Group>
      }
      styles={{
        body: { padding: 0 },
        header: { padding: "1rem 1.5rem", borderBottom: "1px solid var(--mantine-color-gray-2)" },
      }}
    >
      <Stack gap={0}>
        {/* Summary Stats Section */}
        <Card p="lg" radius={0} style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <Grid>
            {/* Top Matches */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Top Matches</Text>
                <Stack gap={4}>
                  {topMatches.map((candidate, i) => (
                    <Group key={candidate.id} gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" w={16}>{i + 1}.</Text>
                      <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{candidate.name}</Text>
                      <Badge size="xs" color="green" variant="light">
                        {candidate.matchScore}%
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            
            {/* Primary Locations */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Primary Locations</Text>
                <Stack gap={4}>
                  {locationStats.map((stat) => (
                    <Group key={stat.label} gap="xs" wrap="nowrap">
                      <IconMapPin size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                      <Text size="sm" style={{ flex: 1 }}>{stat.label}</Text>
                      <Text size="xs" c="dimmed">{stat.count}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            
            {/* Experience Breakdown */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Experience Levels</Text>
                <Stack gap={4}>
                  {experienceStats.map((stat) => (
                    <Group key={stat.label} gap="xs" wrap="nowrap">
                      <IconBriefcase size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                      <Text size="sm" style={{ flex: 1 }}>{stat.label}</Text>
                      <Text size="xs" c="dimmed">{stat.count}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
          </Grid>
          
          {/* Top Skills */}
          <Stack gap="xs" mt="md">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">Top Skills in Pool</Text>
            <Group gap="xs">
              {topSkills.map((stat) => (
                <Badge key={stat.label} variant="light" color="violet" size="sm">
                  {stat.label} ({stat.count})
                </Badge>
              ))}
            </Group>
          </Stack>
        </Card>
        
        {/* Search Bar */}
        <Card p="md" radius={0} style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <TextInput
            placeholder="Search candidates by name, skills, location..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Text size="xs" c="dimmed" mt="xs">
              Showing {sortedCandidates.length} of {displayCandidates.length} candidates
            </Text>
          )}
        </Card>
        
        {/* Candidate List */}
        <ScrollArea h={400} p="md">
          <Stack gap="sm">
            <AnimatePresence>
              {sortedCandidates.map((candidate, index) => {
                const isStarred = starredIds.has(candidate.id);
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card
                      shadow="xs"
                      padding="sm"
                      radius="md"
                      withBorder
                      style={{ cursor: "pointer" }}
                      onClick={() => handleCandidateClick(candidate)}
                    >
                      <Group wrap="nowrap" justify="space-between">
                        <Group wrap="nowrap" gap="sm">
                          <Avatar 
                            size="md" 
                            color="blue" 
                            radius="xl"
                          >
                            {candidate.name.charAt(0)}
                          </Avatar>
                          <Stack gap={2}>
                            <Group gap="xs">
                              <Text size="sm" fw={500}>{candidate.name}</Text>
                              {candidate.matchScore && candidate.matchScore >= 80 && (
                                <Badge size="xs" color="green" variant="light">
                                  {candidate.matchScore}% match
                                </Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {candidate.headline}
                            </Text>
                            <Group gap={4}>
                              <Text size="xs" c="dimmed">{candidate.location}</Text>
                              <Text size="xs" c="dimmed">•</Text>
                              <Text size="xs" c="dimmed">{candidate.experience}</Text>
                            </Group>
                          </Stack>
                        </Group>
                        <Group gap="xs">
                          <Group gap={4}>
                            {candidate.skills.slice(0, 2).map(skill => (
                              <Badge key={skill} size="xs" variant="outline" color="gray">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 2 && (
                              <Badge size="xs" variant="outline" color="gray">
                                +{candidate.skills.length - 2}
                              </Badge>
                            )}
                          </Group>
                          <ActionIcon
                            variant="subtle"
                            color={isStarred ? "yellow" : "gray"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarCandidate(jobId, candidate.id);
                            }}
                          >
                            {isStarred ? <IconStarFilled size={18} /> : <IconStar size={18} />}
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default CandidateListView;

