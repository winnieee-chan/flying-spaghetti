import { useEffect } from "react";
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
} from "@mantine/core";
import { IconAlertCircle, IconPlus, IconCalendar, IconUsers } from "@tabler/icons-react";
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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
      <Group justify="space-between" mb="xl">
        <Title order={1}>Jobs Dashboard</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate("/jobs/new")}
        >
          Create Job
        </Button>
      </Group>

      {/* Empty State */}
      {jobs.length === 0 ? (
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
          {jobs.map((job: Job, index: number) => (
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

