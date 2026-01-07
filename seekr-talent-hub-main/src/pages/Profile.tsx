import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Trophy, Edit, CheckCircle2, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AddAchievementDialog } from "@/components/AddAchievementDialog";

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      const profileId = id || currentUser?.id;
      setIsOwnProfile(profileId === currentUser?.id);

      if (profileId) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();
        
        setProfile(profileData);

        // Fetch user roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profileId);
        
        if (rolesData) {
          setUserRoles(rolesData.map(r => r.role));
        }

        const { data: reelsData } = await supabase
          .from("reels")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false });
        
        setReels(reelsData || []);

        const { data: achievementsData } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", profileId)
          .order("date", { ascending: false });
        
        setAchievements(achievementsData || []);
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [id]);

  const refreshProfile = async () => {
    const profileId = id || user?.id;
    if (profileId) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
      
      setProfile(profileData);

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profileId);
      
      if (rolesData) {
        setUserRoles(rolesData.map(r => r.role));
      }

      const { data: reelsData } = await supabase
        .from("reels")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });
      
      setReels(reelsData || []);

      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", profileId)
        .order("date", { ascending: false });
      
      setAchievements(achievementsData || []);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

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
      
      <div className="container max-w-5xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className="h-48 bg-gradient-to-r from-primary to-accent"
            style={{ 
              backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="h-32 w-32 rounded-full border-4 border-card bg-secondary overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-primary">
                      {profile?.full_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{profile?.full_name || 'User'}</h1>
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {userRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="capitalize">
                        {role}
                      </Badge>
                    ))}
                    {userRoles.length === 0 && (
                      <Badge variant="outline">Athlete</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              {isOwnProfile && (
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button onClick={() => setEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {profile?.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.sport && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>{profile.sport}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="reels">
          <TabsList className="mb-8">
            <TabsTrigger value="reels">Reels ({reels.length})</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="reels">
            {reels.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reels.map((reel) => (
                  <Card key={reel.id} className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all">
                    <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-accent/20 relative">
                      {reel.thumbnail_url && (
                        <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{reel.title || 'Untitled Reel'}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{reel.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{reel.views_count} views</span>
                        <span>{reel.likes_count} likes</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Reels Yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Upload your first reel to showcase your talent" : "This user hasn't uploaded any reels yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements">
            {isOwnProfile && (
              <div className="mb-6">
                <Button onClick={() => setAchievementDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            )}
            
            {achievements.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-6">
                    {achievement.image_url && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={achievement.image_url} 
                          alt={achievement.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                    {achievement.description && (
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    )}
                    {achievement.date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Add your first achievement to showcase your success" : "No achievements added yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {profile?.email}
                </div>
                {profile?.sport && (
                  <div>
                    <span className="font-medium">Sport:</span> {profile.sport}
                  </div>
                )}
                {profile?.location && (
                  <div>
                    <span className="font-medium">Location:</span> {profile.location}
                  </div>
                )}
                {profile?.bio && (
                  <div>
                    <span className="font-medium">Bio:</span>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onProfileUpdated={refreshProfile}
      />

      <AddAchievementDialog
        open={achievementDialogOpen}
        onOpenChange={setAchievementDialogOpen}
        onAchievementAdded={refreshProfile}
      />
    </div>
  );
};

export default Profile;