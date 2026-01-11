import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/AvatarPicker";
import { useProfile } from "@/hooks/useProfile";
import { UserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
  onUpdate: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

export const EditProfileModal = ({
  open,
  onOpenChange,
  profile,
  onUpdate,
}: EditProfileModalProps) => {
  const { uploadAvatar } = useProfile();
  const { toast } = useToast();
  
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBio(profile.bio || "");
      setSelectedAvatar(profile.avatar_url);
    }
  }, [profile]);

  // Check if username can be changed
  const canChangeUsername = () => {
    if (!profile?.username_last_changed_at) return true;
    
    const lastChanged = new Date(profile.username_last_changed_at);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSince >= 365; // Can change after 1 year
  };

  const getDaysUntilUsernameChange = () => {
    if (!profile?.username_last_changed_at) return 0;
    
    const lastChanged = new Date(profile.username_last_changed_at);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 365 - daysSince);
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        setSelectedAvatar(url);
      }
      return url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setUsernameError(null);
    
    // Validate username change
    if (username !== profile?.username && !canChangeUsername()) {
      setUsernameError(`Username can be changed in ${getDaysUntilUsernameChange()} days`);
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<UserProfile> = {};
      
      if (username !== profile?.username) {
        updates.username = username;
      }
      if (bio !== profile?.bio) {
        updates.bio = bio;
      }
      if (selectedAvatar !== profile?.avatar_url) {
        updates.avatar_url = selectedAvatar;
      }

      const { error } = await onUpdate(updates);
      
      if (error) {
        if (error.message.includes("Username")) {
          setUsernameError(error.message);
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "✨ Profile updated!",
        description: "Your changes have been saved.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Profile Picture</Label>
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
              onUpload={handleUpload}
              isUploading={isUploading}
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              placeholder="Your username"
              disabled={!canChangeUsername() && profile?.username === username}
            />
            {usernameError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {usernameError}
              </div>
            )}
            {!canChangeUsername() && (
              <p className="text-xs text-muted-foreground">
                Username can be changed in {getDaysUntilUsernameChange()} days
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/160
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
