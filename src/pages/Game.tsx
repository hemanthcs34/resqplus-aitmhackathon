import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirstAidGame } from "../components/FirstAidGame";

const Game = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
    >
      <FirstAidGame />
    </motion.div>
  );
};

export default Game;