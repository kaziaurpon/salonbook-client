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
    <article className={`service-card${featured ? " featured-service-card" : ""}`}>
      <Link className="service-image-link" href={`/services/${service._id}`} aria-label={`View ${service.serviceName} details`}>
        <img className="service-card-image" src={getServiceImage(service.serviceName, service.image)} alt={service.serviceName} loading="lazy" />
        <span className="image-arrow" aria-hidden="true">↗</span>
      </Link>
      <div className="service-card-content">
        <p className="service-category">{service.category}</p>
        <h3><Link href={`/services/${service._id}`}>{service.serviceName}</Link></h3>
        <p className="service-description">{service.description}</p>
        <div className="service-meta"><strong>৳{service.price.toLocaleString()}</strong><span>{service.duration} min</span></div>
        <Link className="service-link" href={`/services/${service._id}`}>Explore service <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
