import Image from "next/image";

export function AuthVisual() {
  return (
    <aside className="auth-visual" aria-label="A little more about SalonBook">
      <Image className="auth-visual-image" src="/images/salon-barbershop.jpg" alt="A calm, thoughtfully arranged salon interior" fill priority sizes="(max-width: 850px) 100vw, 50vw" />
      <div className="auth-visual-shade" aria-hidden="true" />
      <div className="auth-visual-content">
        <span className="auth-visual-kicker"><span aria-hidden="true">✳</span> A SALONBOOK MOMENT</span>
        <div>
          <p className="auth-visual-overline">MAKE A LITTLE ROOM FOR YOU</p>
          <h2>Good hair days<br />start with good care.</h2>
          <p className="auth-visual-description">A thoughtful salon visit, made simple—from choosing a service to keeping your appointment close at hand.</p>
        </div>
        <div className="auth-visual-note">
          <span className="auth-visual-quote-mark" aria-hidden="true">“</span>
          <p>A little care can change the feel of your whole day.</p>
          <span className="auth-visual-note-byline">A SalonBook reminder</span>
        </div>
      </div>
      <span className="auth-visual-orbit auth-visual-orbit-one" aria-hidden="true" />
      <span className="auth-visual-orbit auth-visual-orbit-two" aria-hidden="true" />
    </aside>
  );
}
