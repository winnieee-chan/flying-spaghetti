import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Text, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bubbleScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);
  const bubbleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "4rem 2rem",
        overflow: "hidden",
      }}
    >
      {/* Floating Bubble */}
      <motion.div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)",
          filter: "blur(80px)",
          opacity: 0.3,
          scale: bubbleScale,
          y: bubbleY,
        }}
        animate={{
          x: [0, 50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        style={{
          textAlign: "center",
          zIndex: 1,
          opacity: textOpacity,
        }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Text
            className="landing-headline"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              marginBottom: "1.5rem",
              color: "#f5f5f0",
              lineHeight: 1.1,
            }}
          >
            Ready to Transform
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Hiring?
            </span>
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Text
            size="xl"
            style={{
              color: "#a1a1aa",
              fontFamily: "'Satoshi', sans-serif",
              maxWidth: "600px",
              margin: "0 auto 3rem",
              lineHeight: 1.6,
            }}
          >
            Join thousands of startups finding their perfect hires faster than ever.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="xl"
              variant="filled"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                border: "none",
                fontWeight: 600,
                fontFamily: "'Satoshi', sans-serif",
                padding: "1.125rem 3rem",
                fontSize: "1.125rem",
              }}
              onClick={() => navigate("/")}
            >
              Start Free Trial
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="xl"
              variant="outline"
              style={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "#f5f5f0",
                fontWeight: 600,
                fontFamily: "'Satoshi', sans-serif",
                padding: "1.125rem 3rem",
                fontSize: "1.125rem",
              }}
              onClick={() => navigate("/")}
            >
              Schedule Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ marginTop: "3rem" }}
        >
          <Text
            size="sm"
            style={{
              color: "#a1a1aa",
              fontFamily: "'Satoshi', sans-serif",
              opacity: 0.7,
            }}
          >
            No credit card required • 14-day free trial • Cancel anytime
          </Text>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;

