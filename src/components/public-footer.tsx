import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <Link className="site-brand footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>salon<span className="brand-light">book</span></span>
          </Link>
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
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} SalonBook</span><span>Made for your moment of care.</span></div>
    </footer>
  );
}
