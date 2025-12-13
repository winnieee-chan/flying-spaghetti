import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Container,
  Title,
  Button,
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Alert,
  Grid,
  Badge,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertCircle, IconPlus, IconCalendar, IconUsers, IconSearch } from "@tabler/icons-react";
import useJobStore from "../stores/jobStore";

interface Job {
  id: string;
  title: string;
  description?: string;
  company: string;
  createdAt: string;
  candidateCount?: number;
  filters?: {
    experience?: string[];
    location?: string[];
    skills?: string[];
  };
  message?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobs, loading, error, fetchJobs } = useJobStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job: Job) => {
    if (!debouncedSearch.trim()) {
      return true;
    }

    const searchLower = debouncedSearch.toLowerCase();
    
    // Search in title
    if (job.title.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in company
    if (job.company.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in description
    if (job.description?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in skills
    if (job.filters?.skills?.some((skill) => skill.toLowerCase().includes(searchLower))) {
      return true;
    }
    
    return false;
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" h={400}>
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error loading jobs"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack gap="md" mb="xl">
        <Group justify="space-between">
          <Title order={1}>Jobs Dashboard</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/jobs/new")}
          >
            Create Job
          </Button>
        </Group>
        
        {/* Search Input */}
        <TextInput
          placeholder="Search jobs by title, company, description, or skills..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          size="md"
        />
        
        {/* Results Count */}
        {jobs.length > 0 && (
          <Text size="sm" c="dimmed">
            {debouncedSearch.trim() ? (
              <>Showing {filteredJobs.length} of {jobs.length} job{jobs.length !== 1 ? "s" : ""}</>
            ) : (
              <>Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}</>
            )}
          </Text>
        )}
      </Stack>

      {/* Empty State */}
      {filteredJobs.length === 0 && jobs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                No jobs found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                No jobs match your search query. Try adjusting your search terms.
              </Text>
              {debouncedSearch && (
                <Button
                  variant="light"
                  onClick={() => setSearchQuery("")}
                  mt="md"
                >
                  Clear Search
                </Button>
              )}
            </Stack>
          </Card>
        </motion.div>
      ) : filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                No jobs yet
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Get started by creating your first job posting.
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate("/jobs/new")}
                mt="md"
              >
                Create Job
              </Button>
            </Stack>
          </Card>
        </motion.div>
      ) : (
        /* Job Cards Grid */
        <Grid>
          {filteredJobs.map((job: Job, index: number) => (
            <Grid.Col key={job.id} span={{ base: 12, sm: 6, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <div>
                      <Title order={3} mb={4}>
                        {job.title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {job.company}
                      </Text>
                    </div>

                    <Group gap="md">
                      <Group gap={4}>
                        <IconCalendar size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
                        <Text size="sm" c="dimmed">
                          {formatDate(job.createdAt)}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <IconUsers size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
                        <Text size="sm" c="dimmed">
                          {job.candidateCount || 0} candidates
                        </Text>
                      </Group>
                    </Group>

                    {job.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {job.description}
                      </Text>
                    )}

                    {job.candidateCount && job.candidateCount > 0 && (
                      <Badge color="blue" variant="light">
                        {job.candidateCount} candidate{job.candidateCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;

