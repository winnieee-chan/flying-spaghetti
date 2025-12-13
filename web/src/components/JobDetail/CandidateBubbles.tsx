import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@mantine/core";
import useJobStore, { type Candidate } from "../../stores/jobStore";

interface CandidateBubblesProps {
  candidates: Candidate[];
  jobId: string;
}

// Calculate bubble size based on match score
const getBubbleSize = (candidate: Candidate): number => {
  const baseSize = 40;
  const scoreBonus = ((candidate.matchScore || 50) / 100) * 40;
  return baseSize + scoreBonus; // 40-80px diameter
};

// Generate random position within canvas (with collision avoidance)
const getRandomPosition = (
  index: number,
  total: number,
  size: number
): { x: number; y: number } => {
  // Use a simple grid-like distribution with some randomness
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  const spacing = 120;
  const baseX = col * spacing + 100;
  const baseY = row * spacing + 100;
  
  // Add some randomness
  const randomOffsetX = (Math.random() - 0.5) * 40;
  const randomOffsetY = (Math.random() - 0.5) * 40;
  
  return {
    x: baseX + randomOffsetX,
    y: baseY + randomOffsetY,
  };
};

const CandidateBubbles = ({ candidates, jobId }: CandidateBubblesProps) => {
  const { selectCandidate, toggleStarCandidate, starredCandidates } =
    useJobStore();

  const starredIds = starredCandidates.get(jobId) || new Set<string>();

  const bubblesWithPositions = useMemo(() => {
    return candidates.map((candidate, index) => {
      const size = getBubbleSize(candidate);
      const position = getRandomPosition(index, candidates.length, size);
      const isStarred = starredIds.has(candidate.id);

      return {
        candidate,
        size,
        position,
        isStarred,
      };
    });
  }, [candidates, starredIds, jobId]);

  if (candidates.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "500px",
          color: "var(--mantine-color-dimmed)",
        }}
      >
        No candidates found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "500px" }}>
      <AnimatePresence>
        {bubblesWithPositions.map(({ candidate, size, position, isStarred }, index) => (
          <motion.div
            key={candidate.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: index * 0.05,
            }}
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size}px`,
              height: `${size}px`,
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectCandidate(candidate)}
          >
            <Tooltip label={candidate.name} withArrow>
              <motion.div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: isStarred
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: isStarred
                    ? "3px solid #fbbf24"
                    : "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: isStarred
                    ? "0 0 20px rgba(251, 191, 36, 0.6), 0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: `${size * 0.3}px`,
                  transition: "all 0.2s",
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  toggleStarCandidate(jobId, candidate.id);
                }}
              >
                {candidate.name.charAt(0).toUpperCase()}
              </motion.div>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CandidateBubbles;

