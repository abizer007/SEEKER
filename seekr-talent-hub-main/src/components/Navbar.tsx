import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Bell, MessageCircle, User, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import seekrLogo from "@/assets/seekr-logo.png";

export const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={seekrLogo} alt="SEEKR - Be Seen" className="h-16 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/discover" className="hover:text-primary transition-colors">Discover</Link>
          <Link to="/connect" className="hover:text-primary transition-colors">Connect</Link>
          <Link to="/feed" className="hover:text-primary transition-colors">Feed</Link>
          <Link to="/opportunities" className="hover:text-primary transition-colors">Opportunities</Link>
          <Link to="/messages" className="hover:text-primary transition-colors">Messages</Link>
        </div>

        {user ? (
          <>
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search athletes, sports..."
                  className="h-10 w-64 rounded-full border border-border bg-secondary pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/messages">
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Link to="/discover" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Discover
                  </Link>
                  <Link to="/connect" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Connect
                  </Link>
                  <Link to="/feed" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Feed
                  </Link>
                  <Link to="/opportunities" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Opportunities
                  </Link>
                  <Link to="/messages" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Messages
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
