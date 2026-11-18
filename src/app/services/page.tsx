"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${apiUrl}/api/services/categories`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load salon service categories.");
        const result = await response.json() as { categories: string[] };
        setCategories(result.categories);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load categories.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category) params.set("category", category);
      if (sort !== "newest") params.set("sort", sort);
      void fetch(`${apiUrl}/api/services?${params.toString()}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Could not load salon services. Try again in a moment.");
          const result = await response.json() as { services: Service[] };
          setServices(result.services);
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load salon services.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [category, retry, search, sort]);

  return (
    <main className="services-page">
      <header className="services-heading">
        <Link className="brand" href="/">SalonBook</Link>
        <p className="eyebrow">FIND YOUR SALON MOMENT</p>
        <h1>Services made for you</h1>
        <p>Explore treatments, compare prices, and find the right service for your next visit.</p>
      </header>

      <section className="service-controls" aria-label="Search and filter salon services">
        <label>Search by name
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try haircut or facial" />
        </label>
        <label>Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>Sort by price
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Recently added</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </section>

      {error ? (
        <section className="service-message service-error" role="alert">
          <h2>We couldn’t load services</h2><p>{error}</p>
          <button onClick={() => setRetry((value) => value + 1)}>Try again</button>
        </section>
      ) : loading ? (
        <section className="service-grid" aria-label="Loading services" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => <div className="service-skeleton" key={index} />)}
        </section>
      ) : services.length ? (
        <section className="service-grid" aria-label="Available salon services">
          {services.map((service) => (
            <article className="service-card" key={service._id}>
              <img src={service.image} alt={service.serviceName} />
              <div className="service-card-content">
                <p className="service-category">{service.category}</p>
                <h2>{service.serviceName}</h2>
                <p className="service-description">{service.description}</p>
                <div className="service-meta"><strong>৳{service.price.toLocaleString()}</strong><span>{service.duration} min</span></div>
                <Link className="service-link" href={`/services/${service._id}`}>View details <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="service-message">
          <h2>{search || category ? "No matching services" : "Services are on their way"}</h2>
          <p>{search || category ? "Try another name or choose a different category." : "There are no active salon services to show right now."}</p>
        </section>
      )}
    </main>
  );
}
