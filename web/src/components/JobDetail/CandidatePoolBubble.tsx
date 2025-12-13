import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Text, Stack, Group, Badge } from "@mantine/core";
import { IconFilter, IconUsers } from "@tabler/icons-react";
import useJobStore from "../../stores/jobStore";
import { getSkillDistribution, getLocationDistribution, hasActiveFilters } from "../../utils/candidateUtils";

interface CandidatePoolBubbleProps {
  totalCount: number;
  filteredCount: number;
  jobId: string;
  onBubbleClick: () => void;
}

const CandidatePoolBubble = ({ totalCount, filteredCount, jobId, onBubbleClick }: CandidatePoolBubbleProps) => {
  const { filteredCandidates, candidates, starredCandidates, activeFilters, setActiveFilters } = useJobStore();
  
  const starredIds = starredCandidates.get(jobId) || new Set<string>();
  const isFiltered = hasActiveFilters(activeFilters);
  
  // Use correct candidate list based on whether filters are active
  const displayCandidates = isFiltered ? filteredCandidates : candidates;
  const starredCount = Array.from(starredIds).filter(id => 
    displayCandidates.some(c => c.id === id)
  ).length;

  // Handler to add a skill filter
  const handleSkillClick = (skill: string) => {
    const currentSkills = activeFilters.skills || [];
    if (!currentSkills.includes(skill)) {
      setActiveFilters({ ...activeFilters, skills: [...currentSkills, skill] });
    }
  };

  // Handler to add a location filter
  const handleLocationClick = (location: string) => {
    const currentLocations = activeFilters.location || [];
    if (!currentLocations.includes(location)) {
      setActiveFilters({ ...activeFilters, location: [...currentLocations, location] });
    }
  };

  // Calculate filtered percentage
  const percentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 100;
  
  // Bubble sizes
  const totalBubbleSize = 220;
  const filteredBubbleSize = Math.max(160, 160 + (percentage * 0.8));
  const singleBubbleSize = 300;

  // Get skill distribution using shared utility
  const skillDistribution = useMemo(
    () => getSkillDistribution(displayCandidates, 5),
    [displayCandidates]
  );

  // Get location distribution using shared utility
  const locationDistribution = useMemo(
    () => getLocationDistribution(displayCandidates, 4),
    [displayCandidates]
  );

  // Smooth spring config
  const smoothSpring = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  };

  // Faster spring for split/merge
  const splitSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 22,
    mass: 0.8,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "480px",
        paddingTop: "20px", // 20px gap from search bar
      }}
    >
      {/* Bubbles Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "340px",
          position: "relative",
          width: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          {/* Single Bubble (when no filters) */}
          {!isFiltered && (
            <motion.div
              key="single-bubble"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ...smoothSpring, duration: 0.4 }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ 
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0) 0%, rgba(79, 70, 229, 0) 50%, rgba(99, 102, 241, 0) 100%)",
                  boxShadow: "0 0 0px rgba(124, 58, 237, 0)",
                }}
                animate={{ 
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)",
                  boxShadow: "0 0 60px rgba(124, 58, 237, 0.4), 0 0 120px rgba(124, 58, 237, 0.2)",
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  width: singleBubbleSize,
                  height: singleBubbleSize,
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "4px solid rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBubbleClick}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <IconUsers size={28} color="rgba(255,255,255,0.6)" style={{ marginBottom: 6 }} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <Text
                    size="3rem"
                    fw={700}
                    style={{ 
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                      textAlign: "center",
                    }}
                  >
                    {totalCount}
                  </Text>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  <Text
                    size="md"
                    fw={500}
                    style={{ 
                      color: "rgba(255,255,255,0.9)",
                      textShadow: "0 1px 10px rgba(0,0,0,0.2)",
                    }}
                  >
                    candidates
                  </Text>
                </motion.div>
              </motion.div>

              {/* Starred indicator */}
              {starredCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, ...smoothSpring }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "#fbbf24",
                    color: "#000",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
                  }}
                >
                  {starredCount}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Two Bubbles (when filters active) - Split from center */}
          {isFiltered && (
            <motion.div
              key="split-bubbles"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
              }}
            >
              {/* Left Bubble - Total Pool (splits from center to left) */}
              <motion.div
                initial={{ x: 120, scale: 0.6, opacity: 0 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: 120, scale: 0.5, opacity: 0 }}
                transition={splitSpring}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Total Pool
                  </Text>
                </motion.div>
                <motion.div
                  initial={{ 
                    background: "linear-gradient(135deg, rgba(100, 116, 139, 0) 0%, rgba(71, 85, 105, 0) 100%)",
                  }}
                  animate={{ 
                    background: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: totalBubbleSize,
                    height: totalBubbleSize,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 0 40px rgba(100, 116, 139, 0.3)",
                  }}
                >
                  <IconUsers size={20} color="rgba(255,255,255,0.5)" style={{ marginBottom: 4 }} />
                  <Text
                    size="2rem"
                    fw={700}
                    style={{ 
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    {totalCount}
                  </Text>
                  <Text
                    size="xs"
                    fw={500}
                    style={{ 
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    total
                  </Text>
                </motion.div>
              </motion.div>

              {/* Center - Arrow / Flow indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15, ...smoothSpring }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0 0.5rem",
                }}
              >
                <IconFilter size={18} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed" fw={600}>
                  {Math.round(percentage)}%
                </Text>
              </motion.div>

              {/* Right Bubble - Filtered Results (splits from center to right) */}
              <motion.div
                initial={{ x: -120, scale: 0.6, opacity: 0 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: -120, scale: 0.5, opacity: 0 }}
                transition={splitSpring}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  position: "relative",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Filtered
                  </Text>
                </motion.div>
                <motion.div
                  initial={{ 
                    width: filteredBubbleSize,
                    height: filteredBubbleSize,
                    background: filteredCount > 0 
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0) 0%, rgba(5, 150, 105, 0) 100%)"
                      : "linear-gradient(135deg, rgba(239, 68, 68, 0) 0%, rgba(220, 38, 38, 0) 100%)",
                  }}
                  animate={{ 
                    width: filteredBubbleSize,
                    height: filteredBubbleSize,
                    background: filteredCount > 0 
                      ? "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)"
                      : "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
                  }}
                  transition={{ duration: 0.4, ...smoothSpring }}
                  style={{
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "4px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: filteredCount > 0
                      ? "0 0 50px rgba(16, 185, 129, 0.4), 0 0 100px rgba(16, 185, 129, 0.2)"
                      : "0 0 50px rgba(239, 68, 68, 0.4)",
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onBubbleClick}
                >
                  <Text
                    size="2.5rem"
                    fw={700}
                    style={{ 
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {filteredCount}
                  </Text>
                  <Text
                    size="sm"
                    fw={500}
                    style={{ 
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {filteredCount === 1 ? "match" : "matches"}
                  </Text>
                </motion.div>

                {/* Starred indicator on filtered bubble */}
                {starredCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, ...smoothSpring }}
                    style={{
                      position: "absolute",
                      top: 18,
                      right: -8,
                      backgroundColor: "#fbbf24",
                      color: "#000",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
                    }}
                  >
                    {starredCount}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats below bubble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          gap: "3rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "1.5rem",
        }}
      >
        {/* Top Skills */}
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>TOP SKILLS</Text>
          <Group gap="xs">
            {skillDistribution.map((stat) => {
              const isActive = activeFilters.skills?.includes(stat.label);
              return (
                <Badge 
                  key={stat.label} 
                  variant={isActive ? "filled" : "light"}
                  color="violet"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSkillClick(stat.label)}
                >
                  {stat.label} ({stat.count})
                </Badge>
              );
            })}
          </Group>
        </Stack>

        {/* Locations */}
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>LOCATIONS</Text>
          <Group gap="xs">
            {locationDistribution.map((stat) => {
              const isActive = activeFilters.location?.includes(stat.label);
              return (
                <Badge 
                  key={stat.label} 
                  variant={isActive ? "filled" : "light"}
                  color="blue"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLocationClick(stat.label)}
                >
                  {stat.label} ({stat.count})
                </Badge>
              );
            })}
          </Group>
        </Stack>
      </motion.div>

      {/* Click hint */}
      <Text size="xs" c="dimmed" mt="md" style={{ opacity: 0.6 }}>
        {isFiltered ? "Click filtered bubble to browse • Click tags to refine" : "Click bubble to browse • Click tags to filter"}
      </Text>
    </div>
  );
};

export default CandidatePoolBubble;
