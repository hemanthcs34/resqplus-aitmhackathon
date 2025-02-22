import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const GameButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/game')}
      className="fixed top-4 right-4 z-50"
      variant="default"
    >
      Game
    </Button>
  );
};

export default GameButton;