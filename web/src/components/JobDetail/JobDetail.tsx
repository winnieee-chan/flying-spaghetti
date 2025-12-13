import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Container,
  Title,
  Button,
  Text,
  Group,
  Stack,
  Loader,
  Alert,
  Paper,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconStar } from "@tabler/icons-react";
import useJobStore from "../../stores/jobStore";
import FilterBar from "./FilterBar";
import CandidateBubbles from "./CandidateBubbles";
import CandidateSidePanel from "./CandidateSidePanel";
import StarredDrawer from "./StarredDrawer";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentJob,
    candidates,
    filteredCandidates,
    loading,
    error,
    fetchJob,
    fetchCandidates,
    getStarredCandidates,
  } = useJobStore();

  useEffect(() => {
    if (id) {
      fetchJob(id);
      fetchCandidates(id);
    }
  }, [id, fetchJob, fetchCandidates]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !currentJob) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" h={400}>
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (error && !currentJob) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error loading job"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!currentJob) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Job not found"
          color="red"
          variant="light"
        >
          The job you're looking for doesn't exist.
        </Alert>
      </Container>
    );
  }

  const starredCount = id ? getStarredCandidates(id).length : 0;
  const displayCandidates = filteredCandidates.length > 0 ? filteredCandidates : candidates;

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Group mb="xl" align="flex-start">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/")}
          >
            Back
          </Button>
          <Stack gap="xs" style={{ flex: 1 }}>
            <Title order={1}>{currentJob.title}</Title>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                {currentJob.company}
              </Text>
              <Text size="sm" c="dimmed">
                Created {formatDate(currentJob.createdAt)}
              </Text>
            </Group>
          </Stack>
        </Group>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Paper shadow="sm" p="md" radius="md" withBorder mb="xl">
          <FilterBar />
        </Paper>
      </motion.div>

      {/* Bubble Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          withBorder
          style={{ minHeight: "500px", position: "relative" }}
          mb="xl"
        >
          <CandidateBubbles candidates={displayCandidates} jobId={id || ""} />
        </Paper>
      </motion.div>

      {/* Starred Drawer */}
      {id && starredCount > 0 && <StarredDrawer jobId={id} />}

      {/* Side Panel */}
      <CandidateSidePanel />
    </Container>
  );
};

export default JobDetail;

