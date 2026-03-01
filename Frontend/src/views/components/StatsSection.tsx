import type { LandingPageData } from '../../models/landing.model';

type StatsSectionProps = {
  stats: LandingPageData['stats'];
};

export const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <section className="stats-section" id="pricing">
      <div className="container stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
