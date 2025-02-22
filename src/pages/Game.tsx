import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  options: Option[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Emergency Response: Choking",
    description: "A person in a restaurant suddenly starts coughing and clutching their throat. What's your first action?",
    options: [
      {
        id: 1,
        text: "Immediately perform the Heimlich maneuver",
        isCorrect: false,
        feedback: "First assess if they can speak or cough effectively. The Heimlich maneuver should only be used if the person cannot breathe.",
        points: -5
      },
      {
        id: 2,
        text: "Ask if they can speak and encourage them to cough",
        isCorrect: true,
        feedback: "Correct! First assess the severity and encourage effective coughing.",
        points: 10
      },
      {
        id: 3,
        text: "Offer them water to drink",
        isCorrect: false,
        feedback: "Never give water to someone who might be choking. This could worsen the situation.",
        points: -10
      }
    ]
  },
  {
    id: 2,
    title: "Heart Attack Response",
    description: "Someone is experiencing chest pain, shortness of breath, and left arm pain. What should you do first?",
    options: [
      {
        id: 1,
        text: "Call emergency services (911) immediately",
        isCorrect: true,
        feedback: "Correct! Quick medical response is crucial for heart attacks. Every minute counts.",
        points: 10
      },
      {
        id: 2,
        text: "Have them lie down and wait to see if it passes",
        isCorrect: false,
        feedback: "Never wait with potential heart attack symptoms. Immediate medical attention is essential.",
        points: -10
      },
      {
        id: 3,
        text: "Drive them to the hospital yourself",
        isCorrect: false,
        feedback: "Emergency services can provide immediate care and are better equipped to handle complications.",
        points: -5
      }
    ]
  },
  {
    id: 3,
    title: "Severe Bleeding Control",
    description: "Someone has cut their arm and is bleeding heavily. What's your immediate response?",
    options: [
      {
        id: 1,
        text: "Apply direct pressure with a clean cloth",
        isCorrect: true,
        feedback: "Correct! Direct pressure is the first step to control bleeding.",
        points: 10
      },
      {
        id: 2,
        text: "Apply a tourniquet immediately",
        isCorrect: false,
        feedback: "Tourniquets should only be used as a last resort when direct pressure fails.",
        points: -5
      },
      {
        id: 3,
        text: "Run the wound under water",
        isCorrect: false,
        feedback: "This could increase blood loss. Direct pressure is needed first.",
        points: -10
      }
    ]
  },
  {
    id: 4,
    title: "Seizure Management",
    description: "Someone near you starts having a seizure. What should you do?",
    options: [
      {
        id: 1,
        text: "Clear the area and protect their head",
        isCorrect: true,
        feedback: "Correct! Remove dangerous objects and protect them from injury.",
        points: 10
      },
      {
        id: 2,
        text: "Try to hold them still",
        isCorrect: false,
        feedback: "Never restrain someone having a seizure. This could cause injury.",
        points: -10
      },
      {
        id: 3,
        text: "Put something in their mouth",
        isCorrect: false,
        feedback: "Never put anything in the mouth of someone having a seizure. This is dangerous.",
        points: -10
      }
    ]
  },
  {
    id: 5,
    title: "Burns Treatment",
    description: "Someone has received a minor burn from hot water. What's the first step?",
    options: [
      {
        id: 1,
        text: "Cool the burn under cool running water for 10-20 minutes",
        isCorrect: true,
        feedback: "Correct! Cool water helps reduce pain and prevent further damage.",
        points: 10
      },
      {
        id: 2,
        text: "Apply ice directly to the burn",
        isCorrect: false,
        feedback: "Ice can cause further damage to burned tissue.",
        points: -5
      },
      {
        id: 3,
        text: "Apply butter or oil to the burn",
        isCorrect: false,
        feedback: "Never apply oily substances to burns. This can trap heat and worsen the injury.",
        points: -10
      }
    ]
  }
];

const Game = () => {
  const navigate = useNavigate();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('emergency-game-highscore');
    return saved ? parseInt(saved) : 0;
  });

  const handleOptionSelect = async (option: Option) => {
    setSelectedOption(option.id);
    
    toast({
      title: option.isCorrect ? "Correct!" : "Incorrect",
      description: option.feedback,
      variant: option.isCorrect ? "default" : "destructive",
    });

    const newScore = score + option.points;
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('emergency-game-highscore', newScore.toString());
    }

    // Wait for feedback animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentScenario(prev => prev + 1);
    setSelectedOption(null);
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setScore(0);
    setSelectedOption(null);
  };

  const isGameOver = currentScenario >= scenarios.length;
  const progress = (currentScenario / scenarios.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <nav className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <div className="flex items-center gap-4">
          <span className="font-semibold">High Score: {highScore}</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-medical-secondary mb-2">
            Emergency Response Training
          </h1>
          <div className="flex justify-between items-center max-w-md mx-auto">
            <span className="text-xl font-semibold">Score: {score}</span>
            <Progress value={progress} className="w-32" />
            <span className="text-sm text-gray-600">
              {currentScenario + 1}/{scenarios.length}
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div
              key={currentScenario}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {scenarios[currentScenario].title}
                </h2>
                <p className="text-gray-700 mb-6">
                  {scenarios[currentScenario].description}
                </p>
                <div className="space-y-4">
                  {scenarios[currentScenario].options.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(option)}
                      disabled={selectedOption !== null}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 
                        ${selectedOption === option.id
                          ? option.isCorrect
                            ? 'bg-green-100 border-green-500'
                            : 'bg-red-100 border-red-500'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                        } border-2`}
                    >
                      {option.text}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Award className="w-16 h-16 mx-auto text-medical-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-4">
                Training Complete!
              </h2>
              <p className="text-lg mb-2">
                Final Score: {score}
              </p>
              <p className="text-md text-gray-600 mb-6">
                High Score: {highScore}
              </p>
              <Button
                onClick={resetGame}
                className="bg-medical-primary hover:bg-medical-secondary"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Game;