import { useMemo } from "react";
import { motion } from "framer-motion";
import { Text, Stack, Group, Badge } from "@mantine/core";
import useJobStore from "../../stores/jobStore";
import { getSkillDistribution, getLocationDistribution } from "../../utils/candidateUtils";

interface CandidatePoolBubbleProps {
  totalCount: number;
  filteredCount: number;
  jobId: string;
  onBubbleClick: () => void;
}

const CandidatePoolBubble = ({ totalCount, filteredCount, jobId, onBubbleClick }: CandidatePoolBubbleProps) => {
  const { filteredCandidates, starredCandidates } = useJobStore();
  
  const starredIds = starredCandidates.get(jobId) || new Set<string>();
  const starredCount = Array.from(starredIds).filter(id => 
    filteredCandidates.some(c => c.id === id)
  ).length;

  // Calculate bubble size based on filtered percentage
  const percentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 100;
  
  // Size ranges from 150px (0%) to 400px (100%)
  const minSize = 150;
  const maxSize = 400;
  const bubbleSize = minSize + ((maxSize - minSize) * (percentage / 100));
  
  // Color intensity based on percentage
  const hue = 250; // Purple base
  const saturation = 70 + (percentage * 0.2); // 70-90%
  const lightness = 45 + ((100 - percentage) * 0.15); // Gets lighter as it shrinks

  const bubbleColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const glowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;

  // Get skill distribution using shared utility
  const skillDistribution = useMemo(
    () => getSkillDistribution(filteredCandidates, 5),
    [filteredCandidates]
  );

  // Get location distribution using shared utility
  const locationDistribution = useMemo(
    () => getLocationDistribution(filteredCandidates, 4),
    [filteredCandidates]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "500px",
        gap: "2rem",
      }}
    >
      {/* Main Pool Bubble */}
      <motion.div
        layout
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{
            width: bubbleSize,
            height: bubbleSize,
            backgroundColor: bubbleColor,
            boxShadow: `0 0 ${bubbleSize * 0.2}px ${glowColor}, 0 0 ${bubbleSize * 0.4}px ${glowColor}`,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
          style={{
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "3px solid rgba(255, 255, 255, 0.2)",
          }}
          whileHover={{ scale: 1.02 }}
          onClick={onBubbleClick}
        >
          <motion.div
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            <Text
              size="3rem"
              fw={700}
              style={{ 
                lineHeight: 1.1,
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              {filteredCount}
            </Text>
            <Text
              size="md"
              fw={500}
              style={{ 
                opacity: 0.9,
                textShadow: "0 1px 5px rgba(0,0,0,0.2)",
              }}
            >
              candidates
            </Text>
            {filteredCount !== totalCount && (
              <Text
                size="xs"
                style={{ 
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                of {totalCount} total
              </Text>
            )}
          </motion.div>
        </motion.div>

        {/* Starred indicator */}
        {starredCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              backgroundColor: "#fbbf24",
              color: "#000",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
            }}
          >
            {starredCount}
          </motion.div>
        )}
      </motion.div>

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
        }}
      >
        {/* Top Skills */}
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>TOP SKILLS</Text>
          <Group gap="xs">
            {skillDistribution.map((stat) => (
              <Badge 
                key={stat.label} 
                variant="light" 
                color="violet"
                size="sm"
              >
                {stat.label} ({stat.count})
              </Badge>
            ))}
          </Group>
        </Stack>

        {/* Locations */}
        <Stack gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>LOCATIONS</Text>
          <Group gap="xs">
            {locationDistribution.map((stat) => (
              <Badge 
                key={stat.label} 
                variant="light" 
                color="blue"
                size="sm"
              >
                {stat.label} ({stat.count})
              </Badge>
            ))}
          </Group>
        </Stack>
      </motion.div>

      {/* Click hint */}
      <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
        Click bubble to browse candidates
      </Text>
    </div>
  );
};

export default CandidatePoolBubble;

