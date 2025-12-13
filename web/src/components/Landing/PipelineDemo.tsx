import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Text, Card, Badge } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

const PipelineDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const stages = [
    { id: "applied", label: "Applied", color: "#64748b", count: 24 },
    { id: "screening", label: "Screening", color: "#3b82f6", count: 12 },
    { id: "interview", label: "Interview", color: "#8b5cf6", count: 8 },
    { id: "offer", label: "Offer", color: "#10b981", count: 3 },
    { id: "hired", label: "Hired", color: "#d4af37", count: 1 },
  ];

  const candidates = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    name: `Candidate ${i + 1}`,
    role: ["Engineer", "Designer", "PM", "Analyst"][i % 4],
    stage: stages[Math.floor(Math.random() * stages.length)].id,
  }));

  const x = useTransform(scrollXProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section
      id="demo"
      style={{
        minHeight: "100vh",
        padding: "8rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "5rem" }}
      >
        <Text
          className="landing-headline"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            marginBottom: "1rem",
            color: "#f5f5f0",
          }}
        >
          Visual Pipeline Management
        </Text>
        <Text
          size="lg"
          style={{
            color: "#a1a1aa",
            fontFamily: "'Satoshi', sans-serif",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Drag and drop candidates through your hiring pipeline. See progress at a glance.
        </Text>
      </motion.div>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "2rem 0",
          overflowX: "auto",
          overflowY: "visible",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {stages.map((stage, stageIndex) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: stageIndex * 0.1, duration: 0.5 }}
            style={{
              minWidth: "320px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Stage Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "1rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Text
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#f5f5f0",
                }}
              >
                {stage.label}
              </Text>
              <Badge
                size="lg"
                style={{
                  background: stage.color,
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {stage.count}
              </Badge>
            </div>

            {/* Candidate Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {candidates
                .filter((c) => c.stage === stage.id)
                .slice(0, 4)
                .map((candidate, cardIndex) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: cardIndex * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    style={{ cursor: "grab" }}
                  >
                    <Card
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.75rem",
                        padding: "1.25rem",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}dd 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconUser size={24} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: "'Satoshi', sans-serif",
                              fontWeight: 600,
                              color: "#f5f5f0",
                              fontSize: "0.95rem",
                            }}
                          >
                            {candidate.name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "'Satoshi', sans-serif",
                              color: "#a1a1aa",
                              fontSize: "0.875rem",
                            }}
                          >
                            {candidate.role}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          textAlign: "center",
          marginTop: "3rem",
        }}
      >
        <Text
          size="sm"
          style={{
            color: "#a1a1aa",
            fontFamily: "'Satoshi', sans-serif",
            opacity: 0.6,
          }}
        >
          ← Scroll to explore →
        </Text>
      </motion.div>
    </section>
  );
};

export default PipelineDemo;

