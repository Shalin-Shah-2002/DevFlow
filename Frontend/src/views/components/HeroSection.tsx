import type { LandingPageData } from '../../models/landing.model';

type HeroSectionProps = {
  hero: LandingPageData['hero'];
};

export const HeroSection = ({ hero }: HeroSectionProps) => {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-content">
          <p className="hero-eyebrow">{hero.eyebrow}</p>

          <h1 className="hero-title">
            {hero.heading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="hero-subtitle">
            {hero.subheading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              {hero.primaryCta}
              <span className="arrow">→</span>
            </button>
            <button className="btn btn-secondary" type="button">
              {hero.secondaryCta}
            </button>
          </div>

          <div className="hero-proof">
            <div className="avatar-group">
              {hero.avatars.map((avatar, index) => (
                <img key={avatar} src={avatar} alt={`Developer ${index + 1}`} className="avatar" />
              ))}
              <span className="avatar-more">{hero.extraCount}</span>
            </div>
            <span className="proof-text">{hero.socialProof}</span>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-head">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="preview-body">
            <img src={hero.previewImage} alt="Dashboard preview" className="preview-image" />
          </div>
        </div>
      </div>
    </section>
  );
};
