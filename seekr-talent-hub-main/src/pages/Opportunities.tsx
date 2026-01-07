import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Briefcase, Trophy, GraduationCap, Calendar, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Opportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    const { data, error } = await supabase
      .from("opportunities")
      .select(`
        *,
        profiles:created_by (
          full_name,
          avatar_url
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOpportunities(data);
    }
    setLoading(false);
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-5 w-5" />;
      case "trial":
        return <Trophy className="h-5 w-5" />;
      case "scholarship":
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-blue-500/10 text-blue-500";
      case "trial":
        return "bg-green-500/10 text-green-500";
      case "scholarship":
        return "bg-purple-500/10 text-purple-500";
      case "tournament":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || opp.opportunity_type === selectedType;
    // Filter scholarships to India only
    const isValidScholarship = opp.opportunity_type !== "scholarship" || 
      (opp.location && opp.location.toLowerCase().includes("india"));
    return matchesSearch && matchesType && isValidScholarship;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Opportunities</h1>
            <p className="text-muted-foreground">
              Find trials, jobs, scholarships, and tournaments
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="trial">Trials</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
              <TabsTrigger value="tournament">Tournaments</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((opp) => (
              <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(opp.opportunity_type)}`}>
                    {getOpportunityIcon(opp.opportunity_type)}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {opp.opportunity_type}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-2">{opp.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {opp.description}
                </p>

                <div className="space-y-2 mb-4">
                  {opp.sport && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{opp.sport}</span>
                    </div>
                  )}
                  {opp.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{opp.location}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {opp.profiles && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    {opp.profiles.avatar_url ? (
                      <img
                        src={opp.profiles.avatar_url}
                        alt={opp.profiles.full_name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {opp.profiles.full_name?.[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium">{opp.profiles.full_name}</span>
                  </div>
                )}

                <Button className="w-full" onClick={() => {
                  toast.info(`Contact: ${opp.contact_email || opp.contact_phone || 'See full details'}`);
                  if (opp.requirements) {
                    toast.info(`Requirements: ${opp.requirements}`);
                  }
                }}>View Details</Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Opportunities Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Check back later for new opportunities"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
