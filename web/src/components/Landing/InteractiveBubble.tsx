import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Text, Badge, Group } from "@mantine/core";
import { IconUsers, IconFilter } from "@tabler/icons-react";

interface InteractiveBubbleProps {
  onFilterChange?: (filters: string[]) => void;
}

const InteractiveBubble = ({ onFilterChange }: InteractiveBubbleProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Demo data
  const totalCount = 1247;
  const filteredCount = activeFilters.length > 0 
    ? Math.floor(totalCount * (0.3 + Math.random() * 0.2)) 
    : totalCount;

  const percentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 100;
  const isFiltered = activeFilters.length > 0;

  // Mouse tracking with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x, y });
        mouseX.set(x * 0.1);
        mouseY.set(y * 0.1);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleFilterClick = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const demoFilters = ["React", "TypeScript", "San Francisco", "Remote", "5+ years"];

  const smoothSpring = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  };

  const splitSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 22,
    mass: 0.8,
  };

  const singleBubbleSize = 400;
  const totalBubbleSize = 280;
  const filteredBubbleSize = Math.max(200, 200 + (percentage * 0.6));

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "600px",
        position: "relative",
        width: "100%",
        padding: "2rem",
      }}
    >
      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          position: "absolute",
          top: 0,
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {demoFilters.map((filter, index) => {
          const isActive = activeFilters.includes(filter);
          return (
            <motion.div
              key={filter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, ...smoothSpring }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                size="lg"
                variant={isActive ? "filled" : "light"}
                color={isActive ? "violet" : "gray"}
                style={{
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  textTransform: "none",
                }}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </Badge>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bubbles Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "500px",
          position: "relative",
          width: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          {/* Single Bubble */}
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
                style={{
                  width: singleBubbleSize,
                  height: singleBubbleSize,
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid rgba(255, 255, 255, 0.2)",
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)",
                  boxShadow: "0 0 80px rgba(124, 58, 237, 0.5), 0 0 160px rgba(124, 58, 237, 0.3)",
                }}
                animate={{
                  x: springX,
                  y: springY,
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <IconUsers size={40} color="rgba(255,255,255,0.7)" style={{ marginBottom: 12 }} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <Text
                    size="4rem"
                    fw={900}
                    style={{
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 30px rgba(0,0,0,0.4)",
                      textAlign: "center",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {totalCount.toLocaleString()}
                  </Text>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  <Text
                    size="lg"
                    fw={500}
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      textShadow: "0 1px 10px rgba(0,0,0,0.2)",
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    candidates
                  </Text>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Split Bubbles */}
          {isFiltered && (
            <motion.div
              key="split-bubbles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3rem",
              }}
            >
              {/* Total Pool */}
              <motion.div
                initial={{ x: 150, scale: 0.6, opacity: 0 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: 150, scale: 0.5, opacity: 0 }}
                transition={splitSpring}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Total Pool
                </Text>
                <motion.div
                  style={{
                    width: totalBubbleSize,
                    height: totalBubbleSize,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid rgba(255, 255, 255, 0.1)",
                    background: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
                    boxShadow: "0 0 50px rgba(100, 116, 139, 0.4)",
                  }}
                  animate={{
                    x: springX.get() * 0.5,
                    y: springY.get() * 0.5,
                  }}
                >
                  <IconUsers size={24} color="rgba(255,255,255,0.6)" style={{ marginBottom: 8 }} />
                  <Text
                    size="2.5rem"
                    fw={700}
                    style={{
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 15px rgba(0,0,0,0.3)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {totalCount.toLocaleString()}
                  </Text>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    total
                  </Text>
                </motion.div>
              </motion.div>

              {/* Filter Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15, ...smoothSpring }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <IconFilter size={20} color="#a1a1aa" />
                <Text size="xs" c="dimmed" fw={600} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  {Math.round(percentage)}%
                </Text>
              </motion.div>

              {/* Filtered Results */}
              <motion.div
                initial={{ x: -150, scale: 0.6, opacity: 0 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: -150, scale: 0.5, opacity: 0 }}
                transition={splitSpring}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                  position: "relative",
                }}
              >
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Matches
                </Text>
                <motion.div
                  style={{
                    width: filteredBubbleSize,
                    height: filteredBubbleSize,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid rgba(255, 255, 255, 0.2)",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                    boxShadow: "0 0 60px rgba(16, 185, 129, 0.5), 0 0 120px rgba(16, 185, 129,0.3)",
                  }}
                  animate={{
                    x: springX.get() * 0.7,
                    y: springY.get() * 0.7,
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Text
                    size="3rem"
                    fw={900}
                    style={{
                      lineHeight: 1,
                      color: "white",
                      textShadow: "0 2px 25px rgba(0,0,0,0.4)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {filteredCount.toLocaleString()}
                  </Text>
                  <Text
                    size="md"
                    fw={500}
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    {filteredCount === 1 ? "match" : "matches"}
                  </Text>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InteractiveBubble;

