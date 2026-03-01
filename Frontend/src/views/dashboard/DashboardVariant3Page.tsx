import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getDashboardVariant3Data } from '../../controllers/dashboard.controller';
import { dashboardFallbackData, type DashboardViewModel, type IssueCard } from '../../models/dashboard.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from './components/DashboardSidebar';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

const itemUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32 } }
};

const priorityClass = (priority: IssueCard['priority']) => {
  if (priority === 'HIGH') return 'priority-chip priority-high';
  if (priority === 'MEDIUM') return 'priority-chip priority-medium';
  return 'priority-chip priority-low';
};

const trendClass = (trend: 'up' | 'down') => (trend === 'up' ? 'trend up' : 'trend down');

export const DashboardVariant3Page = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardViewModel>(dashboardFallbackData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getDashboardVariant3Data(state.token)
      .then((result) => setData(result))
      .finally(() => setLoading(false));
  }, [state.token]);

  const filteredIssues = useMemo(() => {
    if (!search.trim()) {
      return data.issueCards;
    }

    const query = search.toLowerCase();
    return data.issueCards.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        String(item.number).includes(query)
    );
  }, [data.issueCards, search]);

  const velocityMax = Math.max(...data.velocity.map((point) => point.velocity), 10);

  return (
    <div className="dv3-page">
      <DashboardSidebar authState={state} unreadCount={data.unreadCount} />

      <main className="dv3-main">
        <header className="dv3-header">
          <div>
            <h2>Dashboard Overview</h2>
            <p>Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>

          <div className="dv3-header-actions">
            <label className="dv3-search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search issues..."
              />
            </label>
            <button className="icon-btn" type="button" aria-label="Notifications">
              •
            </button>
            <button className="new-btn" type="button" onClick={() => navigate('/app/issues?new=1')}>
              + New Issue
            </button>
          </div>
        </header>

        <motion.section className="dv3-overview" variants={stagger} initial="hidden" animate="show">
          <motion.article className="dv3-metrics" variants={itemUp}>
            <h3>Sprint Metrics</h3>
            {data.metrics.map((metric) => (
              <div key={metric.label} className="metric-item">
                <strong>{metric.value}</strong>
                <div>
                  <span>{metric.label}</span>
                  <em className={trendClass(metric.trend)}>{metric.delta}</em>
                </div>
              </div>
            ))}
            <button type="button">View Full Report</button>
          </motion.article>

          <motion.article className="dv3-chart" variants={itemUp}>
            <div className="dv3-chart-head">
              <h3>Team Velocity</h3>
              <span>Last 30 Days</span>
            </div>
            <div className="dv3-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.velocity} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis hide domain={[0, velocityMax + 10]} />
                  <Bar dataKey="velocity" radius={[8, 8, 0, 0]}>
                    {data.velocity.map((point, index) => (
                      <Cell key={point.week} fill={index === 2 || index === 3 ? '#1d4fd7' : '#94a9e2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.article>

          <motion.article className="dv3-activity" variants={itemUp}>
            <div className="dv3-activity-head">
              <h3>Recent Activity</h3>
            </div>

            <motion.div className="activity-list" variants={stagger} initial="hidden" animate="show">
              {data.activities.map((activity) => (
                <motion.div key={activity.id} className="activity-item" variants={itemUp}>
                  <div className="mini-avatar">{activity.actor[0]}</div>
                  <div>
                    <p>
                      <strong>{activity.actor}</strong> {activity.action}{' '}
                      <span style={{ color: activity.targetAccent }}>{activity.target}</span>
                    </p>
                    <small>{activity.timeAgo}</small>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <a href="#" className="activity-link">
              View all activity →
            </a>
          </motion.article>
        </motion.section>

        <motion.section className="dv3-grid-wrap" variants={stagger} initial="hidden" animate="show">
          <motion.article className="dv3-issue-card" variants={itemUp}>
            {filteredIssues[0] ? <IssueCardView issue={filteredIssues[0]} /> : <IssueEmpty />}
          </motion.article>

          <motion.article className="dv3-repo-health" variants={itemUp}>
            <h4>Repo Health</h4>
            {data.repoHealth.map((repo) => (
              <div key={repo.id} className="repo-health-item">
                <div className="repo-health-label">
                  <span>{repo.name}</span>
                  <span>{repo.passing}% passing</span>
                </div>
                <div className="repo-health-track">
                  <div style={{ width: `${repo.passing}%` }} />
                </div>
              </div>
            ))}
          </motion.article>

          <motion.article className="dv3-issue-card" variants={itemUp}>
            {filteredIssues[1] ? <IssueCardView issue={filteredIssues[1]} /> : <IssueEmpty />}
          </motion.article>

          <motion.article className="dv3-workload" variants={itemUp}>
            <div className="dv3-workload-head">
              <h4>Team Workload</h4>
              <span>Current Sprint</span>
            </div>
            <div className="dv3-workload-grid">
              {data.workload.map((slot) => (
                <div key={slot.team} className="workload-box">
                  <p>{slot.team}</p>
                  <strong>{slot.tasks}</strong>
                  <em className={`note ${slot.status}`}>{slot.note}</em>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article className="dv3-issue-card" variants={itemUp}>
            {filteredIssues[2] ? <IssueCardView issue={filteredIssues[2]} /> : <IssueEmpty />}
          </motion.article>
        </motion.section>

        {loading && <div className="dv3-loading">Refreshing dashboard from API…</div>}
      </main>
    </div>
  );
};

const IssueCardView = ({ issue }: { issue: IssueCard }) => {
  return (
    <>
      <div className="issue-top">
        <span className={priorityClass(issue.priority)}>{issue.priority} PRIORITY</span>
        <small>#{issue.number}</small>
      </div>

      <h4>{issue.title}</h4>

      <div className="issue-tags">
        {issue.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="issue-bottom">
        <div className="issue-assignees">
          {issue.assignees.map((avatar, index) => (
            <span key={`${avatar}-${index}`}>{avatar}</span>
          ))}
        </div>

        <div className="issue-meta">
          <span>💬 {issue.comments}</span>
          <span>⏱ {issue.age}</span>
        </div>
      </div>
    </>
  );
};

const IssueEmpty = () => {
  return <div className="issue-empty">No issues match this filter.</div>;
};
