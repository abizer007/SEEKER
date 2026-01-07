-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('achievements', 'achievements', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('reel-videos', 'reel-videos', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/webm']),
  ('reel-thumbnails', 'reel-thumbnails', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for banners
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for achievements
CREATE POLICY "Achievement images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'achievements');

CREATE POLICY "Users can upload their own achievements"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own achievements"
ON storage.objects FOR UPDATE
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own achievements"
ON storage.objects FOR DELETE
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for reel videos
CREATE POLICY "Reel videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'reel-videos');

CREATE POLICY "Users can upload their own reel videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reel-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reel videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'reel-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for reel thumbnails
CREATE POLICY "Reel thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'reel-thumbnails');

CREATE POLICY "Users can upload their own reel thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reel-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reel thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'reel-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add aadhar_number to profiles
ALTER TABLE public.profiles ADD COLUMN aadhar_number text;
ALTER TABLE public.profiles ADD COLUMN id_proof_url text;

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own achievements"
ON public.achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.achievements FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
ON public.achievements FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for achievements updated_at
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create conversations table
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON public.conversation_participants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Create opportunities table
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  opportunity_type text NOT NULL, -- 'trial', 'job', 'scholarship', 'tournament'
  sport text,
  location text,
  deadline date,
  requirements text,
  contact_email text,
  contact_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities are viewable by everyone"
ON public.opportunities FOR SELECT
USING (is_active = true OR auth.uid() = created_by);

CREATE POLICY "Verified users can create opportunities"
ON public.opportunities FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND (
    EXISTS (
      SELECT 1 FROM public.scout_coach_verification
      WHERE user_id = auth.uid() AND verification_status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid() AND verification_status = 'approved'
    )
  )
);

CREATE POLICY "Users can update their own opportunities"
ON public.opportunities FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own opportunities"
ON public.opportunities FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for opportunities updated_at
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();