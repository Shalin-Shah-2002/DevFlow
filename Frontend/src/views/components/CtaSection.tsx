import type { LandingPageData } from '../../models/landing.model';

type CtaSectionProps = {
  cta: LandingPageData['cta'];
};

export const CtaSection = ({ cta }: CtaSectionProps) => {
  return (
    <section className="cta-shell">
      <div className="container">
        <div className="cta-card">
          <div className="cta-bubble cta-bubble-left" />
          <div className="cta-bubble cta-bubble-right" />

          <h2>{cta.heading}</h2>
          <p>
            {cta.subheading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>

          <div className="cta-actions">
            <button type="button" className="btn btn-white">
              {cta.primary}
            </button>
            <button type="button" className="btn btn-outline">
              {cta.secondary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
