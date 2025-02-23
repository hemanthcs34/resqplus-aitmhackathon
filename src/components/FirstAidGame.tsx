import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { motion, AnimatePresence } from 'framer-motion';

interface Scenario {
  description: string;
  correctAction: string;
  incorrectAction: string;
}

const scenarios: Scenario[] = [
  {
    description: "A person is choking. What should you do?",
    correctAction: "Perform the Heimlich maneuver",
    incorrectAction: "Give them water to drink"
  },
  {
    description: "Someone is bleeding heavily from a cut. What's the first step?",
    correctAction: "Apply direct pressure to the wound",
    incorrectAction: "Run cold water over it"
  },
  {
    description: "A person is having a seizure. What's the correct action?",
    correctAction: "Clear the area and protect their head",
    incorrectAction: "Try to hold them down"
  },
  {
    description: "Someone is experiencing heat exhaustion. What should you do?",
    correctAction: "Move them to a cool place and give water",
    incorrectAction: "Make them exercise to sweat it out"
  },
];

const simulatorVariants = {
  initial: {
    backgroundColor: '#f3f4f6',
    scale: 1
  },
  choking: {
    backgroundColor: '#fee2e2',
    scale: [1, 1.1, 1],
    rotate: [-2, 2],
    transition: {
      repeat: Infinity,
      duration: 0.8
    }
  },
  bleeding: {
    backgroundColor: '#fee2e2',
    scale: [1, 1.05],
    transition: {
      repeat: Infinity,
      duration: 0.5
    }
  },
  recovering: {
    backgroundColor: '#dcfce7',
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Add these new animation variants
const characterVariants = {
  choking: {
    rotate: [-5, 5],
    transition: {
      repeat: Infinity,
      duration: 0.5
    }
  },
  bleeding: {
    scale: [1, 1.1],
    transition: {
      repeat: Infinity,
      duration: 0.8
    }
  },
  seizure: {
    x: [-10, 10],
    y: [-5, 5],
    transition: {
      repeat: Infinity,
      duration: 0.3
    }
  },
  recovering: {
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const helperVariants = {
  initial: { x: -100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  performing: {
    scale: 1.2,
    transition: { duration: 0.3 }
  }
};

const patientVariants = {
  initial: { scale: 1 },
  choking: {
    rotate: [-5, 5],
    transition: {
      repeat: Infinity,
      duration: 0.5
    }
  },
  recovering: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5 }
  }
};

// SVG Components for animated characters
const PatientSVG = () => (
  <svg width="100" height="200" viewBox="0 0 100 200">
    <motion.circle 
      cx="50" 
      cy="40" 
      r="20" 
      fill="#FFB6C1"
    />
    <motion.path
      d="M50 60 L50 120 M20 160 L50 120 L80 160 M30 90 L70 90"
      stroke="#333"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

const DoctorSVG = () => (
  <svg width="100" height="200" viewBox="0 0 100 200">
    <motion.circle 
      cx="50" 
      cy="40" 
      r="20" 
      fill="#87CEEB"
    />
    <motion.path
      d="M50 60 L50 120 M20 160 L50 120 L80 160 M30 90 L70 90"
      stroke="#006666"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

// Animation variants for the actual first aid actions
const chokingActionVariants = {
  initial: {
    x: 0,
    y: 0,
    rotate: 0
  },
  performing: {
    x: [0, -20, 0],
    y: [0, -10, 0],
    rotate: [-5, 5, -5, 5, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const heimlichVariants = {
  initial: { x: 100 },
  helping: {
    x: 0,
    transition: { duration: 0.5 }
  },
  performing: {
    x: [-10, 10, -10, 10],
    transition: {
      duration: 0.3,
      repeat: 3
    }
  }
};

// Add these new SVG components
const Patient = ({ state }: { state: string }) => (
  <svg width="120" height="200" viewBox="0 0 120 200">
    <motion.g
      initial={false}
      animate={state}
      className={`${state}-action`}
    >
      {/* Body */}
      <motion.circle cx="60" cy="40" r="25" fill="#FFB6C1"/>
      {/* Torso */}
      <motion.path
        d="M60 65 L60 130 M40 180 L60 130 L80 180"
        stroke="#333"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Arms */}
      <motion.path
        d="M30 100 L60 80 L90 100"
        stroke="#333"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Face features */}
      <motion.g>
        <circle cx="50" cy="35" r="3" fill="#333"/>
        <circle cx="70" cy="35" r="3" fill="#333"/>
        <path
          d="M50 50 Q60 55 70 50"
          stroke="#333"
          strokeWidth="3"
          fill="none"
        />
      </motion.g>
    </motion.g>
  </svg>
);

const Helper = ({ action }: { action: string }) => (
  <svg width="120" height="200" viewBox="0 0 120 200">
    <motion.g
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
    >
      {/* Similar structure to Patient but with different colors and actions */}
      <motion.circle cx="60" cy="40" r="25" fill="#87CEEB"/>
      <motion.path
        d="M60 65 L60 130 M40 180 L60 130 L80 180"
        stroke="#006666"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <motion.path
        d="M30 100 L60 80 L90 100"
        stroke="#006666"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        animate={action === 'helping' ? {
          d: [
            "M30 100 L60 80 L90 100",
            "M30 90 L60 70 L90 90",
            "M30 100 L60 80 L90 100"
          ]
        } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      />
    </motion.g>
  </svg>
);

const FirstAidScene = () => {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Patient */}
      <motion.g
        variants={patientVariants}
        initial="choking"
        animate="choking"
      >
        {/* Body */}
        <circle cx="100" cy="100" r="30" fill="#FFB6C1"/>
        <path 
          d="M100 130 L100 200 M70 250 L100 200 L130 250" 
          stroke="#333" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Arms */}
        <path 
          d="M60 150 L100 130 L140 150" 
          stroke="#333" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Face */}
        <circle cx="90" cy="95" r="5" fill="#333"/>
        <circle cx="110" cy="95" r="5" fill="#333"/>
        <path 
          d="M85 115 Q100 120 115 115" 
          stroke="#333" 
          strokeWidth="3"
          fill="none"
        />
      </motion.g>

      {/* Helper */}
      <motion.g
        variants={helperVariants}
        animate="performing"
      >
        {/* Similar structure but different position and colors */}
        <circle cx="250" cy="100" r="30" fill="#87CEEB"/>
        <path 
          d="M250 130 L250 200 M220 250 L250 200 L280 250" 
          stroke="#006666" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path 
          d="M210 150 L250 130 L290 150" 
          stroke="#006666" 
          strokeWidth="8"
          strokeLinecap="round"
          animate={{
            d: [
              "M210 150 L250 130 L290 150",
              "M210 140 L250 120 L290 140",
              "M210 150 L250 130 L290 150"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 1
          }}
        />
      </motion.g>
    </svg>
  );
};

export const FirstAidGame: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timer, setTimer] = useState<number>(30);
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [patientState, setPatientState] = useState('initial');
  const [actionMessage, setActionMessage] = useState('');
  const [currentAnimation, setCurrentAnimation] = useState('choking');
  const [helperAction, setHelperAction] = useState('');

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentScenario]);

  const handleCorrectAction = async () => {
    setIsPerformingAction(true);
    setPatientState('recovering');
    setActionMessage(scenarios[currentScenario].correctAction);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setScore((prev) => prev + 10);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setPatientState('initial');
    setActionMessage('');
    setIsPerformingAction(false);
    nextScenario();
  };

  // Enhance the handleIncorrectAction function
  const handleIncorrectAction = async () => {
    setPatientState('critical');
    
    // Shake effect
    const container = document.querySelector('.game-container');
    container?.classList.add('shake');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    container?.classList.remove('shake');
    
    setScore((prev) => Math.max(0, prev - 5));
    setPatientState('initial');
    nextScenario();
  };

  const nextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % scenarios.length);
    setTimer(30);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setTimer(30);
    setCurrentScenario(0);
    setIsGameOver(false);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    correct: { 
      backgroundColor: '#4ade80',
      transition: { duration: 0.3 }
    },
    incorrect: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <motion.div layout>
              <CardTitle className="text-2xl font-bold">First Aid Training Game</CardTitle>
              <motion.div 
                className="flex justify-between items-center"
                layout
              >
                <motion.div
                  animate={{ scale: score > 0 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Score: {score}
                </motion.div>
                <div>Level: {level}</div>
                <motion.div
                  animate={{ 
                    color: timer <= 10 ? ['#ef4444', '#000000'] : '#000000' 
                  }}
                  transition={{ duration: 0.5, repeat: timer <= 10 ? Infinity : 0 }}
                >
                  Time: {timer}s
                </motion.div>
              </motion.div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden game-container">
              {/* Patient Character */}
              <motion.div
                className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2"
                variants={characterVariants}
                animate={patientState}
              >
                <div className="relative">
                  <motion.div 
                    className="w-40 h-40 bg-red-200 rounded-full flex items-center justify-center"
                    animate={currentAnimation === 'choking' ? {
                      rotate: [-5, 5],
                      transition: { repeat: Infinity, duration: 0.5 }
                    } : {}}
                  >
                    <span className="text-6xl">🤒</span>
                  </motion.div>
                  {isPerformingAction && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-4 -right-4"
                    >
                      <span className="text-4xl">💫</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Helper/Doctor Character */}
              <AnimatePresence>
                {isPerformingAction && (
                  <motion.div
                    initial={{ x: 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 200, opacity: 0 }}
                    className="absolute top-1/2 right-1/3 transform -translate-y-1/2"
                  >
                    <div className="w-40 h-40 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-6xl">👨‍⚕️</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* First Aid Kit */}
              <AnimatePresence>
                {isPerformingAction && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                  >
                    <span className="text-6xl">🧰</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-6"
            >
              {isPerformingAction && (
                <p className="text-green-600 font-medium">
                  Performing {scenarios[currentScenario].correctAction}...
                </p>
              )}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScenario}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <p className="text-lg">{scenarios[currentScenario].description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={handleCorrectAction}
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      {scenarios[currentScenario].correctAction}
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={handleIncorrectAction}
                      variant="secondary"
                      size="lg"
                      className="w-full"
                    >
                      {scenarios[currentScenario].incorrectAction}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Game Over!</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Final Score: {score}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button 
                      onClick={resetGame}
                      className="w-full mt-4"
                    >
                      Play Again
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstAidGame;