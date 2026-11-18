"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Service = {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = session.user as typeof session.user & { isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/login"));
      return;
    }
    const controller = new AbortController();
    void fetch(`${apiUrl}/api/services/${encodeURIComponent(params.id)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { service?: Service; message?: string };
        if (!response.ok || !result.service) throw new Error(result.message || "This service is unavailable.");
        setService(result.service);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the service.");
      });
    return () => controller.abort();
  }, [isPending, params.id, router, session]);

  if (isPending || (!service && !error)) return <main className="auth-page"><p>Checking your sign-in and loading service…</p></main>;
  if (error) return <main className="service-message service-error"><h1>Service unavailable</h1><p>{error}</p><Link href="/services">Back to services</Link></main>;
  if (!service) return null;

  return (
    <main className="service-detail-page">
      <Link className="brand" href="/services">← All services</Link>
      <article className="service-detail-card">
        <img src={service.image} alt={service.serviceName} />
        <div>
          <p className="service-category">{service.category}</p>
          <h1>{service.serviceName}</h1>
          <p>{service.description}</p>
          <div className="service-meta"><strong>৳{service.price.toLocaleString()}</strong><span>{service.duration} minutes</span></div>
          <p className="detail-note">Appointment requests will be available here in the next booking feature.</p>
        </div>
      </article>
    </main>
  );
}
