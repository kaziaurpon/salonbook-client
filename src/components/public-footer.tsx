import Link from "next/link";
import { SalonBookLogo } from "@/components/salonbook-logo";

const categories = ["Hair", "Beard & Grooming", "Hair Color", "Skin & Facial", "Spa & Massage"];

function SocialIcon({ name }: { name: "Instagram" | "Facebook" | "X" }) {
  if (name === "Instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.7" cy="6.6" r="1.15" fill="currentColor" /></svg>;
  if (name === "Facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.7 21v-8.2h2.75l.42-3.2H13.7V7.56c0-.93.26-1.56 1.6-1.56h1.7V3.14C16.7 3.05 15.72 3 14.57 3c-2.4 0-4.05 1.47-4.05 4.17V9.6H7.8v3.2h2.72V21h3.18Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.35L5.62 22H2.5l7.25-8.29L1.9 2h6.4l4.43 6.76L18.9 2Zm-1.1 17.85h1.73L7.37 4.03H5.5L17.8 19.85Z" /></svg>;
}

export function PublicFooter() {
  const phone = process.env.NEXT_PUBLIC_SALON_PHONE || "+8801759998251";
  const email = process.env.NEXT_PUBLIC_SALON_EMAIL || "salonbookbd@gmail.com";
  const address = process.env.NEXT_PUBLIC_SALON_ADDRESS || "12/1402, Mirpur 2, Dhaka, Bangladesh";
  const hours = process.env.NEXT_PUBLIC_SALON_HOURS || "Sat–Thu: 9:00 AM–11:00 PM · Fri: 3:00 PM–12:00 AM";
  const socialLinks = [
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/"],
    ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/"],
    ["X", process.env.NEXT_PUBLIC_X_URL || "https://x.com/"],
  ] as const;

  return (
    <footer id="footer" className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <SalonBookLogo className="site-brand footer-brand" />
          <p className="footer-brand-description"><span>Thoughtful salon services, with clear prices.</span><span>Easy appointment requests, all in one place.</span><span>Care that fits your time and routine.</span></p>
          <div className="footer-social-links" aria-label="SalonBook social media">
            {socialLinks.map(([name, href]) => <a aria-label={`Visit SalonBook on ${name}`} href={href} key={name} target="_blank" rel="noopener noreferrer"><SocialIcon name={name} /></a>)}
          </div>
        </div>

        <nav className="footer-links" aria-label="Important navigation links">
          <p className="footer-label">EXPLORE</p>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/#about">About us</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create an account</Link>
        </nav>

        <nav className="footer-categories" aria-label="Explore salon service categories">
          <p className="footer-label">CATEGORIES</p>
          <div className="footer-category-list">
            {categories.map((category) => <Link key={category} href={`/services?category=${encodeURIComponent(category)}`}>{category}</Link>)}
          </div>
        </nav>

        <div className="footer-contact">
          <p className="footer-label">VISIT & CONNECT</p>
          <a href={`tel:${phone}`}><span>PHONE</span>{phone}</a>
          <a href={`mailto:${email}`}><span>EMAIL</span>{email}</a>
          <p><span>ADDRESS</span>{address}</p>
          <p><span>OPENING HOURS</span>{hours}</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SalonBook Inc. All rights reserved.</span>
        <span>Made by <strong>Kazi Aurpon</strong><br />Made for your moment of care.</span>
      </div>
    </footer>
  );
}
