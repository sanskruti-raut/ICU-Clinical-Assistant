import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { getDashboardStats } from '../../api/apiService';

const AnalyticsSummary = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setLoading(false);
        console.error('Error loading dashboard stats:', err);
      }
    };

    fetchStats();

    // Poll for updates every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card title="ICU Analytics Summary">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card title="ICU Analytics Summary">
        <div className="text-red-500 p-4">{error || 'Failed to load statistics'}</div>
      </Card>
    );
  }

  return (
    <Card 
      title="ICU Analytics Summary"
      titleClassName="text-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">High Risk Patients</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">{stats.highRiskPercentage}%</div>
            <div className="ml-2 text-sm text-gray-500">of patients at high risk</div>
          </div>
          
          <h4 className="text-sm font-medium text-gray-700 mt-6 mb-2">Average ICU Stay</h4>
          <div className="text-xl font-semibold">{stats.avgICUStay}</div>
          
          <h4 className="text-sm font-medium text-gray-700 mt-6 mb-2">Most Common Treatments</h4>
          <ul className="space-y-1">
            {stats.mostCommonTreatments.map((treatment, index) => (
              <li key={index} className="text-sm text-gray-600">• {treatment}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Alert Frequency Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.alertFrequencyTrend}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsSummary;