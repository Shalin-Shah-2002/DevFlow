import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getDashboardVariant3Data } from '../../controllers/dashboard.controller';
import { dashboardFallbackData, type DashboardViewModel } from '../../models/dashboard.model';
import { useAuth } from '../auth/useAuth';
import { DashboardSidebar } from './components/DashboardSidebar';
import { getCompletionRate, type CompletionRateData } from '../../controllers/analytics.controller';

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

const trendClass = (trend: 'up' | 'down') => (trend === 'up' ? 'trend up' : 'trend down');

export const DashboardVariant3Page = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardViewModel>(dashboardFallbackData);
  const [completionData, setCompletionData] = useState<CompletionRateData>({
    overall: { totalIssues: 0, closedIssues: 0, openIssues: 0, completionRate: 0 },
    byRepository: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.token) {
      return;
    }

    getDashboardVariant3Data(state.token)
      .then((result) => setData(result))
      .finally(() => setLoading(false));

    getCompletionRate(state.token)
      .then((completion) => setCompletionData(completion.data))
      .catch(() => {
        setCompletionData({
          overall: { totalIssues: 0, closedIssues: 0, openIssues: 0, completionRate: 0 },
          byRepository: []
        });
      });
  }, [state.token]);

  const velocityMax = Math.max(...data.velocity.map((point) => point.velocity), 10);
  const completionPieData = [
    { name: 'Closed', value: completionData.overall.closedIssues },
    { name: 'Open', value: completionData.overall.openIssues }
  ];
  const completionRepoData = (completionData.byRepository || []).slice(0, 4);
  const COMPLETION_COLORS = ['#1d4fd7', '#94a3b8'];

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
              <input placeholder="Search issues..." />
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

          <motion.article className="dv3-completion" variants={itemUp}>
            <h3>Completion Rate</h3>
            <div className="analytics-completion-overall">
              <div>
                <strong>{completionData.overall.completionRate}%</strong>
                <span>Overall Completion</span>
              </div>
              <ResponsiveContainer width="50%" height={150}>
                <PieChart>
                  <Pie data={completionPieData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={52}>
                    {completionPieData.map((_, index) => (
                      <Cell key={`dashboard-completion-${index}`} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-completion-list">
              {completionRepoData.map((repo) => (
                <div key={repo.repositoryId} className="analytics-completion-row">
                  <div>
                    <p>{repo.name}</p>
                    <small>
                      {repo.closedIssues}/{repo.totalIssues} closed
                    </small>
                  </div>
                  <strong>{repo.completionRate}%</strong>
                </div>
              ))}
              {completionRepoData.length === 0 && <div className="analytics-empty">No completion data</div>}
            </div>
          </motion.article>

        </motion.section>

        <motion.section className="dv3-grid-wrap dv3-grid-wrap-repo-only" variants={stagger} initial="hidden" animate="show">
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
        </motion.section>

        {loading && <div className="dv3-loading">Refreshing dashboard from API…</div>}
      </main>
    </div>
  );
};
