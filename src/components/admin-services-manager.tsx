"use client";

import Link from "next/link";
import { getServiceImage } from "@/lib/service-images";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedApiFetch } from "@/lib/api";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
};

type ServiceForm = Omit<Service, "_id" | "createdAt">;
type ApiResult<T> = T & { message?: string };

const blankForm: ServiceForm = { serviceName: "", category: "", description: "", price: 0, duration: 30, image: "", status: "active" };

async function readMessage(response: Response) {
  const payload = await response.json().catch(() => ({})) as ApiResult<Record<string, unknown>>;
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status}).`);
  return payload;
}

export function AdminServicesManager() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedApiFetch(`/api/admin/services?page=${page}&limit=12`);
      const result = await readMessage(response) as ApiResult<{ services: Service[]; pages: number }>;
      setServices(result.services);
      setPages(result.pages || 1);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not load the service list.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
    if (user.isBlocked) {
      void authClient.signOut().then(() => router.replace("/login"));
    } else if (user.role !== "admin") {
      router.replace("/dashboard/customer");
    } else {
      let active = true;
      queueMicrotask(() => { if (active) void loadServices(); });
      return () => { active = false; };
    }
  }, [isPending, loadServices, router, session]);

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await authenticatedApiFetch("/api/admin/services/upload-image", { method: "POST", body });
      const result = await readMessage(response) as ApiResult<{ image: string }>;
      setForm((current) => ({ ...current, image: result.image }));
      toast.success("Service image uploaded.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not upload the image.");
    } finally {
      setUploading(false);
    }
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.image) {
      toast.error("Upload a service image before saving.");
      return;
    }
    setSaving(true);
    try {
      const response = await authenticatedApiFetch(
        editingId ? `/api/admin/services/${editingId}` : "/api/admin/services",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) },
      );
      await readMessage(response);
      toast.success(editingId ? "Service updated." : "Service added.");
      setForm(blankForm);
      setEditingId("");
      setFormOpen(false);
      await loadServices();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not save the service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(service: Service) {
    const status = service.status === "active" ? "inactive" : "active";
    try {
      const response = await authenticatedApiFetch(`/api/admin/services/${service._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await readMessage(response);
      toast.success(`Service ${status === "active" ? "activated" : "deactivated"}.`);
      await loadServices();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not change the service status.");
    }
  }

  async function deleteService(service: Service) {
    try {
      const response = await authenticatedApiFetch(`/api/admin/services/${service._id}`, { method: "DELETE" });
      await readMessage(response);
      toast.success("Service deleted.");
      setPendingDelete(null);
      await loadServices();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not delete the service.");
    }
  }

  function beginEdit(service: Service) {
    setEditingId(service._id);
    setFormOpen(true);
    setForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: service.image,
      status: service.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isPending || !session) return <main className="auth-page"><p>Checking admin access…</p></main>;
  const user = session.user as typeof session.user & { role?: string; isBlocked?: boolean };
  if (user.role !== "admin" || user.isBlocked) return <main className="auth-page"><p>Redirecting…</p></main>;

  return (
    <main className="admin-services-page">
      <header className="admin-services-heading">
        <div><Link href="/dashboard/admin" className="brand">← Admin dashboard</Link><p className="eyebrow">SERVICE CATALOG</p><h1>Manage services</h1><p>Add, update, activate, or remove salon services.</p></div>
        <div className="admin-service-heading-actions"><button className="button-primary" onClick={() => { setEditingId(""); setForm(blankForm); setFormOpen(true); }}>+ Add Service</button><button className="secondary-button admin-refresh" onClick={() => void loadServices()} disabled={loading}>Refresh list</button></div>
      </header>

      {formOpen && <section className="admin-service-form-card">
        <h2>{editingId ? "Update service" : "Add a service"}</h2>
        <form className="admin-service-form" onSubmit={saveService}>
          <label>Service name<input required minLength={2} maxLength={120} value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} /></label>
          <label>Category<input required minLength={2} maxLength={80} placeholder="e.g. Haircut & Styling" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
          <label className="wide-field">Description<textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label>Price (৳)<input required type="number" min="1" step="0.01" value={form.price || ""} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
          <label>Duration (minutes)<input required type="number" min="1" step="1" value={form.duration || ""} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} /></label>
          <label>Service status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ServiceForm["status"] })}><option value="active">Active</option><option value="inactive">Inactive</option></select><small>New services are active by default.</small></label>
          <label className="wide-field">Service image (JPG, PNG, WebP; up to 5 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])} disabled={uploading} />
            {uploading && <small>Uploading image…</small>}
            {form.image && <span className="upload-success">Image uploaded and ready to save.</span>}
          </label>
          <div className="admin-form-actions wide-field">
            <button disabled={saving || uploading}>{saving ? "Saving…" : editingId ? "Save changes" : "Add service"}</button>
            <button type="button" className="secondary-button" onClick={() => { setEditingId(""); setForm(blankForm); setFormOpen(false); }}>{editingId ? "Cancel edit" : "Close"}</button>
          </div>
        </form>
      </section>}

      <section className="admin-service-list">
        <h2>All services <span>{services.length}</span></h2>
        {loading ? <p className="service-message">Loading services…</p> : error ? <div className="service-message service-error"><p>{error}</p><button onClick={() => void loadServices()}>Try again</button></div> : services.length === 0 ? <p className="service-message">No services yet. Use “+ Add Service” to create the first salon service.</p> : (
          <div className="admin-service-items">
            {services.map((service) => (
              <article className="admin-service-item" key={service._id}>
                <img src={getServiceImage(service.serviceName, service.image)} alt="" />
                <div className="admin-service-info"><p className="service-category">{service.category}</p><h3>{service.serviceName}</h3><p>৳{service.price.toLocaleString()} · {service.duration} min</p></div>
                <span className={`status-pill ${service.status}`}>{service.status}</span>
                <div className="admin-item-actions">
                  <button className="text-button" onClick={() => beginEdit(service)}>Update</button>
                  <button className="text-button" onClick={() => void toggleStatus(service)}>{service.status === "active" ? "Deactivate" : "Activate"}</button>
                  <button className="text-button danger-text" onClick={() => setPendingDelete(service)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && pages > 1 && <nav className="admin-pagination" aria-label="Service list pages"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><span>Page {page} of {pages}</span><button className="secondary-button" disabled={page >= pages} onClick={() => setPage((current) => Math.min(pages, current + 1))}>Next</button></nav>}
      </section>
      {pendingDelete && <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}><section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-service-title" aria-describedby="delete-service-description"><p className="eyebrow">REMOVE FROM CATALOG</p><h2 id="delete-service-title">Delete this service?</h2><p id="delete-service-description">“{pendingDelete.serviceName}” will be permanently removed. Existing appointment records remain in your history.</p><div><button className="secondary-button" onClick={() => setPendingDelete(null)}>Keep service</button><button className="danger-button" onClick={() => void deleteService(pendingDelete)}>Delete service</button></div></section></div>}
    </main>
  );
}
