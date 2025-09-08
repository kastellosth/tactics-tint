import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  TrendingUp, 
  Target, 
  Shield, 
  Wind,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { mockRuns, mockKPIs } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'running':
        return <Badge className="bg-warning text-warning-foreground">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Optimize your football lineups and analyze tactical performance
          </p>
        </div>
        <Button 
          className="gradient-primary hover:opacity-90 transition-opacity"
          onClick={() => navigate('/optimize')}
        >
          <Play className="mr-2 h-4 w-4" />
          New Optimization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Cost"
          value={formatCurrency(mockKPIs.averageCost)}
          subtitle="Last 30 days"
          icon={TrendingUp}
          trend={{ value: 5.2, label: "vs last month" }}
        />
        <StatCard
          title="Total Runs"
          value={mockKPIs.totalRuns}
          subtitle="This month"
          icon={Target}
          trend={{ value: 12, label: "vs last month" }}
        />
        <StatCard
          title="Success Rate"
          value={`${mockKPIs.successRate}%`}
          subtitle="Optimization success"
          icon={Shield}
          trend={{ value: 3.1, label: "improvement" }}
        />
        <StatCard
          title="Avg Wing Focus"
          value={`${(mockKPIs.avgWingWeight * 100).toFixed(0)}%`}
          subtitle="Tactical weight"
          icon={Wind}
          trend={{ value: -2.4, label: "vs avg" }}
        />
      </div>

      {/* Tactical Weights Overview */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Tactical Weight Distribution</CardTitle>
          <CardDescription>Average focus across optimization runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {(mockKPIs.avgWingWeight * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Wings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(mockKPIs.avgMidWeight * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Midfield</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {(mockKPIs.avgAerialWeight * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Aerial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {(mockKPIs.avgDefenseWeight * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Defense</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Optimization Runs</CardTitle>
          <CardDescription>Your latest tactical optimization sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Teams</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Formation</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan Summary</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRuns.map((run) => (
                  <tr key={run.id} className="border-b border-border/50 hover:bg-muted/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(run.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{run.myTeam}</div>
                        <div className="text-muted-foreground">vs {run.opponent}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{run.formation}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {formatCurrency(run.totalCost)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(run.status)}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {run.planSummary}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/runs/${run.id}`)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}