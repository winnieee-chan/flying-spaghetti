import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
  Avatar,
  Box,
  Progress,
} from "@mantine/core";
import { IconAlertCircle, IconPlus, IconCalendar, IconUsers, IconSparkles, IconBriefcase } from "@tabler/icons-react";
import useJobStore from "../stores/jobStore";

// Hardcoded startup owner data - in production this would come from auth/API
const STARTUP_OWNER = {
  companyName: "TechFlow Recruiting",
  logo: "https://api.dicebear.com/7.x/initials/svg?seed=TF&backgroundColor=4c6ef5&fontSize=42",
  plan: "Pro",
  planColor: "violet",
  jobsLimit: 10,
  jobsUsed: 2, // Will be updated from actual jobs count
  features: ["AI-powered matching", "Unlimited candidates", "Priority support"],
};

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
      <Box style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error loading jobs"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const jobsUsed = jobs.length;
  const usagePercent = (jobsUsed / STARTUP_OWNER.jobsLimit) * 100;

  return (
    <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Unified Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Startup Owner Header */}
          <Box
            py="lg"
            px={{ base: "md", sm: "xl", md: 48 }}
            style={{
              background: "white",
              borderBottom: "1px solid #e9ecef",
            }}
          >
            <Group justify="space-between" wrap="wrap" gap="md">
              {/* Company Info */}
              <Group gap="md">
                <Avatar
                  src={STARTUP_OWNER.logo}
                  size={56}
                  radius="md"
                  style={{ 
                    border: "2px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <div>
                  <Text size="xl" fw={700} c="dark">
                    {STARTUP_OWNER.companyName}
                  </Text>
                  <Group gap="xs" mt={4}>
                    <Badge
                      color={STARTUP_OWNER.planColor}
                      variant="light"
                      size="sm"
                      leftSection={<IconSparkles size={12} />}
                    >
                      {STARTUP_OWNER.plan} Plan
                    </Badge>
                    <Text size="xs" c="dimmed">
                      •
                    </Text>
                    <Text size="xs" c="dimmed">
                      {STARTUP_OWNER.features[0]}
                    </Text>
                  </Group>
                </div>
              </Group>

              {/* Plan Usage & Create Button */}
              <Group gap="xl">
                <Box miw={180}>
                  <Group justify="space-between" mb={6}>
                    <Group gap={6}>
                      <IconBriefcase size={14} style={{ color: "#868e96" }} />
                      <Text size="xs" c="dimmed">
                        Jobs Usage
                      </Text>
                    </Group>
                    <Text size="xs" c="dark" fw={500}>
                      {jobsUsed} / {STARTUP_OWNER.jobsLimit}
                    </Text>
                  </Group>
                  <Progress
                    value={usagePercent}
                    size="sm"
                    radius="xl"
                    color={usagePercent > 80 ? "orange" : "violet"}
                    style={{ background: "#e9ecef" }}
                  />
                  {usagePercent >= 80 && (
                    <Text size="xs" c="orange" mt={4}>
                      Approaching limit
                    </Text>
                  )}
                </Box>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate("/jobs/new")}
                  variant="filled"
                  color="dark"
                >
                  Create Job
                </Button>
              </Group>
            </Group>
          </Box>

          {/* Jobs Section */}
          <Box 
            p="xl" 
            px={{ base: "md", sm: "xl", md: 48 }}
            style={{ 
              flex: 1,
              background: "#fafafa",
            }}
          >

            {/* Empty State */}
            {jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flex: 1,
                  minHeight: 300,
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconBriefcase size={36} style={{ color: "#adb5bd" }} />
                  </Box>
                  <Text size="lg" c="dark" fw={600}>
                    No jobs yet
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" maw={280}>
                    Create your first job posting to start attracting candidates.
                  </Text>
                </Stack>
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
                      whileHover={{ y: -2 }}
                      style={{ height: "100%" }}
                    >
                      <Card 
                        shadow="xs" 
                        padding="lg" 
                        radius="lg" 
                        h="100%"
                        style={{ 
                          cursor: 'pointer',
                          background: "white",
                          border: "1px solid #e9ecef",
                          transition: "box-shadow 0.2s ease",
                        }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Stack gap="sm" h="100%">
                          <div>
                            <Title order={4} mb={4} c="dark">
                              {job.title}
                            </Title>
                            <Text size="sm" c="dimmed">
                              {job.company}
                            </Text>
                          </div>

                          <Group gap="lg" mt="xs">
                            <Group gap={6}>
                              <IconCalendar size={14} style={{ color: "#868e96" }} />
                              <Text size="xs" c="dimmed">
                                {formatDate(job.createdAt)}
                              </Text>
                            </Group>
                            <Group gap={6}>
                              <IconUsers size={14} style={{ color: "#868e96" }} />
                              <Text size="xs" c="dimmed">
                                {job.candidateCount || 0} candidates
                              </Text>
                            </Group>
                          </Group>

                          {job.description && (
                            <Text size="sm" c="dimmed" lineClamp={2} mt="xs">
                              {job.description}
                            </Text>
                          )}

                          <Box style={{ marginTop: "auto" }}>
                            {job.candidateCount && job.candidateCount > 0 ? (
                              <Badge 
                                color="violet" 
                                variant="light"
                                size="sm"
                              >
                                {job.candidateCount} candidate{job.candidateCount !== 1 ? "s" : ""}
                              </Badge>
                            ) : (
                              <Badge color="gray" variant="light" size="sm">
                                No candidates yet
                              </Badge>
                            )}
                          </Box>
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Dashboard;

