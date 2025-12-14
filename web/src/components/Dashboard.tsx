import { useEffect, useState, useMemo, useRef } from "react";
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
  TextInput,
  Pagination,
  Menu,
  Select,
  ActionIcon,
  Popover,
} from "@mantine/core";
import { IconAlertCircle, IconPlus, IconCalendar, IconUsers, IconSparkles, IconBriefcase, IconSearch, IconChevronDown, IconArrowsSort, IconFilter } from "@tabler/icons-react";
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

type SortField = "date" | "title" | "company" | "candidates" | "description";
type SortDirection = "asc" | "desc";

interface FieldFilter {
  company?: string;
  title?: string;
  description?: string;
  freeText?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobs, loading, error, fetchJobs } = useJobStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldMenuOpened, setFieldMenuOpened] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activePage, setActivePage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 6;

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Reset to page 1 when search query or sort changes
  useEffect(() => {
    setActivePage(1);
  }, [searchQuery, sortField, sortDirection]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle field append from dropdown - inserts field: at cursor position
  const handleFieldAppend = (field: "company" | "title" | "description") => {
    setFieldMenuOpened(false);
    
    const input = inputRef.current;
    if (!input) return;
    
    const cursorPos = input.selectionStart || searchQuery.length;
    const prefix = `${field}:`;
    
    // Insert prefix at cursor position
    const newQuery = 
      searchQuery.slice(0, cursorPos) + 
      prefix + 
      searchQuery.slice(cursorPos);
    
    setSearchQuery(newQuery);
    
    // Set cursor position after the prefix
    setTimeout(() => {
      const newCursorPos = cursorPos + prefix.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }, 0);
  };

  // Parse multi-field query to extract field:value pairs and free text
  const parseMultiFieldQuery = (query: string): FieldFilter => {
    const trimmed = query.trim();
    if (!trimmed) return {};

    const filters: FieldFilter = {};
    
    // Pattern to match field:value pairs
    // Matches word boundary, field name, colon, then value (non-greedy until next field: or end)
    const fieldPattern = /\b(company|title|description):\s*([^\s](?:[^:]*(?:\s+[^:]+)*?)?)(?=\s+\b(?:company|title|description):|$)/gi;
    
    const matches: Array<{ field: string; value: string; start: number; end: number }> = [];
    let match;
    
    // Find all field:value matches
    while ((match = fieldPattern.exec(trimmed)) !== null) {
      const value = match[2] ? match[2].trim() : "";
      if (value) {
        matches.push({
          field: match[1].toLowerCase(),
          value: value,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    // Extract field filters (last value wins if same field appears multiple times)
    matches.forEach((m) => {
      if (m.field === "company") {
        filters.company = m.value;
      } else if (m.field === "title") {
        filters.title = m.value;
      } else if (m.field === "description") {
        filters.description = m.value;
      }
    });

    // Extract free text (parts not covered by field:value pairs)
    if (matches.length === 0) {
      // No field matches, entire query is free text
      filters.freeText = trimmed;
    } else {
      const freeTextParts: string[] = [];
      let lastEnd = 0;
      
      matches.forEach((m) => {
        if (m.start > lastEnd) {
          const beforeText = trimmed.slice(lastEnd, m.start).trim();
          if (beforeText) {
            freeTextParts.push(beforeText);
          }
        }
        lastEnd = m.end;
      });
      
      // Check for text after last match
      if (lastEnd < trimmed.length) {
        const afterText = trimmed.slice(lastEnd).trim();
        if (afterText) {
          freeTextParts.push(afterText);
        }
      }
      
      if (freeTextParts.length > 0) {
        filters.freeText = freeTextParts.join(" ").trim();
      }
    }

    return filters;
  };

  // Search function to filter jobs with multiple field filters
  const searchJobs = (jobs: Job[], query: string): Job[] => {
    const filters = parseMultiFieldQuery(query);
    
    // If no filters at all, return all jobs
    if (Object.keys(filters).length === 0) {
      return jobs;
    }
    
    return jobs.filter((job) => {
      // Apply company filter if present
      if (filters.company) {
        if (!job.company.toLowerCase().includes(filters.company.toLowerCase())) {
          return false;
        }
      }
      
      // Apply title filter if present
      if (filters.title) {
        if (!job.title.toLowerCase().includes(filters.title.toLowerCase())) {
          return false;
        }
      }
      
      // Apply description filter if present
      if (filters.description) {
        if (!(job.description || "").toLowerCase().includes(filters.description.toLowerCase())) {
          return false;
        }
      }
      
      // Apply free text search across all fields if present
      if (filters.freeText) {
        const searchableText = [
          job.company,
          job.title,
          job.description || "",
        ]
          .join(" ")
          .toLowerCase();
        
        if (!searchableText.includes(filters.freeText.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Sort function
  const sortJobs = (jobs: Job[], field: SortField, direction: SortDirection): Job[] => {
    const sorted = [...jobs].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "company":
          comparison = a.company.localeCompare(b.company);
          break;
        case "candidates":
          comparison = (a.candidateCount || 0) - (b.candidateCount || 0);
          break;
        case "description":
          comparison = (a.description || "").length - (b.description || "").length;
          break;
      }

      return direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  };

  // Filter jobs based on search query
  const filteredJobs = useMemo(
    () => searchJobs(jobs, searchQuery),
    [jobs, searchQuery]
  );

  // Sort filtered jobs
  const sortedJobs = useMemo(
    () => sortJobs(filteredJobs, sortField, sortDirection),
    [filteredJobs, sortField, sortDirection]
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedJobs.length / PAGE_SIZE);
  const paginatedJobs = useMemo(
    () => sortedJobs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE),
    [sortedJobs, activePage]
  );


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
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search Bar and Results Count */}
            {jobs.length > 0 && (
              <Stack gap="md" mb="xl">
                <Group gap="md" align="flex-end" style={{ width: "100%" }}>
                  {/* Search Input with Field Dropdown */}
                  <Popover
                    opened={fieldMenuOpened}
                    onChange={setFieldMenuOpened}
                    position="bottom-start"
                    width={200}
                    withinPortal
                  >
                    <Popover.Target>
                      <TextInput
                        ref={inputRef}
                        placeholder="Search: company:apple title:engineer..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        onFocus={() => setFieldMenuOpened(true)}
                        onBlur={() => setTimeout(() => setFieldMenuOpened(false), 200)}
                        style={{ flex: 1 }}
                        styles={{
                          input: {
                            height: "54px",
                            minHeight: "54px",
                          },
                        }}
                      />
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack gap="xs">
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase">Add field filter</Text>
                        <Box
                          onClick={() => handleFieldAppend("company")}
                          style={{ 
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: 4,
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Text size="sm">Add company:</Text>
                        </Box>
                        <Box
                          onClick={() => handleFieldAppend("title")}
                          style={{ 
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: 4,
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Text size="sm">Add title:</Text>
                        </Box>
                        <Box
                          onClick={() => handleFieldAppend("description")}
                          style={{ 
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: 4,
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Text size="sm">Add description:</Text>
                        </Box>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>

                  {/* Sort Dropdown */}
                  <Select
                    placeholder="Sort by"
                    leftSection={<IconArrowsSort size={16} />}
                    value={`${sortField}-${sortDirection}`}
                    onChange={(value) => {
                      if (value) {
                        const [field, direction] = value.split("-") as [SortField, SortDirection];
                        setSortField(field);
                        setSortDirection(direction);
                      }
                    }}
                    data={[
                      { value: "date-desc", label: "Date (Newest)" },
                      { value: "date-asc", label: "Date (Oldest)" },
                      { value: "title-asc", label: "Title (A-Z)" },
                      { value: "title-desc", label: "Title (Z-A)" },
                      { value: "company-asc", label: "Company (A-Z)" },
                      { value: "company-desc", label: "Company (Z-A)" },
                      { value: "candidates-desc", label: "Candidates (High-Low)" },
                      { value: "candidates-asc", label: "Candidates (Low-High)" },
                      { value: "description-desc", label: "Description (Longest)" },
                      { value: "description-asc", label: "Description (Shortest)" },
                    ]}
                    style={{ width: 180, flexShrink: 0 }}
                    styles={{
                      input: {
                        height: "54px",
                        minHeight: "54px",
                      },
                    }}
                  />
                </Group>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Showing {paginatedJobs.length} of {sortedJobs.length} job{sortedJobs.length !== 1 ? "s" : ""}
                  </Text>
                  {searchQuery && (
                    <Badge variant="light" color="blue" size="sm">
                      {sortedJobs.length} result{sortedJobs.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </Group>
              </Stack>
            )}

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
            ) : sortedJobs.length === 0 ? (
              /* No Search Results */
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
                    <IconSearch size={36} style={{ color: "#adb5bd" }} />
                  </Box>
                  <Text size="lg" c="dark" fw={600}>
                    No jobs found
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" maw={280}>
                    Try adjusting your search query to find what you're looking for.
                  </Text>
                </Stack>
              </motion.div>
            ) : (
              /* Job Cards Grid with Pagination */
              <Box style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <Grid style={{ flex: 1 }}>
                  {paginatedJobs.map((job: Job, index: number) => (
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

                {/* Pagination - Fixed at bottom */}
                {totalPages > 1 && (
                  <Box style={{ marginTop: "auto", paddingTop: "xl" }}>
                    <Group justify="center">
                      <Pagination
                        value={activePage}
                        onChange={setActivePage}
                        total={totalPages}
                        size="md"
                        radius="md"
                        withEdges
                      />
                    </Group>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Dashboard;

