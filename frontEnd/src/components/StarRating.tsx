import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
} as const;

export default function StarRating({ value, size = "md", className = "" }: StarRatingProps) {
  const rounded = Math.round(value);
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeMap[size]} ${
            star <= rounded
              ? "fill-app-warning text-app-warning"
              : "fill-app-border text-app-border"
          }`}
        />
      ))}
    </div>
  );
}
