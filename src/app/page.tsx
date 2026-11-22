"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, Clock3, CircleDollarSign, ClipboardCheck, Search, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ServiceCard, type PublicService } from "@/components/service-card";
import { ServiceSkeletonGrid } from "@/components/loading-system";
import { withRequestTimeout } from "@/lib/api";
import { getCategoryImage } from "@/lib/service-images";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type PublicCategory = { name: string; image: string };

function CountUp({ value, active }: { value: number; active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || value <= 0) {
      const frame = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now();
    const duration = 850;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return <>{count}</>;
}

export default function HomePage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [marqueeServices, setMarqueeServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [serviceTotal, setServiceTotal] = useState(0);
  const [visibleAbout, setVisibleAbout] = useState(false);
  const aboutRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      const minimumLoaderTime = new Promise<void>((resolve) => window.setTimeout(resolve, 400));
      setLoading(true);
      setError("");
      void withRequestTimeout((signal) => Promise.all([
        fetch(`${apiUrl}/api/services/featured?limit=6`, { signal }),
        fetch(`${apiUrl}/api/services/category-cards`, { signal }),
        fetch(`${apiUrl}/api/services?limit=48`, { signal }),
      ]), { signal: controller.signal }).then(async ([featuredResponse, categoriesResponse, allServicesResponse]) => {
        if (!featuredResponse.ok || !categoriesResponse.ok) throw new Error("We couldn’t reach the salon menu. Please try again.");
        const featuredResult = await featuredResponse.json() as { services: PublicService[] };
        const categoryResult = await categoriesResponse.json() as { categories: PublicCategory[] };
        const allServicesResult = allServicesResponse.ok
          ? await allServicesResponse.json() as { services: PublicService[]; total?: number }
          : { services: [], total: 0 };
        setServices(featuredResult.services);
        setMarqueeServices(allServicesResult.services);
        setCategories(categoryResult.categories);
        setServiceTotal(allServicesResult.total ?? allServicesResult.services.length);
      }).catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load salon information.");
      }).finally(async () => {
        await minimumLoaderTime;
        if (!controller.signal.aborted) setLoading(false);
      });
    });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    const section = aboutRef.current;
    if (!section || visibleAbout) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleAbout(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [visibleAbout]);

  return (
    <PublicShell>
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> A SALON VISIT, YOUR WAY</p>
            <h1>A little care can <em>change your day.</em></h1>
            <p className="hero-description">Discover thoughtful salon services and request a time that fits your life. Your next moment of care starts here.</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/services">Explore services <span aria-hidden="true">↗</span></Link>
              <span className="hero-caption">Find your service. Make it your moment.</span>
            </div>
            <div className="hero-proof"><span className="proof-stars" aria-label="A thoughtful experience">✳ ✳ ✳</span><span>Care, at your pace</span></div>
          </div>
          <div className="hero-art">
            <img className="hero-photo" src="/images/salon-barbershop.jpg" alt="Barber chairs and styling tools inside a modern barbershop" fetchPriority="high" />
            <div className="art-label"><span>YOUR NEXT VISIT</span><strong>Starts here.</strong><small>Thoughtful care, at your pace.</small></div>
          </div>
        </section>

        {marqueeServices.length > 0 && (
          <section className="service-marquee" aria-label="Salon services">
            <h2 className="sr-only">Salon services</h2>
            <div className="service-marquee-track">
              {[0, 1].map((copy) => (
                <div className="service-marquee-group" key={copy} aria-hidden={copy === 1}>
                  {marqueeServices.map((service) => (
                    <span className="service-marquee-item" key={service._id}>
                      <span>{service.serviceName}</span>
                      <span className="service-marquee-star" aria-hidden="true">✳</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="featured-section page-section" aria-labelledby="featured-heading">
          <div className="section-heading">
            <div><p className="eyebrow">A GOOD PLACE TO START</p><h2 id="featured-heading">A few favourites</h2></div>
            <Link className="text-arrow-link" href="/services">View all services <span aria-hidden="true">→</span></Link>
          </div>
          {error ? (
            <div className="public-state error-state" role="alert"><span className="state-symbol">!</span><h3>Our service menu took a pause.</h3><p>{error}</p><button className="button-primary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
          ) : loading ? (
            <ServiceSkeletonGrid />
          ) : services.length ? (
            <div className="service-grid service-results-ready">{services.map((service, index) => <ServiceCard key={service._id} service={service} featured revealIndex={index} />)}</div>
          ) : (
            <div className="public-state"><span className="state-symbol">✳</span><h3>Something lovely is on its way.</h3><p>There are no active services to feature just yet. Please check back soon.</p><Link className="text-arrow-link" href="/services">Browse the service menu <span aria-hidden="true">→</span></Link></div>
          )}
        </section>

        <section className="category-section page-section" aria-labelledby="category-heading">
          <div className="category-intro">
            <p className="eyebrow">FIND YOUR KIND OF CARE</p>
            <h2 id="category-heading">What are you in the mood for?</h2>
            <p>Start with a category, then discover the details that feel right for you.</p>
            <div className="category-guide">
              <span className="category-guide-kicker">A LITTLE CARE, YOUR WAY</span>
              <p>From a fresh cut and beard tidy to color, skin care, and time to unwind, find the salon care that fits your day.</p>
              {!loading && categories.length > 0 && (
                <div className="category-quick-links" aria-label="Popular salon categories">
                  {categories.slice(0, 6).map((category) => <Link key={category.name} href={`/services?category=${encodeURIComponent(category.name)}`}>{category.name}<span aria-hidden="true">↗</span></Link>)}
                </div>
              )}
              <span className="category-guide-signoff">GOOD CARE STARTS WITH A MOMENT FOR YOU</span>
            </div>
          </div>
          {error ? <p className="category-hint">Categories will appear when the service menu is available.</p> : loading ? <div className="category-cards" aria-busy="true" aria-label="Loading service categories">{Array.from({ length: 4 }, (_, index) => <span className="category-placeholder" key={index} />)}</div> : categories.length ? (
            <div className="category-cards">{categories.map((category, index) => <Link className="category-card" key={category.name} href={`/services?category=${encodeURIComponent(category.name)}`}><div className="category-card-image-wrap"><img src={getCategoryImage(category.name, category.image)} alt="" className="category-card-image" loading="lazy" /><span className="category-number">0{index + 1}</span></div><div className="category-card-label"><span>{category.name}</span><span className="category-arrow" aria-hidden="true">↗</span></div></Link>)}</div>
          ) : <p className="category-hint">Service categories will appear here when they are available.</p>}
        </section>

        <section id="about" ref={aboutRef} className={`visit-section page-section${visibleAbout ? " is-visible" : ""}`} aria-labelledby="visit-heading">
          <div className="visit-visual about-reveal" style={{ "--reveal-delay": "0ms" } as CSSProperties}>
            <div className="visit-photo" role="img" aria-label="A salon interior with thoughtful care details" />
            <span className="visit-photo-shade" aria-hidden="true" />
            <span className="visit-image-kicker"><span aria-hidden="true">✳</span> SALONBOOK · PERSONAL CARE</span>
            <div className="visit-image-caption"><span>YOUR NEXT MOMENT</span><strong>Care, at your pace.</strong></div>
            <span className="visit-image-badge"><BadgeCheck size={16} aria-hidden="true" /> Clear pricing, no surprises</span>
          </div>

          <div className="visit-copy">
            <div className="about-intro about-reveal" style={{ "--reveal-delay": "80ms" } as CSSProperties}>
              <p className="eyebrow">ABOUT SALONBOOK</p>
              <h2 id="visit-heading">A little more care, made easier to find.</h2>
              <p>SalonBook brings salon services, clear pricing, and available appointment times together in one place. Choose the care that suits you, send a request, then follow its status from your personal dashboard.</p>
            </div>

            <div className="about-stats about-reveal" style={{ "--reveal-delay": "160ms" } as CSSProperties} aria-label="SalonBook at a glance">
              {[
                { label: "Services", value: serviceTotal },
                { label: "Categories", value: categories.length },
                { label: "Featured picks", value: services.length },
                { label: "Booking steps", value: 3 },
              ].map((stat) => <div className="about-stat" key={stat.label}><strong><CountUp value={stat.value} active={visibleAbout} /></strong><span>{stat.label}</span></div>)}
            </div>

            <div className="about-block about-reveal" style={{ "--reveal-delay": "240ms" } as CSSProperties}>
              <h3 className="about-block-title">How it works</h3>
              <div className="about-how-grid">
                <article className="about-how-card"><span className="about-step-number">01</span><Search size={19} aria-hidden="true" /><h4>Explore services</h4><p>Browse the menu and compare clear details.</p></article>
                <article className="about-how-card"><span className="about-step-number">02</span><CalendarDays size={19} aria-hidden="true" /><h4>Choose date and time</h4><p>Request a slot that suits your schedule.</p></article>
                <article className="about-how-card"><span className="about-step-number">03</span><ClipboardCheck size={19} aria-hidden="true" /><h4>Track your appointment</h4><p>Follow updates from your dashboard.</p></article>
              </div>
            </div>

            <div className="about-block about-reveal" style={{ "--reveal-delay": "320ms" } as CSSProperties}>
              <h3 className="about-block-title">Why SalonBook</h3>
              <div className="about-feature-grid">
                <div className="about-feature"><CircleDollarSign size={19} aria-hidden="true" /><span><strong>Clear pricing</strong><small>Know the price before you book.</small></span></div>
                <div className="about-feature"><Clock3 size={19} aria-hidden="true" /><span><strong>Easy booking</strong><small>Request a time in a few steps.</small></span></div>
                <div className="about-feature"><CheckCircle2 size={19} aria-hidden="true" /><span><strong>Status tracking</strong><small>See where your request stands.</small></span></div>
                <div className="about-feature"><ShieldCheck size={19} aria-hidden="true" /><span><strong>Trusted salons</strong><small>Explore a curated service menu.</small></span></div>
              </div>
            </div>

            <div className="about-categories about-reveal" style={{ "--reveal-delay": "400ms" } as CSSProperties}>
              <h3 className="about-block-title">Explore by category</h3>
              <div className="about-category-chips">
                {["Hair", "Beard & Grooming", "Hair Color", "Skin & Facial", "Makeup"].map((name) => {
                  const match = categories.find((category) => category.name.toLowerCase() === name.toLowerCase());
                  return <Link key={name} href={`/services?category=${encodeURIComponent(match?.name ?? name)}`}>{name}<ArrowRight size={13} aria-hidden="true" /></Link>;
                })}
              </div>
            </div>

            <div className="about-actions about-reveal" style={{ "--reveal-delay": "480ms" } as CSSProperties}>
              <Link className="button-primary" href="/services">Find your service <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link className="about-secondary-link" href="/services">View services</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
