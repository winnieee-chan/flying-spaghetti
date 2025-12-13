import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Text, Button } from "@mantine/core";
import InteractiveBubble from "./InteractiveBubble";
import FloatingShapes from "./FloatingShapes";

const HeroSection = () => {
  const navigate = useNavigate();
  const headlineWords = ["Find", "Your", "Next", "Great", "Hire"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "4rem 2rem",
        overflow: "hidden",
      }}
    >
      <FloatingShapes />

      {/* Headline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          textAlign: "center",
          marginBottom: "4rem",
          zIndex: 1,
        }}
      >
        <motion.h1
          className="landing-headline"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.5rem",
            lineHeight: 1.1,
          }}
        >
          {headlineWords.map((word, index) => (
            <motion.span
              key={index}
              variants={wordVariants}
              style={{
                display: "inline-block",
                marginRight: index < headlineWords.length - 1 ? "0.5rem" : 0,
              }}
            >
              {word === "Great" ? (
                <span style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {word}
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{ marginTop: "2rem" }}
        >
          <Text
            size="xl"
            style={{
              color: "#a1a1aa",
              fontFamily: "'Satoshi', sans-serif",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            AI-powered recruiting that finds the perfect candidates in seconds, not weeks.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}
        >
          <Button
            size="lg"
            variant="filled"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              border: "none",
              fontWeight: 600,
              fontFamily: "'Satoshi', sans-serif",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
            }}
            onClick={() => navigate("/")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            style={{
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "#f5f5f0",
              fontWeight: 600,
              fontFamily: "'Satoshi', sans-serif",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
            }}
            onClick={() => {
              const demoSection = document.getElementById("demo");
              demoSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See How It Works
          </Button>
        </motion.div>
      </motion.div>

      {/* Interactive Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, type: "spring", stiffness: 100 }}
        style={{ zIndex: 1, width: "100%", maxWidth: "1200px" }}
      >
        <InteractiveBubble />
      </motion.div>
    </div>
  );
};

export default HeroSection;

