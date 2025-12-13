import { motion } from "framer-motion";
import { Stack, Text, Group, Badge } from "@mantine/core";

interface FitScoreGaugeProps {
  score: number;
  confidence?: number;
  summary?: string;
  isLoading?: boolean;
}

const FitScoreGauge = ({
  score,
  confidence,
  summary,
  isLoading = false,
}: FitScoreGaugeProps) => {
  const getScoreColor = (score: number): string => {
    if (score >= 75) return "#40c057"; // green
    if (score >= 50) return "#fab005"; // yellow
    return "#fa5252"; // red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Excellent Match";
    if (score >= 75) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 50) return "Fair Match";
    return "Weak Match";
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG donut chart parameters
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  if (isLoading) {
    return (
      <Stack align="center" gap="md">
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-gray-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="sm" c="dimmed">
            Analyzing...
          </Text>
        </div>
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md">
      {/* Donut Chart */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--mantine-color-gray-2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
        {/* Score in center */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <Text size="xl" fw={700} style={{ fontSize: 32, color }}>
              {score}
            </Text>
          </motion.div>
          <Text size="xs" c="dimmed">
            / 100
          </Text>
        </div>
      </div>

      {/* Label and Confidence */}
      <Group gap="xs" justify="center">
        <Badge size="lg" color={score >= 75 ? "green" : score >= 50 ? "yellow" : "red"}>
          {label}
        </Badge>
        {confidence !== undefined && (
          <Badge size="sm" variant="outline" color="gray">
            {confidence}% confidence
          </Badge>
        )}
      </Group>

      {/* Summary */}
      {summary && (
        <Text size="sm" c="dimmed" ta="center" maw={400}>
          {summary}
        </Text>
      )}
    </Stack>
  );
};

export default FitScoreGauge;

