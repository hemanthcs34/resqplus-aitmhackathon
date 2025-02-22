
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface LocationInputDialogProps {
  onLocationSubmit: (lat: number, lng: number) => void;
}

const LocationInputDialog = ({ onLocationSubmit }: LocationInputDialogProps) => {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const query = `${city}, ${state}, ${country}`;
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        toast({
          title: "Location not found",
          description: "Please check the entered location and try again",
          variant: "destructive",
        });
        return;
      }

      const { lat, lon } = data[0];
      onLocationSubmit(parseFloat(lat), parseFloat(lon));
      
      toast({
        title: "Location updated",
        description: "Successfully found your location",
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Error",
        description: "Failed to process location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Enter Location Manually</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State/Province
            </label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state or province"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Country
            </label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Finding location..." : "Submit Location"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationInputDialog;
