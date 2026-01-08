import clublyLogo from "@/assets/clubly-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  variant?: "light" | "dark";
}

const Logo = ({ size = "md", showText = true, variant = "dark" }: LogoProps) => {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg" },
    md: { icon: "w-9 h-9", text: "text-xl" },
    lg: { icon: "w-12 h-12", text: "text-2xl" },
  };

  return (
    <div className="flex items-center gap-2.5">
      <img 
        src={clublyLogo} 
        alt="Clubly" 
        className={`${sizes[size].icon} object-contain`}
      />
      {showText && (
        <span 
          className={`font-display ${sizes[size].text} font-bold tracking-tight ${
            variant === "light" ? "text-background" : "text-foreground"
          }`}
        >
          Clubly
        </span>
      )}
    </div>
  );
};

export default Logo;
