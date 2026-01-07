import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Shield, Upload, ArrowLeft } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  aadharNumber: z.string().length(12, "Aadhar must be 12 digits"),
  sport: z.string().optional(),
  location: z.string().optional(),
});

const businessSchema = z.object({
  businessName: z.string().min(2, "Business name required").max(100),
  contactPerson: z.string().min(2, "Contact person required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().min(3, "Location required"),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format"),
  aadharNumber: z.string().length(12, "Aadhar must be 12 digits"),
});

type UserRole = "athlete" | "ex_athlete" | "scout_coach" | "enthusiast";
type BusinessType = "turf" | "academy" | "brand" | "event_organizer";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "business">("login");
  
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "login") setMode("login");
    else if (modeParam === "signup") setMode("signup");
    else if (modeParam === "business") setMode("business");
  }, [searchParams]);
  
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState<{
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    sport: string;
    location: string;
    aadharNumber: string;
  }>({
    fullName: "",
    email: "",
    password: "",
    role: "athlete",
    sport: "",
    location: "",
    aadharNumber: "",
  });
  const [businessData, setBusinessData] = useState<{
    businessName: string;
    businessType: BusinessType;
    contactPerson: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    gstNumber: string;
    aadharNumber: string;
  }>({
    businessName: "",
    businessType: "turf",
    contactPerson: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    gstNumber: "",
    aadharNumber: "",
  });
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse(loginData);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      navigate("/feed");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signupSchema.parse(signupData);

      if ((signupData.role === "scout_coach") && !idProofFile) {
        toast.error("ID proof required for Scout/Coach");
        return;
      }
      
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/feed`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        let idProofUrl = null;
        
        if (idProofFile) {
          const fileExt = idProofFile.name.split('.').pop();
          const filePath = `${authData.user.id}/id-proof.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, idProofFile);
            
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filePath);
            idProofUrl = urlData.publicUrl;
          }
        }

        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: signupData.fullName,
          email: signupData.email,
          sport: signupData.sport || null,
          location: signupData.location || null,
          aadhar_number: signupData.aadharNumber,
          id_proof_url: idProofUrl,
        });

        if (profileError) throw profileError;

        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: signupData.role,
        });

        if (roleError) throw roleError;

        toast.success("Account created successfully!");
        navigate("/feed");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      businessSchema.parse(businessData);
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: businessData.email,
        password: businessData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/feed`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: businessData.contactPerson,
          email: businessData.email,
          location: businessData.location,
          aadhar_number: businessData.aadharNumber,
        });

        if (profileError) throw profileError;

        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "business",
        });

        if (roleError) throw roleError;

        const { error: businessError } = await supabase.from("businesses").insert({
          user_id: authData.user.id,
          business_name: businessData.businessName,
          business_type: businessData.businessType,
          contact_person: businessData.contactPerson,
          phone: businessData.phone,
          location: businessData.location,
          gst_number: businessData.gstNumber,
        });

        if (businessError) throw businessError;

        toast.success("Business registered! Awaiting verification.");
        navigate("/feed");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to register business");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Join Seekr Today</h1>
          <p className="text-xl mb-8 opacity-90">
            Connect with athletes, scouts, and coaches. Showcase your talent. Discover opportunities.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <span>Verified scouts and coaches</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <span>Secure video sharing</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <span>Connect with opportunities</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 border-2">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h2 className="text-2xl font-bold flex-1 text-center">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Business Registration"}
            </h2>
            <div className="w-10" />
          </div>
          
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-aadhar">Aadhar Number *</Label>
                  <Input
                    id="signup-aadhar"
                    placeholder="123456789012"
                    maxLength={12}
                    value={signupData.aadharNumber}
                    onChange={(e) => setSignupData({ ...signupData, aadharNumber: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a</Label>
                  <Select
                    value={signupData.role}
                    onValueChange={(value: any) => setSignupData({ ...signupData, role: value })}
                  >
                    <SelectTrigger id="signup-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="athlete">Athlete / Player</SelectItem>
                      <SelectItem value="ex_athlete">Ex-Athlete / Mentor</SelectItem>
                      <SelectItem value="scout_coach">Scout / Coach (Club)</SelectItem>
                      <SelectItem value="enthusiast">Enthusiast / Fan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {signupData.role === "scout_coach" && (
                  <div className="space-y-2">
                    <Label htmlFor="id-proof">ID Proof (Required) *</Label>
                    <Input
                      id="id-proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Upload government ID or certification</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-sport">Sport</Label>
                    <Input
                      id="signup-sport"
                      placeholder="e.g. Football"
                      value={signupData.sport}
                      onChange={(e) => setSignupData({ ...signupData, sport: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location</Label>
                    <Input
                      id="signup-location"
                      placeholder="City, Country"
                      value={signupData.location}
                      onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Join Seekr
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="business">
              <form onSubmit={handleBusinessSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Your Sports Academy"
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-aadhar">Aadhar Number *</Label>
                  <Input
                    id="business-aadhar"
                    placeholder="123456789012"
                    maxLength={12}
                    value={businessData.aadharNumber}
                    onChange={(e) => setBusinessData({ ...businessData, aadharNumber: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select
                    value={businessData.businessType}
                    onValueChange={(value: any) => setBusinessData({ ...businessData, businessType: value })}
                  >
                    <SelectTrigger id="business-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turf">Turf</SelectItem>
                      <SelectItem value="academy">Academy</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="event_organizer">Event Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-contact">Contact Person</Label>
                  <Input
                    id="business-contact"
                    placeholder="John Doe"
                    value={businessData.contactPerson}
                    onChange={(e) => setBusinessData({ ...businessData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    placeholder="business@email.com"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-password">Password</Label>
                  <Input
                    id="business-password"
                    type="password"
                    placeholder="••••••••"
                    value={businessData.password}
                    onChange={(e) => setBusinessData({ ...businessData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-location">Location</Label>
                  <Input
                    id="business-location"
                    placeholder="City, State"
                    value={businessData.location}
                    onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-gst">GST Number</Label>
                  <Input
                    id="business-gst"
                    placeholder="22AAAAA0000A1Z5"
                    value={businessData.gstNumber}
                    onChange={(e) => setBusinessData({ ...businessData, gstNumber: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Verification
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your application will be reviewed within 24-48 hours
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
