"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { ServiceCard, type PublicService } from "@/components/service-card";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function BrowseServicesPage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setCategory(query.get("category") || "");
      setSearch(query.get("q") || "");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category) params.set("category", category);
      if (sort !== "newest") params.set("sort", sort);
      setLoading(true);
      setError("");
      void Promise.all([
        fetch(`${apiUrl}/api/services?${params.toString()}`, { signal: controller.signal }),
        fetch(`${apiUrl}/api/services/categories`, { signal: controller.signal }),
      ]).then(async ([servicesResponse, categoriesResponse]) => {
        if (!servicesResponse.ok || !categoriesResponse.ok) throw new Error("Could not load the salon menu. Check that the API is running, then try again.");
        const serviceResult = await servicesResponse.json() as { services: PublicService[] };
        const categoryResult = await categoriesResponse.json() as { categories: string[] };
        setServices(serviceResult.services);
        setCategories(categoryResult.categories);
      }).catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load salon services.");
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, 100);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [category, retry, search, sort]);

  const hasFilters = Boolean(search || category);

  return (
    <PublicShell>
      <main className="browse-page">
        <section className="browse-hero">
          <p className="eyebrow"><span className="eyebrow-line" /> THE SERVICE MENU</p>
          <h1>Find a little <em>time for you.</em></h1>
          <p>Browse salon services, compare the details, and choose what feels right for your next visit.</p>
          <span className="browse-count">A thoughtful menu, made easy to explore</span>
        </section>

        <section className="browse-controls-wrap" aria-label="Search and filter services">
          <div className="browse-controls-title"><span>MAKE IT YOURS</span><span>FILTER THE MENU</span></div>
          <div className="service-controls">
            <label>Search services<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try a haircut or facial" /></label>
            <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
          </div>
        </section>

        <section className="browse-results" aria-live="polite">
          <div className="results-heading"><p>{loading ? "Finding your options…" : error ? "Service menu unavailable" : `${services.length} ${services.length === 1 ? "service" : "services"}${hasFilters ? " match your search" : " to explore"}`}</p><span>ACTIVE SERVICES</span></div>
          {error ? <div className="public-state error-state" role="alert"><span className="state-symbol">!</span><h2>We couldn’t load the services.</h2><p>{error}</p><button className="button-primary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
            : loading ? <div className="service-grid" aria-busy="true" aria-label="Loading services">{Array.from({ length: 6 }, (_, index) => <div className="service-skeleton" key={index} />)}</div>
              : services.length ? <div className="service-grid">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div>
                : <div className="public-state"><span className="state-symbol">✳</span><h2>{hasFilters ? "No services match those filters." : "The menu is getting ready."}</h2><p>{hasFilters ? "Try a different search or clear the filters to see all active services." : "There are no active salon services right now. Please check back soon."}</p>{hasFilters ? <button className="button-primary" onClick={() => { setSearch(""); setCategory(""); }}>Clear filters</button> : <Link className="text-arrow-link" href="/">Back to home <span aria-hidden="true">→</span></Link>}</div>}
        </section>
      </main>
    </PublicShell>
  );
}
