import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, X, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import all preset avatars
import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";
import avatar8 from "@/assets/avatars/avatar-8.png";
import avatar9 from "@/assets/avatars/avatar-9.png";
import avatar10 from "@/assets/avatars/avatar-10.png";

export const PRESET_AVATARS = [
  { id: "avatar-1", src: avatar1, name: "Cool Cat" },
  { id: "avatar-2", src: avatar2, name: "Robot" },
  { id: "avatar-3", src: avatar3, name: "Alien" },
  { id: "avatar-4", src: avatar4, name: "Fox" },
  { id: "avatar-5", src: avatar5, name: "Penguin" },
  { id: "avatar-6", src: avatar6, name: "Unicorn" },
  { id: "avatar-7", src: avatar7, name: "Duck" },
  { id: "avatar-8", src: avatar8, name: "Bear" },
  { id: "avatar-9", src: avatar9, name: "Owl" },
  { id: "avatar-10", src: avatar10, name: "Wolf" },
];

interface AvatarPickerProps {
  selectedAvatar: string | null;
  onSelect: (avatarUrl: string) => void;
  onUpload?: (file: File) => Promise<string | null>;
  isUploading?: boolean;
  className?: string;
}

export const AvatarPicker = ({
  selectedAvatar,
  onSelect,
  onUpload,
  isUploading = false,
  className,
}: AvatarPickerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const uploadedUrl = await onUpload(file);
    if (uploadedUrl) {
      onSelect(uploadedUrl);
      setPreviewUrl(null);
    }
  };

  const isPresetSelected = (src: string) => {
    return selectedAvatar === src;
  };

  const isCustomSelected = selectedAvatar && !PRESET_AVATARS.some(a => a.src === selectedAvatar);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          Choose your avatar
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick a character or upload your own
        </p>
      </div>

      {/* Preset Avatars Grid */}
      <div className="grid grid-cols-5 gap-3">
        {PRESET_AVATARS.map((avatar, index) => (
          <motion.button
            key={avatar.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(avatar.src)}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 group",
              isPresetSelected(avatar.src)
                ? "border-primary ring-2 ring-primary/30 scale-105"
                : "border-border hover:border-primary/50 hover:scale-105"
            )}
          >
            <img
              src={avatar.src}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
            <AnimatePresence>
              {isPresetSelected(avatar.src) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white text-center font-medium truncate">
                {avatar.name}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Custom Upload */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "relative w-20 h-20 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center overflow-hidden",
            isCustomSelected
              ? "border-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/50",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          ) : previewUrl || (isCustomSelected && selectedAvatar) ? (
            <>
              <img
                src={previewUrl || selectedAvatar!}
                alt="Custom avatar"
                className="w-full h-full object-cover"
              />
              {isCustomSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Upload</span>
            </div>
          )}
        </motion.button>

        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Upload custom</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Compact version for inline display
interface AvatarDisplayProps {
  avatarUrl: string | null;
  username?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const AvatarDisplay = ({
  avatarUrl,
  username,
  size = "md",
  className,
  onClick,
}: AvatarDisplayProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const getInitial = () => {
    return username?.[0]?.toUpperCase() || "?";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full overflow-hidden border-2 border-border/50 bg-muted flex items-center justify-center transition-all duration-200",
        onClick && "hover:border-primary/50 cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username || "User avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display font-bold text-muted-foreground">
          {getInitial()}
        </span>
      )}
    </button>
  );
};

export default AvatarPicker;
