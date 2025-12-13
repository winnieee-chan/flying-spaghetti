import { useState } from "react";
import {
  TextInput,
  Group,
  Badge,
  ActionIcon,
  Stack,
  Button,
  MultiSelect,
  Text,
} from "@mantine/core";
import { IconSearch, IconX, IconPlus } from "@tabler/icons-react";
import useJobStore from "../../stores/jobStore";

const FilterBar = () => {
  const { activeFilters, setActiveFilters, candidates } = useJobStore();
  const [keywordInput, setKeywordInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // Extract unique values from candidates for filter options
  const allSkills = Array.from(
    new Set(candidates.flatMap((c) => c.skills))
  ).sort();
  const allExperiences = Array.from(
    new Set(candidates.map((c) => c.experience))
  ).sort();
  const allLocations = Array.from(
    new Set(candidates.map((c) => c.location))
  ).sort();

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      const newKeywords = [
        ...(activeFilters.keywords || []),
        keywordInput.trim(),
      ];
      setActiveFilters({
        ...activeFilters,
        keywords: newKeywords,
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = (activeFilters.keywords || []).filter(
      (k) => k !== keyword
    );
    setActiveFilters({
      ...activeFilters,
      keywords: newKeywords.length > 0 ? newKeywords : undefined,
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !activeFilters.skills?.includes(skillInput.trim())) {
      const newSkills = [
        ...(activeFilters.skills || []),
        skillInput.trim(),
      ];
      setActiveFilters({
        ...activeFilters,
        skills: newSkills,
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = (activeFilters.skills || []).filter((s) => s !== skill);
    setActiveFilters({
      ...activeFilters,
      skills: newSkills.length > 0 ? newSkills : undefined,
    });
  };

  const handleExperienceChange = (values: string[]) => {
    setActiveFilters({
      ...activeFilters,
      experience: values.length > 0 ? values : undefined,
    });
  };

  const handleLocationChange = (values: string[]) => {
    setActiveFilters({
      ...activeFilters,
      location: values.length > 0 ? values : undefined,
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters =
    (activeFilters.keywords && activeFilters.keywords.length > 0) ||
    (activeFilters.skills && activeFilters.skills.length > 0) ||
    (activeFilters.experience && activeFilters.experience.length > 0) ||
    (activeFilters.location && activeFilters.location.length > 0);

  return (
    <Stack gap="md">
      {/* Keyword Search */}
      <Group gap="xs" align="flex-end">
        <TextInput
          placeholder="Search candidates..."
          leftSection={<IconSearch size={16} />}
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddKeyword();
            }
          }}
          style={{ flex: 1 }}
        />
        <Button onClick={handleAddKeyword} leftSection={<IconPlus size={16} />}>
          Add
        </Button>
      </Group>

      {/* Active Keywords */}
      {activeFilters.keywords && activeFilters.keywords.length > 0 && (
        <Group gap="xs">
          <Text size="sm" fw={500}>
            Keywords:
          </Text>
          {activeFilters.keywords.map((keyword) => (
            <Badge
              key={keyword}
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {keyword}
            </Badge>
          ))}
        </Group>
      )}

      {/* Skills Filter */}
      <Group gap="xs" align="flex-end">
        <TextInput
          placeholder="Add skill filter..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddSkill();
            }
          }}
          style={{ flex: 1 }}
        />
        <Button onClick={handleAddSkill} leftSection={<IconPlus size={16} />}>
          Add
        </Button>
      </Group>

      {/* Active Skills */}
      {activeFilters.skills && activeFilters.skills.length > 0 && (
        <Group gap="xs">
          <Text size="sm" fw={500}>
            Skills:
          </Text>
          {activeFilters.skills.map((skill) => (
            <Badge
              key={skill}
              color="blue"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {skill}
            </Badge>
          ))}
        </Group>
      )}

      {/* Experience Filter */}
      <MultiSelect
        label="Experience"
        placeholder="Select experience levels"
        data={allExperiences}
        value={activeFilters.experience || []}
        onChange={handleExperienceChange}
        clearable
      />

      {/* Location Filter */}
      <MultiSelect
        label="Location"
        placeholder="Select locations"
        data={allLocations}
        value={activeFilters.location || []}
        onChange={handleLocationChange}
        clearable
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="light"
          color="red"
          onClick={handleClearFilters}
          leftSection={<IconX size={16} />}
        >
          Clear All Filters
        </Button>
      )}
    </Stack>
  );
};

export default FilterBar;

