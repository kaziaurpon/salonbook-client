import Link from "next/link";
import type { CSSProperties } from "react";
import { getServiceImage } from "@/lib/service-images";

export type PublicService = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

export function ServiceCard({ service, featured = false, revealIndex = 0 }: { service: PublicService; featured?: boolean; revealIndex?: number }) {
  return (
    <Link className={`service-card service-card-enter${featured ? " featured-service-card" : ""}`} style={{ "--reveal-delay": `${revealIndex * 60}ms` } as CSSProperties} href={`/services/${service._id}`} aria-label={`View ${service.serviceName} details`}>
      <div className="service-image-link">
        <img className="service-card-image" src={getServiceImage(service.serviceName, service.image)} alt={service.serviceName} loading="lazy" />
        <span className="image-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="service-card-content">
        <p className="service-category">{service.category}</p>
        <h3>{service.serviceName}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-meta"><strong>৳{service.price.toLocaleString()}</strong><span>{service.duration} min</span></div>
        <span className="service-link">Explore service <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
