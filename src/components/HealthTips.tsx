import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../hooks/use-toast";

const healthTips = [
  {
    title: "Hydration Reminder",
    message: "Remember to drink 8 glasses of water daily for optimal health!"
  },
  {
    title: "Posture Check",
    message: "Sit up straight and take a break from screen time every 20 minutes."
  },
  {
    title: "Exercise Tip",
    message: "A 10-minute walk can boost your energy and mood significantly."
  },
  {
    title: "Mental Wellness",
    message: "Take 5 deep breaths to reduce stress and improve focus."
  },
  {
    title: "First Aid Reminder",
    message: "Keep your first aid kit easily accessible and check expiry dates."
  }
];

const HealthTips = () => {
  const { toast } = useToast();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Show first tip immediately
    const currentTip = healthTips[currentTipIndex];
    toast({
      title: currentTip.title,
      description: currentTip.message,
      duration: 5000,
    });

    // Set up interval for subsequent tips
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
      const nextTip = healthTips[(currentTipIndex + 1) % healthTips.length];
      toast({
        title: nextTip.title,
        description: nextTip.message,
        duration: 5000,
      });
    }, 30000); // 30 seconds interval

    return () => clearInterval(interval);
  }, [currentTipIndex, toast]);

  return null; // This component doesn't render anything visible
};

export default HealthTips;