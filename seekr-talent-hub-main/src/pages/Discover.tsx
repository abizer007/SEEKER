import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Trophy, CheckCircle2, Video, ArrowLeft, Plus, Play, Heart, Eye, Filter } from "lucide-react";
import { UploadReelDialog } from "@/components/UploadReelDialog";

const Discover = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for demo
  const dummyAthletes = [
    {
      id: 1,
      name: "Rohan Kapoor",
      sport: "Football",
      location: "Mumbai, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      views: 1250,
      likes: 89,
    },
    {
      id: 2,
      name: "Ananya Reddy",
      sport: "Cricket",
      location: "Kolkata, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      thumbnail: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
      views: 2100,
      likes: 145,
    },
    {
      id: 3,
      name: "Priya Sharma",
      sport: "Badminton",
      location: "Hyderabad, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      thumbnail: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      views: 1560,
      likes: 102,
    },
    {
      id: 4,
      name: "Arjun Patel",
      sport: "Basketball",
      location: "Bangalore, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
      thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      views: 980,
      likes: 76,
    },
    {
      id: 5,
      name: "Sneha Kumar",
      sport: "Tennis",
      location: "Pune, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      thumbnail: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800",
      views: 1720,
      likes: 134,
    },
    {
      id: 6,
      name: "Rahul Mehta",
      sport: "Football",
      location: "Delhi, India",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      views: 2340,
      likes: 187,
    },
  ];

  const dummyCoaches = [
    {
      id: 1,
      name: "Vikram Singh",
      sport: "Basketball",
      club: "Bangalore Basketball Academy",
      location: "Bangalore, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      sport: "Cricket",
      club: "Delhi Cricket School",
      location: "Delhi, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    },
    {
      id: 3,
      name: "Arjun Mehta",
      sport: "Football",
      club: "Mumbai FC Academy",
      location: "Mumbai, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    },
    {
      id: 4,
      name: "Siddharth Nair",
      sport: "Football",
      club: "Goa Football Training Center",
      location: "Goa, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth",
    },
    {
      id: 5,
      name: "Vikas Kumar",
      sport: "Football",
      club: "Kolkata United Academy",
      location: "Kolkata, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikas",
    },
    {
      id: 6,
      name: "Priya Singh",
      sport: "Badminton",
      club: "Hyderabad Badminton Academy",
      location: "Hyderabad, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaS",
    },
    {
      id: 7,
      name: "Ananya Reddy",
      sport: "Badminton",
      club: "Chennai Shuttlers Club",
      location: "Chennai, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    },
    {
      id: 8,
      name: "Rajesh Gupta",
      sport: "Badminton",
      club: "Pune Badminton Center",
      location: "Pune, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshG",
    },
  ];

  const dummyScouts = [
    {
      id: 1,
      name: "Kavita Desai",
      sport: "Football",
      club: "Mumbai FC",
      location: "Mumbai, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      sport: "Cricket",
      club: "BCCI Talent Scout",
      location: "Mumbai, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshK",
    },
    {
      id: 3,
      name: "Anil Kumble",
      sport: "Cricket",
      club: "Karnataka State Cricket",
      location: "Bangalore, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil",
    },
    {
      id: 4,
      name: "Venkatesh Prasad",
      sport: "Cricket",
      club: "Delhi Cricket Association",
      location: "Delhi, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Venkatesh",
    },
    {
      id: 5,
      name: "Aditya Verma",
      sport: "Basketball",
      club: "NBA India Scouts",
      location: "Delhi, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
    },
    {
      id: 6,
      name: "Rohan Mehta",
      sport: "Basketball",
      club: "Basketball Federation of India",
      location: "Bangalore, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohanM",
    },
    {
      id: 7,
      name: "Sameer Singh",
      sport: "Basketball",
      club: "Premier Basketball League",
      location: "Mumbai, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sameer",
    },
    {
      id: 8,
      name: "Prakash Padukone",
      sport: "Badminton",
      club: "Badminton Association of India",
      location: "Bangalore, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prakash",
    },
    {
      id: 9,
      name: "Leena Nair",
      sport: "Badminton",
      club: "National Badminton Academy",
      location: "Hyderabad, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LeenaN",
    },
    {
      id: 10,
      name: "Vikram Desai",
      sport: "Badminton",
      club: "Pullela Gopichand Academy",
      location: "Hyderabad, India",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramD",
    },
  ];

  const dummyBusinesses = [
    {
      id: 1,
      name: "Elite Sports Turf",
      type: "Turf",
      location: "Andheri, Mumbai",
      verified: true,
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=Elite",
      banner: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    },
    {
      id: 2,
      name: "Champions Cricket Academy",
      type: "Academy",
      location: "Koramangala, Bangalore",
      verified: true,
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=Champions",
      banner: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
      id: 3,
      name: "SportsGear Pro",
      type: "Brand",
      location: "Delhi NCR",
      verified: true,
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=SportsGear",
      banner: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800",
    },
  ];

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    const { data } = await supabase
      .from("reels")
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          sport
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (data) {
      setReels(data);
    }
    setLoading(false);
  };

  const filteredAthletes = dummyAthletes.filter(athlete => {
    const matchesSearch = 
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "all" || athlete.sport.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredCoaches = dummyCoaches.filter(coach => {
    const matchesSearch = 
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "all" || coach.sport.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredScouts = dummyScouts.filter(scout => {
    const matchesSearch = 
      scout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "all" || scout.sport.toLowerCase() === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredBusinesses = dummyBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Discover</h1>
              <p className="text-muted-foreground">Explore talent from across India</p>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Reel
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, sport, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="athletes" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="scouts">Scouts</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
          </TabsList>

          <TabsContent value="athletes">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAthletes.map((athlete) => (
                <Card key={athlete.id} className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all cursor-pointer">
                  <div className="relative aspect-[9/16] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                    <img src={athlete.thumbnail} alt={athlete.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs text-white">
                        <Eye className="h-3 w-3" />
                        {athlete.views}
                      </div>
                      <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs text-white">
                        <Heart className="h-3 w-3" />
                        {athlete.likes}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden">
                        <img src={athlete.avatar} alt={athlete.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold">{athlete.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{athlete.sport}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{athlete.location}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coaches">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoaches.map((coach) => (
                <Card key={coach.id} className="p-6 hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="flex items-center gap-4 mb-4">
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
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{coach.sport}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{coach.location}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate('/profile')}>View Profile</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scouts">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredScouts.map((scout) => (
                <Card key={scout.id} className="p-6 hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 overflow-hidden">
                      <img src={scout.avatar} alt={scout.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{scout.name}</h3>
                        {scout.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{scout.club}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{scout.sport}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{scout.location}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate('/messages')}>Connect</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="businesses">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <Card key={business.id} className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    <img src={business.banner} alt={business.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-card border-2 border-border overflow-hidden">
                        <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{business.name}</h3>
                          {business.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{business.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{business.location}</span>
                    </div>
                    <Button className="w-full" onClick={() => navigate('/connect')}>View Details</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UploadReelDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onReelUploaded={fetchReels}
      />
    </div>
  );
};

export default Discover;
