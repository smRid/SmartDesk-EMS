import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type AvatarProps = {
  alt: string;
  className?: string;
  size?: "lg" | "md" | "sm";
  src?: string | null;
};

const sizeClasses = {
  lg: "size-16 text-lg",
  md: "size-11 text-sm",
  sm: "size-9 text-xs",
};

export function Avatar({ alt, className, size = "md", src }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-topbar/10 font-semibold text-topbar",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <Image fill alt={alt} className="object-cover" sizes="64px" src={src} />
      ) : (
        <span>{getInitials(alt)}</span>
      )}
    </div>
  );
}
