import Link from "next/link";
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

export function ServiceCard({ service, featured = false }: { service: PublicService; featured?: boolean }) {
  return (
    <Link className={`service-card${featured ? " featured-service-card" : ""}`} href={`/services/${service._id}`} aria-label={`View ${service.serviceName} details`}>
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
