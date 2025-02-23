import { ChevronRight, Map, User, Phone, MapPin, Loader } from "lucide-react";
import EmergencyButton from "../components/EmergencyButton";
import MedicalCard from "../components/MedicalCard";
import LocationTracker from "../components/LocationTracker";
import React, { useEffect, useState } from "react";
import { toast } from "../hooks/use-toast";
import { Search, Upload, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";

interface Hospital {
  id: string;
  name: string;
  distance: string;
  lat: number;
  lon: number;
  beds: number;
}

interface UserSettings {
  fullName: string;
  age: number;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalId: string;
}

interface MedicalRecord {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  date: string;
  description?: string;
}

const Index = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    fullName: "John Doe",
    age: 32,
    bloodType: "A+",
    allergies: "None",
    emergencyContact: "+1 234 567 8900",
    medicalId: "#12345"
  });

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const savedSettings = localStorage.getItem('medicalSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const savedRecords = localStorage.getItem('medRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('medicalSettings', JSON.stringify(newSettings));
    setIsEditingSettings(false);
    toast({
      title: "Settings saved",
      description: "Your medical profile has been updated",
    });
  };

  const saveRecords = (newRecords: MedicalRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('medRecords', JSON.stringify(newRecords));
  };

  const addRecord = (record: MedicalRecord) => {
    const newRecords = [...records, record];
    saveRecords(newRecords);
  };

  const removeRecord = (id: string) => {
    const newRecords = records.filter(record => record.id !== id);
    saveRecords(newRecords);
  };

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      // Using OpenStreetMap's Overpass API to find hospitals
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:5000,${lat},${lng});
          way["amenity"="hospital"](around:5000,${lat},${lng});
          relation["amenity"="hospital"](around:5000,${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const formattedHospitals = data.elements
          .filter((element: any) => element.tags && element.tags.name)
          .slice(0, 5)
          .map((hospital: any) => ({
            id: hospital.id.toString(),
            name: hospital.tags.name,
            distance: `${((Math.random() * 4 + 1)).toFixed(1)} km`,
            lat: hospital.lat || 0,
            lon: hospital.lon || 0,
            beds: Math.floor(Math.random() * 20) + 5,
          }));

        setHospitals(formattedHospitals);
        toast({
          title: "Hospitals found",
          description: `Found ${formattedHospitals.length} nearby hospitals`,
        });
      } else {
        throw new Error('No hospitals found in this area');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby hospitals. Showing sample data.",
        variant: "destructive",
      });
      
      setHospitals([
        { id: "1", name: "Central Hospital", distance: "2.5 km", lat: 40.7128, lon: -74.0060, beds: 12 },
        { id: "2", name: "St. Mary's Medical Center", distance: "3.8 km", lat: 40.7137, lon: -74.0070, beds: 8 },
        { id: "3", name: "City General Hospital", distance: "5.2 km", lat: 40.7146, lon: -74.0080, beds: 15 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyHospitals(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
  };

  return (
    <div className="relative min-h-screen">
      <Button
        variant="outline"
        className="absolute top-4 right-4 z-50"
        onClick={() => navigate('/game')}
      >
        Game
      </Button>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold text-medical-secondary mb-2">Medical Assist</h1>
            <p className="text-gray-600">Quick access to emergency medical services</p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3 flex justify-center mb-8">
              <EmergencyButton />
            </div>

            <MedicalCard title="Your Location">
              <LocationTracker onLocationUpdate={handleLocationUpdate} />
              <div className="mt-4 relative overflow-hidden rounded-lg">
                {currentLocation ? (
                  <div className="bg-medical-accent p-4 rounded-lg">
                    <MapPin className="w-6 h-6 text-medical-primary mb-2" />
                    <p className="text-sm text-gray-600">
                      Lat: {currentLocation.lat.toFixed(4)}<br />
                      Lng: {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-medical-accent p-4 rounded-lg text-center">
                    <Map className="w-6 h-6 text-medical-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Waiting for location...</p>
                  </div>
                )}
              </div>
            </MedicalCard>

            <MedicalCard title="Nearby Hospitals">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="w-6 h-6 text-medical-primary animate-spin" />
                  </div>
                ) : hospitals.length > 0 ? (
                  hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer"
                      onClick={() => {
                        // Open in a new tab                      
                        // Show a dialog with more details
                        toast({
                          title: hospital.name,
                          description: (
                            <div className="space-y-3">
                              <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${hospital.lon-0.002},${hospital.lat-0.002},${hospital.lon+0.002},${hospital.lat+0.002}&layer=mapnik&marker=${hospital.lat},${hospital.lon}`}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
        
                              </div>
                              <p className="text-sm text-gray-600">
                                Available Beds: {hospital.beds}
                              </p>
                            </div>
                          ),
                          duration: 10000,
                        });
                      }}
                    >
                      <div>
                        <h4 className="font-medium text-medical-secondary">{hospital.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hospital.distance}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-medical-accent text-medical-primary px-2 py-1 rounded">
                          {hospital.beds} beds
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No hospitals found in your area
                  </div>
                )}
              </div>
            </MedicalCard>

            <MedicalCard title="Medical Profile">
              <div className="space-y-4">
                {isEditingSettings ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newSettings: UserSettings = {
                      fullName: formData.get('fullName') as string,
                      age: parseInt(formData.get('age') as string),
                      bloodType: formData.get('bloodType') as string,
                      allergies: formData.get('allergies') as string,
                      emergencyContact: formData.get('emergencyContact') as string,
                      medicalId: settings.medicalId, // Keep existing ID
                    };
                    handleSaveSettings(newSettings);
                  }}>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600" htmlFor="fullName">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          defaultValue={settings.fullName}
                          className="w-full p-2 border rounded-md mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600" htmlFor="age">Age</label>
                        <input
                          type="number"
                          name="age"
                          id="age"
                          defaultValue={settings.age}
                          className="w-full p-2 border rounded-md mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600" htmlFor="bloodType">Blood Type</label>
                        <select
                          name="bloodType"
                          id="bloodType"
                          defaultValue={settings.bloodType}
                          className="w-full p-2 border rounded-md mt-1"
                          required
                        >
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                          <option>O+</option>
                          <option>O-</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600" htmlFor="allergies">Allergies</label>
                        <input
                          type="text"
                          name="allergies"
                          id="allergies"
                          defaultValue={settings.allergies}
                          className="w-full p-2 border rounded-md mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600" htmlFor="emergencyContact">Emergency Contact</label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          id="emergencyContact"
                          defaultValue={settings.emergencyContact}
                          className="w-full p-2 border rounded-md mt-1"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="bg-medical-primary text-white px-4 py-2 rounded-md hover:bg-medical-secondary transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingSettings(false)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-medical-accent rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-medical-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{settings.fullName}</h4>
                        <p className="text-sm text-gray-600">ID: {settings.medicalId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Blood Type</p>
                        <p className="font-medium">{settings.bloodType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Age</p>
                        <p className="font-medium">{settings.age}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Allergies</p>
                        <p className="font-medium">{settings.allergies}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Emergency Contact</p>
                        <p className="font-medium">{settings.emergencyContact}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingSettings(true)}
                      className="w-full mt-4 bg-medical-accent text-medical-primary px-4 py-2 rounded-md hover:bg-medical-accent/80 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="w-full mt-2 bg-medical-primary text-white px-4 py-2 rounded-md hover:bg-medical-secondary transition-colors"
                    >
                      My Med Records
                    </button>
                  </>
                )}
              </div>
            </MedicalCard>
          </div>

          <footer className="mt-12 text-center text-sm text-gray-600">
            <p>For emergencies, please click the Emergency Call button or dial your local emergency number.</p>
          </footer>
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-medical-secondary">Medical Records</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        className="w-full pl-10 p-2 border rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-8 h-8 text-medical-primary mb-2" />
                    <span className="text-sm text-gray-600">Upload PDF/Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          addRecord({
                            id: Date.now().toString(),
                            name: file.name,
                            type: 'file',
                            url: URL.createObjectURL(file),
                            date: new Date().toISOString().split('T')[0]
                          });
                        }
                      }}
                    />
                  </label>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget as HTMLFormElement);
                      addRecord({
                        id: Date.now().toString(),
                        name: formData.get('name') as string,
                        type: 'link',
                        url: formData.get('url') as string,
                        date: new Date().toISOString().split('T')[0],
                        description: formData.get('description') as string
                      });
                      (e.target as HTMLFormElement).reset();
                    }}
                    className="p-6 border-2 rounded-lg space-y-3"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Record Name"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                    <input
                      type="url"
                      name="url"
                      placeholder="Record URL"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Description (optional)"
                      className="w-full p-2 border rounded-md"
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="w-full bg-medical-primary text-white px-4 py-2 rounded-md hover:bg-medical-secondary"
                    >
                      Add Link Record
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-medical-primary" />
                        <div>
                          <a
                            href={record.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-medical-primary hover:underline"
                          >
                            {record.name}
                          </a>
                          {record.description && (
                            <p className="text-sm text-gray-600">{record.description}</p>
                          )}
                          <p className="text-xs text-gray-500">{record.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeRecord(record.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
