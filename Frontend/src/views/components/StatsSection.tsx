import type { LandingPageData } from '../../models/landing.model';

type StatsSectionProps = {
  stats: LandingPageData['stats'];
};

export const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <section className="stats-section" id="pricing">
      <div className="github-animation-wrap">
        <div className="pixel-scene" aria-hidden="true">
          <div className="pixel-grid-overlay" />
          <div className="pixel-track" />
          <div className="checkpoint-way">
            <div className="checkpoint cp-1">
              <span className="checkpoint-pin" />
              <span className="checkpoint-label">#1 issue solved</span>
            </div>
            <div className="checkpoint cp-2">
              <span className="checkpoint-pin" />
              <span className="checkpoint-label">#8 issues solved</span>
            </div>
            <div className="checkpoint cp-3">
              <span className="checkpoint-pin" />
              <span className="checkpoint-label">#22 bugs solved</span>
            </div>
            <div className="checkpoint cp-4">
              <span className="checkpoint-pin" />
              <span className="checkpoint-label">#50 PR reviewed</span>
            </div>
          </div>

          <div className="github-targets">
            <article className="github-target target-issues">
              <span className="target-dot" />
              <h3>GitHub Issues</h3>
              <p>{stats[2]?.value ?? '1.2M+'} synced</p>
            </article>
            <article className="github-target target-prs">
              <span className="target-dot" />
              <h3>Pull Requests</h3>
              <p>{stats[3]?.value ?? '500+'} teams</p>
            </article>
          </div>

          <div className="pixel-runner">
            <span className="runner-head" />
            <span className="runner-body" />
            <span className="runner-arm arm-front" />
            <span className="runner-arm arm-back" />
            <span className="runner-leg leg-front" />
            <span className="runner-leg leg-back" />
          </div>

          <div className="runner-trail">
            <span className="trail-pixel t1" />
            <span className="trail-pixel t2" />
            <span className="trail-pixel t3" />
            <span className="trail-pixel t4" />
          </div>
        </div>
      </div>
    </section>
  );
};
