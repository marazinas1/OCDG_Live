import { useGlobalBranding } from "@/hooks/useGlobalBranding";

type Props = {
  /** "light" = logo sits on a light surface; "dark" = on charcoal or imagery. */
  variant?: "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The firm's mark, read from the global content namespace (page_media /
 * page_text) so it can be replaced in the admin without touching code.
 * Falls back to the bundled logo when nothing is stored.
 */
const BrandLogo = ({ variant = "light", className, style }: Props) => {
  const branding = useGlobalBranding();
  const useDark = variant === "dark" && branding.logoDarkUrl;
  const src = useDark ? (branding.logoDarkUrl as string) : branding.logoUrl;

  // Without a dedicated dark variant, knock the light mark out to white.
  const needsInvert = variant === "dark" && !branding.logoDarkUrl;
  const filter = [needsInvert ? "brightness(0) invert(1)" : null, style?.filter]
    .filter(Boolean)
    .join(" ");

  // Scale is 1 until someone moves the slider in Settings → Appearance, so the
  // rendered size is byte-for-byte what the site shows today by default.
  const scaled =
    branding.logoScale !== 1
      ? { transform: `scale(${branding.logoScale})`, transformOrigin: "left center" }
      : null;

  return (
    <img
      src={src}
      alt={branding.siteName}
      className={className}
      style={{ ...style, ...scaled, filter: filter || undefined }}
    />
  );
};

export default BrandLogo;
