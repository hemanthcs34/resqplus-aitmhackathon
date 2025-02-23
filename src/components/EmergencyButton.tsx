
import React from "react";
import { Phone } from "lucide-react";

declare global {
  interface Window {
    PlayAI: {
      open: (key: string) => void;
    };
  }
}

const EmergencyButton = () => {
  const handleEmergencyCall = () => {
    // Initialize PlayAI with the provided key
    if (window.PlayAI) {
      window.PlayAI.open('RDABbnVGpqjFgnHmkYxzo');
      console.log("Emergency call initiated");
    } else {
      console.error("PlayAI SDK not loaded");
    }
  };

  return (
    <button
      onClick={handleEmergencyCall}
      className="group relative flex items-center justify-center gap-2 bg-medical-emergency hover:bg-red-500 text-white px-8 py-4 rounded-full transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
    >
      <Phone className="w-6 h-6 animate-pulse" />
      <span className="text-lg font-semibold">Emergency Call</span>
      <div className="absolute -inset-0.5 bg-medical-emergency opacity-50 rounded-full blur animate-pulse group-hover:opacity-75" />
    </button>
  );
};

export default EmergencyButton;
