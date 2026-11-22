import type { HTMLAttributes, ReactNode } from "react";

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  width?: string;
  height?: string;
  radius?: string;
};

export function Skeleton({ width, height, radius, className = "", style, ...props }: SkeletonProps) {
  return <span className={`salon-skeleton ${className}`.trim()} aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} {...props} />;
}

export function ServiceCardSkeleton() {
  return (
    <article className="service-card-skeleton" aria-hidden="true">
      <Skeleton className="service-card-skeleton-image" />
      <div className="service-card-skeleton-content">
        <Skeleton className="service-card-skeleton-category" />
        <Skeleton className="service-card-skeleton-title" />
        <Skeleton className="service-card-skeleton-description" />
        <Skeleton className="service-card-skeleton-description short" />
        <div className="service-card-skeleton-meta"><Skeleton /><Skeleton /></div>
        <Skeleton className="service-card-skeleton-link" />
      </div>
    </article>
  );
}

export function ServiceSkeletonGrid() {
  return <div className="service-loading-state" role="status" aria-live="polite" aria-busy="true"><p className="service-loading-heading">Finding the best services for you...</p><div className="service-grid">{Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div></div>;
}

export function ScissorsLoader({ label = "Preparing your dashboard...", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div className={`scissors-loader${compact ? " compact" : ""}`} role="status" aria-live="polite" aria-busy="true">
      <svg className="scissors-loader-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <g className="scissors-blade scissors-blade-top"><path d="M21 24 41 7M21 24 11 12" /><circle cx="8" cy="9" r="5" /></g>
        <g className="scissors-blade scissors-blade-bottom"><path d="M21 24 41 41M21 24 11 36" /><circle cx="8" cy="39" r="5" /></g>
        <circle className="scissors-pivot" cx="22" cy="24" r="2.5" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}

export function ButtonLoader({ label, success = false }: { label: string; success?: boolean }) {
  if (success) {
    return <span className="button-loader-success" role="status" aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>{label}</span>;
  }
  return <span className="button-loader-content" role="status" aria-live="polite" aria-busy="true"><ScissorsLoader label="" compact />{label}</span>;
}

type PaymentOverlayProps = {
  state: "processing" | "success" | "error";
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
};

export function PaymentOverlay({ state, message, onRetry, onClose }: PaymentOverlayProps) {
  const isProcessing = state === "processing";
  return (
    <div className="payment-overlay">
      <span className="sr-only" role="status" aria-live="polite" aria-busy={isProcessing}>{isProcessing ? "Securing your payment..." : state === "success" ? "Payment secured" : "Payment could not start"}</span>
      <section className="payment-overlay-card" role="dialog" aria-modal="true" aria-label="Payment status">
        <div className={`payment-brand-mark ${state}`} aria-hidden="true">
          {isProcessing ? <img src="/images/salonbook-mark.png" alt="" /> : state === "success" ? <svg viewBox="0 0 48 48"><path d="m11 25 8 8L37 15" /></svg> : <span>!</span>}
        </div>
        <h2>{isProcessing ? "Securing your payment..." : state === "success" ? "Payment secured" : "Payment could not start"}</h2>
        <p>{message || (isProcessing ? "Please don't close or refresh this page." : state === "success" ? "Your payment status has been updated." : "Check your connection, then try again.")}</p>
        {state !== "processing" && <div className="payment-overlay-actions">
          {state === "error" && onRetry && <button className="button-primary" onClick={onRetry}>Retry payment</button>}
          {onClose && <button className="secondary-button" onClick={onClose}>{state === "success" ? "Done" : "Back to appointments"}</button>}
        </div>}
      </section>
    </div>
  );
}

export function PageLoader({ label = "One moment...", children }: { label?: string; children?: ReactNode }) {
  return <div className="salon-page-loader"><ScissorsLoader label={label} />{children}</div>;
}

export function AppointmentOverlay() {
  return (
    <div className="appointment-loading-overlay" role="presentation">
      <section className="appointment-loading-card" role="status" aria-live="polite" aria-busy="true">
        <span className="appointment-loading-mark" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><g className="scissors-blade scissors-blade-top"><path d="M21 24 41 7M21 24 11 12" /><circle cx="8" cy="9" r="5" /></g><g className="scissors-blade scissors-blade-bottom"><path d="M21 24 41 41M21 24 11 36" /><circle cx="8" cy="39" r="5" /></g><circle className="scissors-pivot" cx="22" cy="24" r="2.5" /></svg></span>
        <p className="eyebrow">SALONBOOK · YOUR NEXT VISIT</p>
        <h2>Booking your slot...</h2>
        <p>Sending your appointment request to the salon.</p>
        <span className="appointment-loading-progress" aria-hidden="true" />
      </section>
    </div>
  );
}

export function DashboardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="dashboard-loading-state" role="status" aria-live="polite" aria-busy="true">
      <ScissorsLoader label="Preparing your dashboard..." />
      <div className="dashboard-skeleton-stats">{Array.from({ length: 4 }, (_, index) => <div className="dashboard-skeleton-stat" key={index}><Skeleton width="45%" height=".7rem" /><Skeleton width="32%" height="1.5rem" /><Skeleton width="68%" height=".6rem" /></div>)}</div>
      <div className="dashboard-skeleton-rows">{Array.from({ length: rows }, (_, index) => <div className="dashboard-skeleton-row" key={index}><Skeleton className="dashboard-skeleton-avatar" /><Skeleton width="32%" height=".8rem" /><Skeleton width="48%" height=".65rem" /></div>)}</div>
    </div>
  );
}

export const minimumLoader = (duration = 400) => new Promise<void>((resolve) => window.setTimeout(resolve, duration));
