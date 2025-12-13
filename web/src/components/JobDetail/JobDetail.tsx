import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Container,
  Title,
  Button,
  Text,
  Group,
  Loader,
  Alert,
  Card,
  Tabs,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconUsers, IconWand } from "@tabler/icons-react";
import useJobStore from "../../stores/jobStore";
import { hasActiveFilters } from "../../utils/candidateUtils";
import CompactFilterBar from "./CompactFilterBar";
import CandidatePoolBubble from "./CandidatePoolBubble";
import CandidateSidePanel from "./CandidateSidePanel";
import StarredDrawer from "./StarredDrawer";
import CandidateListView from "./CandidateListView";
import HiringWorkflow from "./Hiring/HiringWorkflow";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listViewOpen, setListViewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pool");
  const {
    currentJob,
    candidates,
    filteredCandidates,
    activeFilters,
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
  
  // Show filteredCandidates count if filters are active, otherwise show all
  const displayCount = hasActiveFilters(activeFilters) ? filteredCandidates.length : candidates.length;

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Group justify="space-between" mb="xl">
          <Group gap="md">
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/")}
            >
              Back
            </Button>
            <div>
              <Title order={2}>{currentJob.title}</Title>
              <Text size="sm" c="dimmed">
                {currentJob.company} • Created {formatDate(currentJob.createdAt)}
              </Text>
            </div>
          </Group>
        </Group>
      </motion.div>

      {/* Tabs for Pool/Pipeline Views */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card shadow="sm" padding={activeTab === "hiring" ? "md" : "xl"} radius="md" withBorder>
          <Tabs value={activeTab} onChange={(val) => setActiveTab(val || "pool")}>
            <Tabs.List mb="md">
              <Tabs.Tab value="pool" leftSection={<IconUsers size={14} />}>
                Pool
              </Tabs.Tab>
              <Tabs.Tab value="hiring" leftSection={<IconWand size={14} />}>
                Hiring Workflow
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="pool">
              {/* Search Bar */}
              <CompactFilterBar />
              
              {/* Bubble Visualization */}
              <CandidatePoolBubble 
                totalCount={candidates.length}
                filteredCount={displayCount}
                jobId={id || ""}
                onBubbleClick={() => setListViewOpen(true)}
              />
            </Tabs.Panel>

            <Tabs.Panel value="hiring">
              {id && (
                <HiringWorkflow 
                  jobId={id} 
                  onNavigateToPool={() => setActiveTab("pool")}
                />
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>
      </motion.div>

      {/* Starred Drawer */}
      {id && starredCount > 0 && <StarredDrawer jobId={id} />}

      {/* Candidate List Modal */}
      <CandidateListView
        opened={listViewOpen}
        onClose={() => setListViewOpen(false)}
        jobId={id || ""}
      />

      {/* Side Panel for individual candidate */}
      <CandidateSidePanel />
    </Container>
  );
};

export default JobDetail;
