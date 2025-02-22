
import { Card } from "@/components/ui/card";

interface MedicalCardProps {
  title: string;
  children: React.ReactNode;
}

const MedicalCard = ({ title, children }: MedicalCardProps) => {
  return (
    <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      <h3 className="text-medical-secondary font-semibold text-lg mb-4">{title}</h3>
      {children}
    </Card>
  );
};

export default MedicalCard;
