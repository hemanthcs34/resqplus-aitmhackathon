import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import LocationInputDialog from "./LocationInputDialog";
import { toast } from "@/hooks/use-toast";

interface LocationTrackerProps {
  onLocationUpdate: (lat: number, lng: number) => void;
}

interface Hospital {
  lat: number;
  lng: number;
  name: string;
}

const LocationTracker = ({ onLocationUpdate }: LocationTrackerProps) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const radius = 5000; // 5km radius
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
        );
        out body;
      `;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        body: query
      });
      
      const data = await response.json();
      const hospitalData = data.elements.map((hospital: any) => ({
        lat: hospital.lat,
        lng: hospital.lon,
        name: hospital.tags.name || 'Unknown Hospital'
      }));
      
      setHospitals(hospitalData);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const handleManualLocation = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setPermissionDenied(false);
    onLocationUpdate(lat, lng);
    fetchNearbyHospitals(lat, lng);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setPermissionDenied(false);
          onLocationUpdate(newLocation.lat, newLocation.lng);
          fetchNearbyHospitals(newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          setPermissionDenied(true);
          toast({
            title: "Location access denied",
            description: "Please enter your location manually",
            variant: "destructive",
          });
        }
      );
    }
  }, [onLocationUpdate]);

  const createMarkersString = () => {
    if (!hospitals.length) return '';
    return hospitals.map(hospital => 
      `&marker=${hospital.lat},${hospital.lng}`
    ).join('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-medical-secondary">
        <MapPin className="w-5 h-5 text-medical-primary" />
        {location ? (
          <span className="text-sm">
            Location tracked ({hospitals.length} hospitals nearby)
          </span>
        ) : (
          <span className="text-sm">
            {permissionDenied ? "Location access denied" : "Tracking location..."}
          </span>
        )}
      </div>
      {location && (
        <div style={{ height: '300px', width: '100%' }}>
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.05},${location.lat-0.05},${location.lng+0.05},${location.lat+0.05}&layer=mapnik&marker=${location.lat},${location.lng}${createMarkersString()}`}
            allowFullScreen
          />
        </div>
      )}
      {permissionDenied && (
        <LocationInputDialog onLocationSubmit={handleManualLocation} />
      )}
    </div>
  );
};

export default LocationTracker;
