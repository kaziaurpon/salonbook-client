import Link from "next/link";

type SalonBookLogoProps = {
  href?: string;
  className?: string;
  badge?: string;
};

export function SalonBookLogo({ href = "/", className = "", badge }: SalonBookLogoProps) {
  return (
    <Link className={`salonbook-logo ${className}`.trim()} href={href} aria-label="SalonBook">
      <span className="salonbook-logo-mark" aria-hidden="true">
        <img src="/images/salonbook-mark.png" alt="" />
      </span>
      <span className="salonbook-wordmark">SalonBook</span>
      {badge && <small>{badge}</small>}
    </Link>
  );
}
