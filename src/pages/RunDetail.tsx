import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FootballPitch } from "@/components/FootballPitch";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Share,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { mockRunDetail } from "@/lib/mockData";

export default function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you'd fetch the run detail by ID
  const runDetail = mockRunDetail;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {runDetail.myTeam} vs {runDetail.opponent}
            </h1>
            <p className="text-muted-foreground">
              {new Date(runDetail.date).toLocaleDateString()} • {runDetail.formation} Formation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Tactical Plan Banner */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tactical Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{runDetail.tacticalPlan}</p>
        </CardContent>
      </Card>

      {/* Side-by-side Pitches */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FootballPitch 
          myLineup={runDetail.myLineup}
          title="My Lineup"
          className="h-fit"
        />
        <FootballPitch 
          opponentLineup={runDetail.opponentLineup}
          title="Opponent Lineup"
          className="h-fit"
        />
      </div>

      {/* Key Insights */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Key Tactical Insights
          </CardTitle>
          <CardDescription>Top 6 optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {runDetail.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Table */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Assignments
          </CardTitle>
          <CardDescription>Detailed cost breakdown and effectiveness ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Player</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quality</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Effectiveness</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {runDetail.myLineup
                  .sort((a, b) => {
                    const order = ['1', '3L', '4', '5', '2R', '6', '8', '10', '11L', '9', '7R'];
                    return order.indexOf(a.slot) - order.indexOf(b.slot);
                  })
                  .map((assignment) => (
                  <tr key={assignment.slot} className="border-b border-border/50 hover:bg-muted/5">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{assignment.slot}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">
                          {assignment.player.firstName} {assignment.player.lastName}
                        </div>
                        <div className="text-muted-foreground">{assignment.player.position}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date().getFullYear() - assignment.player.birthYear}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground">
                          {assignment.player.qualityScore}
                        </div>
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${assignment.player.qualityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {assignment.effectiveness}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-medium text-foreground">
                        {formatCurrency(assignment.cost)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={5} className="py-3 px-4 font-medium text-foreground">
                    Total Squad Cost
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-lg text-foreground">
                    {formatCurrency(runDetail.totalCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}