import { motion } from "framer-motion";
import { useState } from "react";
import { Text } from "@mantine/core";

const LogoTicker = () => {
  const [logos] = useState(() => [
    "TechFlow", "StartupHub", "InnovateCo", "ScaleUp", "GrowthLab",
    "VentureX", "LaunchPad", "NextGen", "FutureWorks", "CloudNine",
  ]);

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section
      style={{
        padding: "4rem 0",
        background: "rgba(255, 255, 255, 0.01)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Gradient overlays for fade effect */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "200px",
          background: "linear-gradient(to right, #0f0f0f, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "200px",
          background: "linear-gradient(to left, #0f0f0f, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          display: "flex",
          gap: "4rem",
          width: "fit-content",
        }}
        animate={{
          x: [0, -50 * logos.length * 8],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <motion.div
            key={`${logo}-${index}`}
            style={{
              minWidth: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.4,
            }}
            whileHover={{ opacity: 0.8, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Text
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#a1a1aa",
                fontFamily: "'Satoshi', sans-serif",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {logo}
            </Text>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default LogoTicker;

