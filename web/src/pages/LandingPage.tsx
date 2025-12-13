import { useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/Landing/HeroSection";
import FeaturesBento from "../components/Landing/FeaturesBento";
import LogoTicker from "../components/Landing/LogoTicker";
import PipelineDemo from "../components/Landing/PipelineDemo";
import CTASection from "../components/Landing/CTASection";
import "../styles/landing.css";

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="landing-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <LogoTicker />
        <FeaturesBento />
        <PipelineDemo />
        <CTASection />
      </motion.div>
    </div>
  );
};

export default LandingPage;

