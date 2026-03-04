import type { LandingPageData } from '../../models/landing.model';

type CtaSectionProps = {
  cta: LandingPageData['cta'];
};

export const CtaSection = ({ cta }: CtaSectionProps) => {
  return (
    <section className="cta-shell">
      <div className="container">
        <div className="cta-split">
          <div className="cta-image-wrap" aria-hidden="true">
            <img src="/landing-cta-faded.png" alt="" className="cta-image-faded" />
          </div>

          <div className="cta-copy">
            <p className="cta-tagline">Build boldly. Ship confidently.</p>
            <h2>{cta.heading}</h2>
            <p>
              {cta.subheading.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
