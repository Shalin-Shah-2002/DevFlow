import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { useAuth } from '../auth/useAuth';
import {
  type AssigneeWorkloadRow,
  type CompletionRateData,
  type IssuesByRepoRow,
  type IssuesByStatusData,
  type IssuesOverTimeData,
  getAssigneeWorkload,
  getCompletionRate,
  getIssuesByRepo,
  getIssuesByStatus,
  getIssuesOverTime
} from '../../controllers/analytics.controller';

export const AnalyticsPage = () => {
  const { state } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<IssuesByStatusData>({ byState: {}, byCustomStatus: {} });
  const [repoData, setRepoData] = useState<IssuesByRepoRow[]>([]);
  const [timelineData, setTimelineData] = useState<IssuesOverTimeData>({ period: '30d', timeline: [] });
  const [workloadData, setWorkloadData] = useState<AssigneeWorkloadRow[]>([]);
  const [completionData, setCompletionData] = useState<CompletionRateData>({
    overall: { totalIssues: 0, closedIssues: 0, openIssues: 0, completionRate: 0 },
    byRepository: []
  });

  const loadAnalytics = useCallback(() => {
    if (!state.token) {
      return;
    }

    setLoading(true);
    setMessage(null);

    Promise.all([
      getIssuesByStatus(state.token),
      getIssuesByRepo(state.token),
      getIssuesOverTime(state.token, period),
      getAssigneeWorkload(state.token),
      getCompletionRate(state.token)
    ])
      .then(([status, repo, timeline, workload, completion]) => {
        setStatusData(status.data);
        setRepoData(repo.data || []);
        setTimelineData(timeline.data);
        setWorkloadData(workload.data || []);
        setCompletionData(completion.data);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load analytics.');
      })
      .finally(() => setLoading(false));
  }, [period, state.token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const stateChartData = Object.entries(statusData.byState || {}).map(([name, value]) => ({
    name,
    value
  }));

  const customStatusChartData = Object.entries(statusData.byCustomStatus || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const repoChartData = (repoData || []).slice(0, 8).map((item) => ({
    ...item,
    shortName: item.name.length > 14 ? `${item.name.slice(0, 14)}…` : item.name
  }));

  const timelineChartData = (timelineData.timeline || []).map((item) => ({
    ...item,
    shortDate: item.date.slice(5)
  }));

  const workloadChartData = (workloadData || []).slice(0, 8).map((item) => ({
    ...item,
    displayName: item.name || item.githubLogin || 'Assignee'
  }));

  const completionPieData = [
    { name: 'Closed', value: completionData.overall.closedIssues },
    { name: 'Open', value: completionData.overall.openIssues }
  ];

  const completionRepoData = (completionData.byRepository || []).slice(0, 8);

  const PIE_COLORS = ['#1d4fd7', '#94a3b8'];

  return (
    <div className="dv3-page analytics-page">
      <DashboardSidebar authState={state} unreadCount={0} />

      <main className="analytics-main">
        <header className="analytics-head">
          <div>
            <h2>Analytics</h2>
            <p>Visual analytics for issue flow, repository health, workload, and completion.</p>
          </div>
          <div className="analytics-periods">
            {(['7d', '30d', '90d', '1y'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={period === option ? 'active' : ''}
                onClick={() => setPeriod(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </header>

        {message && <div className="analytics-message">{message}</div>}
        {loading && <div className="analytics-info">Loading analytics...</div>}

        {!loading && (
          <section className="analytics-grid">
            <article className="analytics-card">
              <h3>Issues by Status</h3>
              {stateChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stateChartData} dataKey="value" nameKey="name" outerRadius={85} label>
                      {stateChartData.map((_, index) => (
                        <Cell key={`state-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty">No state data</div>
              )}
            </article>

            <article className="analytics-card">
              <h3>Custom Status Distribution</h3>
              {customStatusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={customStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1d4fd7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty">No custom status data</div>
              )}
            </article>

            <article className="analytics-card">
              <h3>Issues by Repository</h3>
              {repoChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={repoChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortName" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="open" stackId="issues" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="closed" stackId="issues" fill="#1d4fd7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty">No repository data</div>
              )}
            </article>

            <article className="analytics-card">
              <h3>Issues Over Time</h3>
              {timelineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={timelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="created" stroke="#1d4fd7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="closed" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty">No timeline data</div>
              )}
            </article>

            <article className="analytics-card">
              <h3>Assignee Workload</h3>
              {workloadChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workloadChartData} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="displayName" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="open" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                    <Bar dataKey="closed" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty">No workload data</div>
              )}
            </article>

            <article className="analytics-card">
              <h3>Completion Rate</h3>
              <div className="analytics-completion-overall">
                <div>
                  <strong>{completionData.overall.completionRate}%</strong>
                  <span>Overall Completion</span>
                </div>
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={completionPieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                      {completionPieData.map((_, index) => (
                        <Cell key={`completion-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
            </article>
          </section>
        )}
      </main>
    </div>
  );
};
