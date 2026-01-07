import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface UploadReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReelUploaded: () => void;
}

export const UploadReelDialog = ({ open, onOpenChange, onReelUploaded }: UploadReelDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload video
      const videoExt = videoFile.name.split('.').pop();
      const videoPath = `${user.id}/${Date.now()}.${videoExt}`;
      
      const { error: videoUploadError } = await supabase.storage
        .from('reel-videos')
        .upload(videoPath, videoFile);
        
      if (videoUploadError) throw videoUploadError;
      
      const { data: videoUrlData } = supabase.storage
        .from('reel-videos')
        .getPublicUrl(videoPath);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailExt = thumbnailFile.name.split('.').pop();
        const thumbnailPath = `${user.id}/${Date.now()}-thumb.${thumbnailExt}`;
        
        const { error: thumbnailUploadError } = await supabase.storage
          .from('reel-thumbnails')
          .upload(thumbnailPath, thumbnailFile);
          
        if (!thumbnailUploadError) {
          const { data: thumbnailUrlData } = supabase.storage
            .from('reel-thumbnails')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = thumbnailUrlData.publicUrl;
        }
      }

      // Create reel entry
      const { error: reelError } = await supabase
        .from('reels')
        .insert({
          user_id: user.id,
          title,
          description,
          sport,
          location,
          video_url: videoUrlData.publicUrl,
          thumbnail_url: thumbnailUrl,
        });

      if (reelError) throw reelError;

      toast({
        title: "Success",
        description: "Reel uploaded successfully",
      });

      setTitle("");
      setDescription("");
      setSport("");
      setLocation("");
      setVideoFile(null);
      setThumbnailFile(null);
      onReelUploaded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Reel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video">Video File *</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">Max size: 100MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reel a title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your reel..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="e.g., Football"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Mumbai, India"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Reel
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
