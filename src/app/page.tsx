"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { ServiceCard, type PublicService } from "@/components/service-card";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type PublicCategory = { name: string; image: string };

export default function HomePage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");
      void Promise.all([
        fetch(`${apiUrl}/api/services/featured?limit=6`, { signal: controller.signal }),
        fetch(`${apiUrl}/api/services/category-cards`, { signal: controller.signal }),
      ]).then(async ([featuredResponse, categoriesResponse]) => {
        if (!featuredResponse.ok || !categoriesResponse.ok) throw new Error("We couldn’t reach the salon menu. Please try again.");
        const featuredResult = await featuredResponse.json() as { services: PublicService[] };
        const categoryResult = await categoriesResponse.json() as { categories: PublicCategory[] };
        setServices(featuredResult.services);
        setCategories(categoryResult.categories);
      }).catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load salon information.");
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    });
    return () => controller.abort();
  }, [retry]);

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
            <span className="hero-photo-kicker"><span aria-hidden="true">✳</span> THE SALON, IN FOCUS</span>
            <div className="art-label"><span>YOUR NEXT VISIT</span><strong>Starts here.</strong><small>Thoughtful care, at your pace.</small></div>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line" /><span>CARE, CONSIDERED</span></div>
        </section>

        <section className="featured-section page-section" aria-labelledby="featured-heading">
          <div className="section-heading">
            <div><p className="eyebrow">A GOOD PLACE TO START</p><h2 id="featured-heading">A few favourites</h2></div>
            <Link className="text-arrow-link" href="/services">View all services <span aria-hidden="true">→</span></Link>
          </div>
          {error ? (
            <div className="public-state error-state" role="alert"><span className="state-symbol">!</span><h3>Our service menu took a pause.</h3><p>{error}</p><button className="button-primary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
          ) : loading ? (
            <div className="service-grid" aria-busy="true" aria-label="Loading featured services">{Array.from({ length: 3 }, (_, index) => <div className="service-skeleton" key={index} />)}</div>
          ) : services.length ? (
            <div className="service-grid">{services.map((service) => <ServiceCard key={service._id} service={service} featured />)}</div>
          ) : (
            <div className="public-state"><span className="state-symbol">✳</span><h3>Something lovely is on its way.</h3><p>There are no active services to feature just yet. Please check back soon.</p><Link className="text-arrow-link" href="/services">Browse the service menu <span aria-hidden="true">→</span></Link></div>
          )}
        </section>

        <section className="category-section page-section" aria-labelledby="category-heading">
          <div className="category-intro"><p className="eyebrow">FIND YOUR KIND OF CARE</p><h2 id="category-heading">What are you in the mood for?</h2><p>Start with a category, then discover the details that feel right for you.</p></div>
          {error ? <p className="category-hint">Categories will appear when the service menu is available.</p> : loading ? <div className="category-cards" aria-busy="true" aria-label="Loading service categories">{Array.from({ length: 4 }, (_, index) => <span className="category-placeholder" key={index} />)}</div> : categories.length ? (
            <div className="category-cards">{categories.map((category, index) => <Link className="category-card" key={category.name} href={`/services?category=${encodeURIComponent(category.name)}`}><div className="category-card-image-wrap"><img src={category.image} alt="" className="category-card-image" loading="lazy" /><span className="category-number">0{index + 1}</span></div><div className="category-card-label"><span>{category.name}</span><span className="category-arrow" aria-hidden="true">↗</span></div></Link>)}</div>
          ) : <p className="category-hint">Service categories will appear here when they are available.</p>}
        </section>

        <section id="about" className="visit-section page-section" aria-labelledby="visit-heading">
          <div className="visit-visual"><div className="visit-visual-circle"><span>YOUR<br />NEXT<br /><em>MOMENT</em></span></div><span className="visit-stamp">A LITTLE TIME FOR YOU · A LITTLE TIME FOR YOU ·</span></div>
          <div className="visit-copy"><p className="eyebrow">ABOUT SALONBOOK</p><h2 id="visit-heading">A little more care, made easier to find.</h2><p>SalonBook brings salon services, clear pricing, and available appointment times together in one place. Choose the care that suits you, send a request, then follow its status from your personal dashboard.</p><ol className="visit-steps"><li><span>01</span> Explore salon services</li><li><span>02</span> Choose a date and open time</li><li><span>03</span> Track your appointment</li></ol><Link className="button-primary" href="/services">Find your service <span aria-hidden="true">↗</span></Link></div>
        </section>
      </main>
    </PublicShell>
  );
}
