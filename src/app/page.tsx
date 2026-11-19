"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { ServiceCard, type PublicService } from "@/components/service-card";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HomePage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void Promise.all([
      fetch(`${apiUrl}/api/services/featured?limit=6`, { signal: controller.signal }),
      fetch(`${apiUrl}/api/services/categories`, { signal: controller.signal }),
    ]).then(async ([featuredResponse, categoriesResponse]) => {
      if (!featuredResponse.ok || !categoriesResponse.ok) throw new Error("We couldn’t reach the salon menu. Please try again.");
      const featuredResult = await featuredResponse.json() as { services: PublicService[] };
      const categoryResult = await categoriesResponse.json() as { categories: string[] };
      setServices(featuredResult.services);
      setCategories(categoryResult.categories);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load salon information.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
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
          <div className="hero-art" aria-label="Abstract warm-toned salon-inspired illustration" role="img">
            <div className="art-sun" /><div className="art-arch art-arch-back" /><div className="art-arch art-arch-front" />
            <div className="art-leaf leaf-one" /><div className="art-leaf leaf-two" /><div className="art-leaf leaf-three" />
            <div className="art-vase" /><div className="art-orbit" />
            <div className="art-label"><span>YOUR TIME</span><strong>Well spent.</strong></div>
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
          {error ? <p className="category-hint">Categories will appear when the service menu is available.</p> : loading ? <div className="category-pills" aria-busy="true"><span className="category-placeholder" /><span className="category-placeholder" /><span className="category-placeholder" /></div> : categories.length ? (
            <div className="category-pills">{categories.map((category, index) => <Link className="category-pill" key={category} href={`/services?category=${encodeURIComponent(category)}`}><span className="category-number">0{index + 1}</span><span>{category}</span><span className="category-arrow" aria-hidden="true">↗</span></Link>)}</div>
          ) : <p className="category-hint">Service categories will appear here when they are available.</p>}
        </section>

        <section className="visit-section page-section" aria-labelledby="visit-heading">
          <div className="visit-visual"><div className="visit-visual-circle"><span>YOUR<br />NEXT<br /><em>MOMENT</em></span></div><span className="visit-stamp">A LITTLE TIME FOR YOU · A LITTLE TIME FOR YOU ·</span></div>
          <div className="visit-copy"><p className="eyebrow">SIMPLE FROM THE START</p><h2 id="visit-heading">Make room for a visit that feels like yours.</h2><p>Explore the menu, choose the service you want, and request an available time. We’ll keep your appointment details together so you can focus on looking forward to it.</p><ol className="visit-steps"><li><span>01</span> Find a service you love</li><li><span>02</span> Pick a date and open time</li><li><span>03</span> Send your appointment request</li></ol><Link className="button-primary" href="/services">Find your service <span aria-hidden="true">↗</span></Link></div>
        </section>
      </main>
    </PublicShell>
  );
}
