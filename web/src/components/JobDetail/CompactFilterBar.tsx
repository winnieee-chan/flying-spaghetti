import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextInput,
  Group,
  Badge,
  ActionIcon,
  Paper,
  Text,
  Stack,
  ScrollArea,
  Kbd,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import useJobStore from "../../stores/jobStore";
import { getAllUniqueValues } from "../../utils/candidateUtils";

// Filter types and their colors
const FILTER_TYPES = {
  skill: { color: "violet", prefix: "skill:", label: "Skill" },
  location: { color: "blue", prefix: "location:", label: "Location" },
  loc: { color: "blue", prefix: "loc:", label: "Location" },
  exp: { color: "green", prefix: "exp:", label: "Experience" },
  experience: { color: "green", prefix: "experience:", label: "Experience" },
  keyword: { color: "gray", prefix: "", label: "Keyword" },
} as const;

type FilterType = keyof typeof FILTER_TYPES;

interface ParsedFilter {
  type: FilterType;
  value: string;
  display: string;
}

const CompactFilterBar = () => {
  const { activeFilters, setActiveFilters, candidates, searchQuery, setSearchQuery } = useJobStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique values from candidates using shared utility
  const { skills: allSkills, experiences: allExperiences, locations: allLocations } = useMemo(
    () => getAllUniqueValues(candidates),
    [candidates]
  );

  // Parse the current input to detect filter type
  const parseInput = (input: string): { prefix: string; query: string; type: FilterType } => {
    const lowered = input.toLowerCase();
    
    if (lowered.startsWith("skill:")) {
      return { prefix: "skill:", query: input.slice(6), type: "skill" };
    }
    if (lowered.startsWith("location:")) {
      return { prefix: "location:", query: input.slice(9), type: "location" };
    }
    if (lowered.startsWith("loc:")) {
      return { prefix: "loc:", query: input.slice(4), type: "loc" };
    }
    if (lowered.startsWith("exp:")) {
      return { prefix: "exp:", query: input.slice(4), type: "exp" };
    }
    if (lowered.startsWith("experience:")) {
      return { prefix: "experience:", query: input.slice(11), type: "experience" };
    }
    
    return { prefix: "", query: input, type: "keyword" };
  };

  // Generate suggestions based on input
  const suggestions = useMemo(() => {
    const { type, query } = parseInput(searchQuery);
    const queryLower = query.toLowerCase().trim();
    
    if (!searchQuery.trim()) {
      // Show prefix hints when empty
      return [
        { type: "hint" as const, value: "skill:", label: "skill:React — Filter by skill" },
        { type: "hint" as const, value: "loc:", label: "loc:Sydney — Filter by location" },
        { type: "hint" as const, value: "exp:", label: "exp:5+ years — Filter by experience" },
      ];
    }

    let options: string[] = [];
    
    if (type === "skill") {
      options = allSkills.filter(s => s.toLowerCase().includes(queryLower));
    } else if (type === "location" || type === "loc") {
      options = allLocations.filter(l => l.toLowerCase().includes(queryLower));
    } else if (type === "exp" || type === "experience") {
      options = allExperiences.filter(e => e.toLowerCase().includes(queryLower));
    } else {
      // For keywords, suggest matching skills, locations, and experiences with prefixes
      const skillMatches = allSkills
        .filter(s => s.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .map(s => ({ type: "skill" as FilterType, value: `skill:${s}`, label: s }));
      
      const locMatches = allLocations
        .filter(l => l.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map(l => ({ type: "loc" as FilterType, value: `loc:${l}`, label: l }));
      
      const expMatches = allExperiences
        .filter(e => e.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map(e => ({ type: "exp" as FilterType, value: `exp:${e}`, label: e }));
      
      // Add plain keyword option at top
      if (queryLower) {
        return [
          { type: "keyword" as FilterType, value: queryLower, label: `"${query}" (keyword search)` },
          ...skillMatches,
          ...locMatches,
          ...expMatches,
        ];
      }
      
      return [...skillMatches, ...locMatches, ...expMatches];
    }
    
    return options.slice(0, 8).map(opt => ({
      type,
      value: `${parseInput(searchQuery).prefix}${opt}`,
      label: opt,
    }));
  }, [searchQuery, allSkills, allLocations, allExperiences]);

  // Convert active filters to display badges
  const activeFilterBadges = useMemo((): ParsedFilter[] => {
    const badges: ParsedFilter[] = [];
    
    activeFilters.skills?.forEach(skill => {
      badges.push({ type: "skill", value: skill, display: skill });
    });
    
    activeFilters.location?.forEach(loc => {
      badges.push({ type: "location", value: loc, display: loc });
    });
    
    activeFilters.experience?.forEach(exp => {
      badges.push({ type: "experience", value: exp, display: exp });
    });
    
    activeFilters.keywords?.forEach(keyword => {
      badges.push({ type: "keyword", value: keyword, display: keyword });
    });
    
    return badges;
  }, [activeFilters]);

  // Apply a filter
  const applyFilter = (input: string) => {
    const { type, query } = parseInput(input);
    const value = query.trim();
    
    if (!value) return;
    
    if (type === "skill") {
      const current = activeFilters.skills || [];
      if (!current.includes(value)) {
        setActiveFilters({ ...activeFilters, skills: [...current, value] });
      }
    } else if (type === "location" || type === "loc") {
      const current = activeFilters.location || [];
      if (!current.includes(value)) {
        setActiveFilters({ ...activeFilters, location: [...current, value] });
      }
    } else if (type === "exp" || type === "experience") {
      const current = activeFilters.experience || [];
      if (!current.includes(value)) {
        setActiveFilters({ ...activeFilters, experience: [...current, value] });
      }
    } else {
      const current = activeFilters.keywords || [];
      if (!current.includes(value)) {
        setActiveFilters({ ...activeFilters, keywords: [...current, value] });
      }
    }
    
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedSuggestion(0);
  };

  // Remove a filter
  const removeFilter = (filter: ParsedFilter) => {
    if (filter.type === "skill") {
      const newSkills = (activeFilters.skills || []).filter(s => s !== filter.value);
      setActiveFilters({ ...activeFilters, skills: newSkills.length > 0 ? newSkills : undefined });
    } else if (filter.type === "location" || filter.type === "loc") {
      const newLocs = (activeFilters.location || []).filter(l => l !== filter.value);
      setActiveFilters({ ...activeFilters, location: newLocs.length > 0 ? newLocs : undefined });
    } else if (filter.type === "exp" || filter.type === "experience") {
      const newExps = (activeFilters.experience || []).filter(e => e !== filter.value);
      setActiveFilters({ ...activeFilters, experience: newExps.length > 0 ? newExps : undefined });
    } else {
      const newKeywords = (activeFilters.keywords || []).filter(k => k !== filter.value);
      setActiveFilters({ ...activeFilters, keywords: newKeywords.length > 0 ? newKeywords : undefined });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[selectedSuggestion]) {
        const suggestion = suggestions[selectedSuggestion];
        if ('type' in suggestion && suggestion.type === "hint") {
          setSearchQuery(suggestion.value);
        } else {
          applyFilter(suggestion.value);
        }
      } else if (searchQuery.trim()) {
        applyFilter(searchQuery);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleClearAll = () => {
    setActiveFilters({});
  };

  return (
    <Stack gap="xs">
      <Group gap="sm" wrap="nowrap" style={{ width: "100%" }}>
        {/* Smart Search Input */}
        <div style={{ position: "relative", flex: 1 }}>
          <TextInput
            ref={inputRef}
            placeholder="Search: skill:React, loc:Sydney, exp:5+ years..."
            leftSection={<IconSearch size={16} />}
            size="lg"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedSuggestion(0);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            styles={{
              input: {
                fontFamily: "monospace",
                fontSize: "16px",
                minHeight: "48px",
              },
            }}
          />
          
          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  marginTop: 4,
                }}
              >
                <Paper shadow="md" withBorder p="xs">
                  <ScrollArea.Autosize mah={250}>
                    <Stack gap={2}>
                      {suggestions.map((suggestion, index) => (
                        <Group
                          key={suggestion.value}
                          gap="xs"
                          p="xs"
                          style={{
                            borderRadius: 4,
                            cursor: "pointer",
                            backgroundColor: index === selectedSuggestion 
                              ? "var(--mantine-color-blue-light)" 
                              : "transparent",
                          }}
                          onMouseEnter={() => setSelectedSuggestion(index)}
                          onClick={() => {
                            if ('type' in suggestion && suggestion.type === "hint") {
                              setSearchQuery(suggestion.value);
                              inputRef.current?.focus();
                            } else {
                              applyFilter(suggestion.value);
                            }
                          }}
                        >
                          {'type' in suggestion && suggestion.type !== "hint" && (
                            <Badge 
                              size="xs" 
                              variant="light" 
                              color={FILTER_TYPES[suggestion.type]?.color || "gray"}
                            >
                              {FILTER_TYPES[suggestion.type]?.label || suggestion.type}
                            </Badge>
                          )}
                          <Text size="sm" style={{ flex: 1 }}>
                            {suggestion.label}
                          </Text>
                          {index === selectedSuggestion && (
                            <Kbd size="xs">↵</Kbd>
                          )}
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea.Autosize>
                  <Text size="xs" c="dimmed" mt="xs" ta="center">
                    Use ↑↓ to navigate, Enter to select
                  </Text>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All */}
        {activeFilterBadges.length > 0 && (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={handleClearAll}
          >
            <IconX size={14} />
          </ActionIcon>
        )}
      </Group>

      {/* Active Filters Display */}
      {activeFilterBadges.length > 0 && (
        <Group gap="xs">
          <AnimatePresence>
            {activeFilterBadges.map((filter) => (
              <motion.div
                key={`${filter.type}-${filter.value}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge
                  size="sm"
                  variant="light"
                  color={FILTER_TYPES[filter.type]?.color || "gray"}
                  leftSection={
                    <Text size="xs" fw={600} span>
                      {FILTER_TYPES[filter.type]?.label}:
                    </Text>
                  }
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color={FILTER_TYPES[filter.type]?.color || "gray"}
                      onClick={() => removeFilter(filter)}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  {filter.display}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </Group>
      )}
    </Stack>
  );
};

export default CompactFilterBar;
