import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Home, Compass, Users, MessageCircle, User as UserIcon, LogOut, PlusCircle, TrendingUp, Briefcase, Trophy, MapPin, Heart, Eye, FileText, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UploadReelDialog } from "@/components/UploadReelDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Reel {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  views_count: number;
  sport: string;
  location: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  sport: string;
  location: string;
  deadline: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  sport: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const Feed = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState<Reel[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
      loadFeedData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadFeedData = async () => {
    // Load recent reels
    const { data: reelsData } = await supabase
      .from("reels")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(6);

    if (reelsData) setReels(reelsData as any);

    // Load opportunities
    const { data: oppsData } = await supabase
      .from("opportunities")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (oppsData) setOpportunities(oppsData);

    // Load recent achievements
    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (achievementsData) setAchievements(achievementsData as any);

    // Load blog posts
    const { data: blogPostsData } = await supabase
      .from("blog_posts")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(4);

    if (blogPostsData) setBlogPosts(blogPostsData as any);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleLike = async (type: 'reel' | 'blog_post', id: string) => {
    if (!user) return;
    
    if (type === 'blog_post') {
      // Blog post like (simplified - just increment)
      const currentPost = blogPosts.find(p => p.id === id);
      if (currentPost) {
        await supabase
          .from('blog_posts')
          .update({ likes_count: currentPost.likes_count + 1 })
          .eq('id', id);
        toast.success('Liked!');
        loadFeedData();
      }
    } else {
      // Reel like - just increment
      const currentReel = reels.find(r => r.id === id);
      if (currentReel) {
        await supabase
          .from('reels')
          .update({ likes_count: currentReel.likes_count + 1 })
          .eq('id', id);
        toast.success('Liked!');
        loadFeedData();
      }
    }
  };

  const handleComment = (title: string) => {
    toast.info(`Comments for "${title}" coming soon!`);
  };

  const handleApplyNow = (opportunity: any) => {
    toast.success(`Application submitted for ${opportunity.title}!`, {
      description: `We'll notify you when there's a response.`
    });
  };

  const filteredContent = () => {
    let allContent: any[] = [];
    
    if (activeFilter === "all" || activeFilter === "reels") {
      allContent = [...allContent, ...reels.map(r => ({ ...r, type: 'reel' }))];
    }
    if (activeFilter === "all" || activeFilter === "blogs") {
      allContent = [...allContent, ...blogPosts.map(b => ({ ...b, type: 'blog' }))];
    }
    if (activeFilter === "all" || activeFilter === "achievements") {
      allContent = [...allContent, ...achievements.map(a => ({ ...a, type: 'achievement' }))];
    }
    if (activeFilter === "all" || activeFilter === "opportunities") {
      allContent = [...allContent, ...opportunities.map(o => ({ ...o, type: 'opportunity' }))];
    }

    if (searchQuery) {
      return allContent.filter(item => {
        const title = item.title?.toLowerCase() || '';
        const description = item.description?.toLowerCase() || '';
        const name = item.profiles?.full_name?.toLowerCase() || '';
        return title.includes(searchQuery.toLowerCase()) || 
               description.includes(searchQuery.toLowerCase()) ||
               name.includes(searchQuery.toLowerCase());
      });
    }
    
    return allContent;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex w-full">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border bg-card lg:block">
          <nav className="flex flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/feed">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/discover">
                <Compass className="mr-2 h-5 w-5" />
                Discover
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/connect">
                <Users className="mr-2 h-5 w-5" />
                Connect
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/messages">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/profile">
                <UserIcon className="mr-2 h-5 w-5" />
                Profile
              </Link>
            </Button>
            <div className="mt-auto">
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 bg-muted/30">
          <div className="container max-w-4xl py-6 space-y-6">
            <UploadReelDialog 
              open={uploadDialogOpen}
              onOpenChange={setUploadDialogOpen}
              onReelUploaded={loadFeedData}
            />

            {/* Search and Filter */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts, reels, opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="reels" className="flex-1">Reels</TabsTrigger>
                    <TabsTrigger value="blogs" className="flex-1">Stories</TabsTrigger>
                    <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
                    <TabsTrigger value="opportunities" className="flex-1">Opportunities</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            {/* Unified Feed - All Content in Blog Style */}
            <div className="space-y-6">
              {filteredContent().map((item) => (
                <Card key={`${item.type}-${item.id}`} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* User Header */}
                    <div className="flex gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={item.profiles?.avatar_url} />
                        <AvatarFallback>
                          {item.profiles?.full_name?.[0] || item.type[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.profiles?.full_name || 'Seekr Platform'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 
                           item.date ? new Date(item.date).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {item.type === 'reel' && <Badge variant="default">Reel</Badge>}
                        {item.type === 'blog' && <Badge variant="secondary">Story</Badge>}
                        {item.type === 'achievement' && <Badge variant="outline" className="border-accent text-accent">Achievement</Badge>}
                        {item.type === 'opportunity' && <Badge variant="outline" className="border-primary text-primary">Opportunity</Badge>}
                        {item.sport && <Badge variant="outline">{item.sport}</Badge>}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-3">{item.title}</h2>

                    {/* Description/Content */}
                    {(item.description || item.content) && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {item.content || item.description}
                      </p>
                    )}

                    {/* Opportunity specific info */}
                    {item.type === 'opportunity' && (
                      <div className="mb-4 space-y-2">
                        {item.opportunity_type && (
                          <p className="text-sm">
                            <span className="font-semibold">Type:</span> {item.opportunity_type}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-sm flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="font-semibold">Location:</span> {item.location}
                          </p>
                        )}
                        {item.deadline && (
                          <p className="text-sm">
                            <span className="font-semibold">Deadline:</span> {new Date(item.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Media */}
                    {item.type === 'reel' && (
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                        <img
                          src={item.thumbnail_url || item.video_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {item.location && (
                          <div className="absolute bottom-3 left-3 text-white text-sm flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    )}

                    {(item.type === 'blog' || item.type === 'achievement') && item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full rounded-lg mb-4 max-h-[500px] object-cover"
                      />
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                      {(item.type === 'reel' || item.type === 'blog') && (
                        <>
                          <button 
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => handleLike(item.type === 'blog' ? 'blog_post' : 'reel', item.id)}
                          >
                            <Heart className="h-5 w-5" />
                            <span className="font-semibold">{item.likes_count || 0}</span>
                            <span className="text-sm">Likes</span>
                          </button>
                          {item.type === 'blog' && (
                            <button 
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => handleComment(item.title)}
                            >
                              <MessageSquare className="h-5 w-5" />
                              <span className="font-semibold">{item.comments_count || 0}</span>
                              <span className="text-sm">Comments</span>
                            </button>
                          )}
                          {item.type === 'reel' && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Eye className="h-5 w-5" />
                              <span className="font-semibold">{item.views_count || 0}</span>
                              <span className="text-sm">Views</span>
                            </div>
                          )}
                        </>
                      )}
                      {item.type === 'opportunity' && (
                        <Button className="ml-auto" onClick={() => handleApplyNow(item)}>Apply Now</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create Post Card - Moved to Bottom */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    className="flex-1 justify-start text-muted-foreground"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Share your sports moment...
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload Reel
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link to="/opportunities">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post Opportunity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Right Sidebar - Suggested Connections */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 xl:block">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested For You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/connect">
                    <Users className="mr-2 h-4 w-4" />
                    Find Connections
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/opportunities">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Explore Opportunities
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
        <div className="flex items-center justify-around p-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/feed">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/discover">
              <Compass className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/connect">
              <Users className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/messages">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <UserIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Feed;
