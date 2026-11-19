import Link from "next/link";
import { SalonBookLogo } from "@/components/salonbook-logo";

export function PublicFooter() {
  const phone = process.env.NEXT_PUBLIC_SALON_PHONE;
  const address = process.env.NEXT_PUBLIC_SALON_ADDRESS;
  const hours = process.env.NEXT_PUBLIC_SALON_HOURS;
  const socialLinks = [
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
    ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL],
    ["TikTok", process.env.NEXT_PUBLIC_TIKTOK_URL],
  ].filter((item): item is [string, string] => Boolean(item[1]?.startsWith("https://")));
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <SalonBookLogo className="site-brand footer-brand" />
          <p>A little time for yourself, made easier to plan.</p>
        </div>
        <div className="footer-links">
          <p className="footer-label">EXPLORE</p>
          <Link href="/services">Browse services</Link>
          <Link href="/register">Create an account</Link>
          <Link href="/login">Sign in</Link>
        </div>
        <div className="footer-note">
          <p className="footer-label">YOUR NEXT VISIT</p>
          <p>Find a service that feels right, then request a time that works for you.</p>
          <Link href="/services">Find your service <span aria-hidden="true">→</span></Link>
        </div>
        <div className="footer-contact">
          <p className="footer-label">VISIT & CONNECT</p>
          <p>{phone ? <a href={`tel:${phone}`}>{phone}</a> : "Salon phone: add NEXT_PUBLIC_SALON_PHONE"}</p>
          <p>{address || "Salon address: add NEXT_PUBLIC_SALON_ADDRESS"}</p>
          <p>{hours || "Opening hours: add NEXT_PUBLIC_SALON_HOURS"}</p>
          <div className="footer-social-links" aria-label="Salon social media">
            {socialLinks.length ? socialLinks.map(([label, href]) => <a href={href} key={label} target="_blank" rel="noreferrer">{label} ↗</a>) : <span>Add public Instagram, Facebook, or TikTok links when available.</span>}
          </div>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} SalonBook</span><span>Made for your moment of care.</span></div>
    </footer>
  );
}
