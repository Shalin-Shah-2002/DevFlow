import type { LandingPageData } from '../../models/landing.model';

type FeaturesSectionProps = {
  features: LandingPageData['features'];
};

export const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-head">
          <h2>{features.heading}</h2>
          <p>
            {features.subheading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>

        <div className="features-grid">
          {features.items.map((item) => (
            <article key={item.title} className="feature-card">
              <div className="feature-icon-wrap">
                <img src={item.icon} alt="" className="feature-icon" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
