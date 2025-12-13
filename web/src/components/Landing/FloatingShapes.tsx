import { motion } from "framer-motion";
import { useState } from "react";

const FloatingShapes = () => {
  const [shapes] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 2,
    }))
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          style={{
            position: "absolute",
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            borderRadius: shape.id % 3 === 0 ? "50%" : shape.id % 3 === 1 ? "20%" : "0%",
            background: `linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(79, 70, 229, 0.03) 100%)`,
            border: `1px solid rgba(124, 58, 237, 0.1)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;

