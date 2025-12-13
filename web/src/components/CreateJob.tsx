import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Title,
  Button,
  Card,
  Text,
  Group,
  Stack,
  Box,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBriefcase,
  IconBuilding,
  IconFileDescription,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";
import useJobStore from "../stores/jobStore";

const EXPERIENCE_OPTIONS = [
  { value: "0-2 years", label: "0-2 years" },
  { value: "2-3 years", label: "2-3 years" },
  { value: "3-5 years", label: "3-5 years" },
  { value: "5-7 years", label: "5-7 years" },
  { value: "7-10 years", label: "7-10 years" },
  { value: "10+ years", label: "10+ years" },
];

const LOCATION_OPTIONS = [
  { value: "Remote", label: "Remote" },
  { value: "Sydney", label: "Sydney" },
  { value: "Melbourne", label: "Melbourne" },
  { value: "Brisbane", label: "Brisbane" },
  { value: "Perth", label: "Perth" },
  { value: "Adelaide", label: "Adelaide" },
  { value: "Canberra", label: "Canberra" },
];

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob, loading, error, clearError } = useJobStore();

  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Validation state
  const [touched, setTouched] = useState({
    title: false,
    company: false,
    description: false,
  });

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isValid = title.trim() && company.trim() && description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Mark all fields as touched
    setTouched({
      title: true,
      company: true,
      description: true,
    });

    if (!isValid) return;

    try {
      const newJob = await createJob({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        filters: {
          experience: experienceLevels,
          location: locations,
          skills: [],
        },
      });
      // Navigate to the new job's detail page
      navigate(`/jobs/${newJob.id}`);
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        py="lg"
        px={{ base: "md", sm: "xl", md: 48 }}
        style={{
          background: "white",
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <Group gap="md">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Group>
      </Box>

      {/* Main Content */}
      <Box
        p="xl"
        px={{ base: "md", sm: "xl", md: 48 }}
        style={{
          flex: 1,
          background: "#fafafa",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ maxWidth: 720, margin: "0 auto" }}
        >
          <Stack gap="xl">
            {/* Page Title */}
            <div>
              <Title order={2} c="dark" mb={4}>
                Create New Job
              </Title>
              <Text size="sm" c="dimmed">
                Fill in the details below. Our AI will automatically extract skills and requirements from your description.
              </Text>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Error creating job"
                color="red"
                variant="light"
                withCloseButton
                onClose={clearError}
              >
                {error}
              </Alert>
            )}

            {/* Form Card */}
            <Card
              shadow="xs"
              padding="xl"
              radius="lg"
              style={{
                background: "white",
                border: "1px solid #e9ecef",
              }}
            >
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  {/* Job Title */}
                  <TextInput
                    label="Job Title"
                    placeholder="e.g. Senior Frontend Engineer"
                    leftSection={<IconBriefcase size={16} style={{ color: "#868e96" }} />}
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    onBlur={() => handleBlur("title")}
                    error={touched.title && !title.trim() && "Job title is required"}
                    required
                    size="md"
                  />

                  {/* Company Name */}
                  <TextInput
                    label="Company Name"
                    placeholder="e.g. Acme Corp"
                    leftSection={<IconBuilding size={16} style={{ color: "#868e96" }} />}
                    value={company}
                    onChange={(e) => setCompany(e.currentTarget.value)}
                    onBlur={() => handleBlur("company")}
                    error={touched.company && !company.trim() && "Company name is required"}
                    required
                    size="md"
                  />

                  {/* Job Description */}
                  <Textarea
                    label="Job Description"
                    description="Describe the role, responsibilities, and requirements. Our AI will extract key skills and keywords."
                    placeholder="We are looking for an experienced engineer to join our team..."
                    leftSection={<IconFileDescription size={16} style={{ color: "#868e96" }} />}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    onBlur={() => handleBlur("description")}
                    error={touched.description && !description.trim() && "Job description is required"}
                    required
                    minRows={6}
                    autosize
                    size="md"
                  />

                  {/* Optional Filters Section */}
                  <Box
                    p="md"
                    style={{
                      background: "#f8f9fa",
                      borderRadius: 8,
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <Text size="sm" fw={500} c="dark" mb="md">
                      Optional Preferences
                    </Text>
                    <Group grow align="flex-start">
                      {/* Experience Levels */}
                      <MultiSelect
                        label="Experience Levels"
                        placeholder="Select experience levels"
                        leftSection={<IconClock size={16} style={{ color: "#868e96" }} />}
                        data={EXPERIENCE_OPTIONS}
                        value={experienceLevels}
                        onChange={setExperienceLevels}
                        clearable
                        size="sm"
                      />

                      {/* Locations */}
                      <MultiSelect
                        label="Preferred Locations"
                        placeholder="Select locations"
                        leftSection={<IconMapPin size={16} style={{ color: "#868e96" }} />}
                        data={LOCATION_OPTIONS}
                        value={locations}
                        onChange={setLocations}
                        clearable
                        size="sm"
                      />
                    </Group>
                  </Box>

                  {/* Submit Actions */}
                  <Group justify="flex-end" mt="md">
                    <Button
                      variant="subtle"
                      color="gray"
                      onClick={() => navigate("/dashboard")}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="dark"
                      disabled={loading}
                      leftSection={loading ? <Loader size={16} color="white" /> : null}
                    >
                      {loading ? "Creating..." : "Create Job"}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default CreateJob;

