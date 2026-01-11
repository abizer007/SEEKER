import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trophy, Users, TrendingUp, ArrowRight, Video, MapPin, Award } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";
import { Navbar } from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Enhanced Gradients */}
      <section className="relative h-[90vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-accent/90 to-primary/95" />
          {/* Decorative gradient blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="relative z-10 container flex h-full flex-col items-center justify-center text-center">
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white animate-fade-up">
            Where Athletes, Scouts & Coaches
            <br />
            Come Together
          </h1>
          <p className="mb-8 max-w-2xl text-xl text-white/90 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Shape the Future of Sports. Discover Hidden Talent. Connect. Grow Together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link to="/auth">
                Join Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm" asChild>
              <Link to="/discover">
                Discover Reels
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision with Gradient Background */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/10 to-transparent" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2 hover:shadow-[var(--shadow-glow)] transition-all duration-300">
              <Trophy className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the digital home of undiscovered sports talent across India.
              </p>
            </Card>
            <Card className="p-8 border-2 hover:shadow-[var(--shadow-glow)] transition-all duration-300">
              <Award className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize sports talent discovery by connecting athletes, scouts, and enthusiasts on one intelligent platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Do</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Breaking barriers of geography, opportunity, and access through data, video, and AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:scale-105 transition-transform duration-300 hover:shadow-[var(--shadow-card)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect</h3>
              <p className="text-muted-foreground">
                Bridge the gap between athletes, scouts, coaches, and sports facilities on one platform.
              </p>
            </Card>

            <Card className="p-8 text-center hover:scale-105 transition-transform duration-300 hover:shadow-[var(--shadow-card)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Video className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Discover</h3>
              <p className="text-muted-foreground">
                Explore talent through video reels and connect with verified scouts and coaches across India.
              </p>
            </Card>

            <Card className="p-8 text-center hover:scale-105 transition-transform duration-300 hover:shadow-[var(--shadow-card)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Grow</h3>
              <p className="text-muted-foreground">
                Access coaching, book facilities, and take your athletic journey to the next level.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container relative z-10 text-white">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of athletes, scouts, and coaches already discovering talent on Seekr
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" asChild>
                <Link to="/auth">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white bg-transparent text-white hover:bg-white hover:text-primary backdrop-blur-sm" asChild>
                <Link to="/auth?type=business">
                  Register as Business
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
