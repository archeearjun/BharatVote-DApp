import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material';
import { BarChart, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../constants';

interface AnalyticsProps {
  contract: any;
  eligibleCount: number;
}

interface AnalyticsData {
  totalEligibleVoters: number;
  totalCommits: number;
  totalReveals: number;
  participationRate: number;
  electionStartTime: number;
  commitPhaseEndTime: number;
  revealPhaseEndTime: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ contract, eligibleCount }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Week 9: Set up polling for analytics updates (every 10 seconds)
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [contract]);

  const fetchAnalytics = async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch from contract (Week 9 enhancement)
      const [
        totalCommits,
        totalReveals,
        totalVoters,
        electionStartTime,
        commitPhaseEndTime,
        revealPhaseEndTime
      ] = await contract.getStatistics();

      const participationRate = eligibleCount > 0 
        ? Number(await contract.getParticipationRate(eligibleCount))
        : 0;

      setAnalytics({
        totalEligibleVoters: eligibleCount,
        totalCommits: Number(totalCommits),
        totalReveals: Number(totalReveals),
        participationRate,
        electionStartTime: Number(electionStartTime),
        commitPhaseEndTime: Number(commitPhaseEndTime),
        revealPhaseEndTime: Number(revealPhaseEndTime)
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <Card className="shadow-sm">
        <CardContent>
          <Typography>Loading analytics...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6" className="font-semibold">
        Election Analytics
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body2" className="text-gray-600">
                Total Commits
              </Typography>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <Typography variant="h4" className="font-bold text-blue-600">
              {analytics.totalCommits}
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body2" className="text-gray-600">
                Total Reveals
              </Typography>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Typography variant="h4" className="font-bold text-green-600">
              {analytics.totalReveals}
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body2" className="text-gray-600">
                Participation Rate
              </Typography>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <Typography variant="h4" className="font-bold text-purple-600">
              {analytics.participationRate}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={analytics.participationRate} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent>
          <Typography variant="h6" className="mb-4">Timeline</Typography>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Typography variant="body2">Election Started:</Typography>
              <Typography variant="body2" className="font-medium">
                {formatTime(analytics.electionStartTime)}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="body2">Commit Phase Ended:</Typography>
              <Typography variant="body2" className="font-medium">
                {formatTime(analytics.commitPhaseEndTime)}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="body2">Reveal Phase Ended:</Typography>
              <Typography variant="body2" className="font-medium">
                {formatTime(analytics.revealPhaseEndTime)}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
