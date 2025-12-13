import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Text, Card } from "@mantine/core";
import { IconSparkles, IconUsers, IconFilter, IconLayoutKanban } from "@tabler/icons-react";

const FeaturesBento = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      id: 1,
      title: "AI-Powered Matching",
      description: "Our intelligent system analyzes candidate profiles and job requirements to find the perfect matches instantly.",
      icon: IconSparkles,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
      span: { base: 12, sm: 6, md: 4 },
      delay: 0,
    },
    {
      id: 2,
      title: "Smart Filtering",
      description: "Filter candidates by skills, location, experience, and more with our intuitive bubble visualization.",
      icon: IconFilter,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      span: { base: 12, sm: 6, md: 4 },
      delay: 0.1,
    },
    {
      id: 3,
      title: "Pipeline Management",
      description: "Track candidates through every stage with our visual kanban board. Drag, drop, and organize effortlessly.",
      icon: IconLayoutKanban,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      span: { base: 12, sm: 6, md: 4 },
      delay: 0.2,
    },
    {
      id: 4,
      title: "AI Interview Questions",
      description: "Generate tailored interview questions powered by AI. Get insights that help you make better hiring decisions.",
      icon: IconSparkles,
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      span: { base: 12, sm: 12, md: 6 },
      delay: 0.3,
    },
    {
      id: 5,
      title: "Candidate Pool Analytics",
      description: "Visualize your candidate pool with interactive bubbles. See how filters transform your search results in real-time.",
      icon: IconUsers,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      span: { base: 12, sm: 12, md: 6 },
      delay: 0.4,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      },
    }),
  };

  return (
    <section
      id="features"
      style={{
        minHeight: "100vh",
        padding: "8rem 2rem",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
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
          Everything You Need
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
          Powerful features designed to make recruiting effortless and efficient.
        </Text>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "1.5rem",
        }}
        className="features-grid"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          const isWide = feature.span.md === 6;
          
          return (
            <motion.div
              key={feature.id}
              custom={feature.delay}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                gridColumn: `span ${isWide ? 6 : 4}`,
                gridRow: isWide ? "span 1" : "span 1",
              }}
              className="feature-card"
              whileHover={{ 
                y: -8,
                rotateY: 2,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Card
                style={{
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "1.5rem",
                  padding: "2.5rem",
                  backdropFilter: "blur(10px)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: feature.gradient,
                    opacity: 0,
                    borderRadius: "1.5rem",
                    zIndex: 0,
                  }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <motion.div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "1rem",
                      background: feature.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon size={32} color="white" />
                  </motion.div>

                  <Text
                    className="landing-headline"
                    style={{
                      fontSize: "1.75rem",
                      marginBottom: "1rem",
                      color: "#f5f5f0",
                    }}
                  >
                    {feature.title}
                  </Text>

                  <Text
                    style={{
                      color: "#a1a1aa",
                      fontFamily: "'Satoshi', sans-serif",
                      lineHeight: 1.7,
                      fontSize: "1rem",
                    }}
                  >
                    {feature.description}
                  </Text>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesBento;

