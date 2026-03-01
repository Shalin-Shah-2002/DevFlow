import type { LandingPageData } from '../../models/landing.model';

type FooterProps = {
  footer: LandingPageData['footer'];
};

export const Footer = ({ footer }: FooterProps) => {
  return (
    <footer className="footer-section" id="about">
      <div className="container footer-main">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-wrap footer-logo">
              <img src={footer.logoIcon} alt="DevFlow logo" className="logo-icon" />
              <span className="logo-text footer-logo-text">{footer.logoText}</span>
            </div>
            <p>
              {footer.description.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>

          <div className="footer-links">
            {footer.columns.map((column) => (
              <div key={column.title} className="footer-col">
                <h4>{column.title}</h4>
                {column.links.map((link) => (
                  <a href="#" key={link}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>{footer.legalText}</span>
          <div className="social-icons">
            {footer.socialIcons.map((icon, idx) => (
              <img src={icon} key={icon} alt={`Social ${idx + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
