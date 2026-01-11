import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Star, Phone, Mail, Trophy, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

const Connect = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Dummy data for coaches
  const coaches = [
    {
      id: 1,
      name: "Vikram Singh",
      sport: "Basketball",
      club: "Bangalore Basketball Academy",
      experience: "8 years",
      rating: 4.8,
      reviews: 52,
      location: "Bangalore, India",
      price: "₹2,000/hour",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    },
    {
      id: 2,
      name: "Kavita Desai",
      sport: "Football",
      club: "Mumbai FC",
      experience: "10 years",
      rating: 4.9,
      reviews: 87,
      location: "Mumbai, India",
      price: "₹2,500/hour",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    },
    {
      id: 3,
      name: "Rahul Sharma",
      sport: "Cricket",
      club: "Delhi Cricket School",
      experience: "12 years",
      rating: 4.7,
      reviews: 64,
      location: "Delhi, India",
      price: "₹3,000/hour",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    },
  ];

  // Dummy data for turfs
  const turfs = [
    {
      id: 1,
      name: "Elite Sports Turf",
      type: "Football & Cricket",
      location: "Andheri, Mumbai",
      rating: 4.6,
      reviews: 128,
      price: "₹1,500/hour",
      facilities: ["Floodlights", "Changing Rooms", "Parking"],
      verified: true,
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    },
    {
      id: 2,
      name: "Pro Sports Arena",
      type: "Multi-Sport",
      location: "Koramangala, Bangalore",
      rating: 4.8,
      reviews: 95,
      price: "₹2,000/hour",
      facilities: ["Indoor", "Floodlights", "Cafeteria", "Parking"],
      verified: true,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    },
    {
      id: 3,
      name: "Champions Turf",
      type: "Cricket",
      location: "Dwarka, Delhi",
      rating: 4.5,
      reviews: 73,
      price: "₹1,800/hour",
      facilities: ["Nets", "Coaching", "Equipment Rental"],
      verified: true,
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    },
  ];

  const filteredCoaches = coaches.filter(coach =>
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTurfs = turfs.filter(turf => {
    const matchesSearch = turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || 
      turf.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  // Extract unique cities from turfs
  const cities = ["all", ...Array.from(new Set(turfs.map(turf => {
    const city = turf.location.split(",")[0].trim();
    return city;
  })))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Connect</h1>
          <p className="text-muted-foreground">Find coaches and book sports facilities</p>
        </div>

        {/* Commission Banner */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">For Businesses</h3>
              <p className="text-sm text-muted-foreground">
                List your turf or coaching services • Seekr takes 10% platform fee
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/auth?type=business")}>
              List Your Business
            </Button>
          </div>
        </Card>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, sport, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="coaches" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="coaches">Hire a Coach</TabsTrigger>
            <TabsTrigger value="turfs">Book a Turf</TabsTrigger>
          </TabsList>

          <TabsContent value="coaches">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoaches.map((coach) => (
                <Card key={coach.id} className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-primary/10 overflow-hidden">
                          <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{coach.name}</h3>
                            {coach.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{coach.club}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span>{coach.sport}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>{coach.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{coach.rating} ({coach.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold text-primary">{coach.price}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => toast.success(`Booking request sent to ${coach.name}`)}>Book</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="turfs">
            {/* Location Filter */}
            <div className="mb-6">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {cities.filter(city => city !== "all").map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTurfs.map((turf) => (
                <Card key={turf.id} className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{turf.name}</h3>
                          {turf.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{turf.type}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>{turf.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{turf.rating} ({turf.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {turf.facilities.map((facility) => (
                        <span key={facility} className="px-2 py-1 bg-secondary text-xs rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-primary">{turf.price}</span>
                      <Button size="sm" onClick={() => toast.success(`Booking request sent for ${turf.name}`)}>Book Now</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connect;