import type { LandingPageData } from '../../models/landing.model';

type HowItWorksProps = {
  steps: LandingPageData['steps'];
};

export const HowItWorksSection = ({ steps }: HowItWorksProps) => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <h2>{steps.heading}</h2>
          <p>{steps.subheading}</p>
        </div>

        <div className="steps-grid">
          <div className="steps-line" />
          {steps.items.map((item) => (
            <article key={item.number} className="step-card">
              <div className="step-number">{item.number}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
