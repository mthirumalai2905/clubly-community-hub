import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "./AvatarPicker";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { profile, updateAvatar, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!selectedAvatar) return;

    setIsSaving(true);
    try {
      const { error } = await updateAvatar(selectedAvatar);
      if (error) throw error;

      toast({
        title: "✨ Avatar updated!",
        description: "Your new avatar looks great.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AvatarPicker
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
            onUpload={handleUpload}
            isUploading={isUploading}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={isSaving || !selectedAvatar}
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

export default ProfileModal;
