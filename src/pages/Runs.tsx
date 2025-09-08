import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter,
  Eye,
  Download,
  Play,
  TrendingUp,
  Trophy,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for optimization runs
const mockRuns = [
  {
    id: "run_001",
    date: "2024-01-15",
    myTeam: "Arsenal FC",
    opponent: "Chelsea FC",
    formation: "4-3-3",
    optimizationScore: 87.5,
    gameResult: "2-1 Win",
    totalCost: 125.5,
    planSummary: "Aggressive wing play with fast counter-attacks",
    status: "completed"
  },
  {
    id: "run_002", 
    date: "2024-01-12",
    myTeam: "Arsenal FC",
    opponent: "Liverpool FC", 
    formation: "4-2-3-1",
    optimizationScore: 82.3,
    gameResult: "1-1 Draw",
    totalCost: 118.2,
    planSummary: "Defensive stability with midfield control",
    status: "completed"
  },
  {
    id: "run_003",
    date: "2024-01-10", 
    myTeam: "Arsenal FC",
    opponent: "Manchester City",
    formation: "3-5-2",
    optimizationScore: 91.2,
    gameResult: "3-2 Win",
    totalCost: 142.8,
    planSummary: "High-pressure attacking formation",
    status: "completed"
  },
  {
    id: "run_004",
    date: "2024-01-08",
    myTeam: "Arsenal FC", 
    opponent: "Tottenham",
    formation: "4-4-2",
    optimizationScore: 78.9,
    gameResult: "0-1 Loss",
    totalCost: 95.4,
    planSummary: "Conservative approach with counter-attacks",
    status: "completed"
  },
  {
    id: "run_005",
    date: "2024-01-05",
    myTeam: "Arsenal FC",
    opponent: "Brighton FC",
    formation: "4-3-3", 
    optimizationScore: 85.1,
    gameResult: "2-0 Win",
    totalCost: 112.7,
    planSummary: "Balanced possession-based tactics",
    status: "completed"
  }
];

export default function Runs() {
  const [runs, setRuns] = useState(mockRuns);
  const [searchQuery, setSearchQuery] = useState("");
  const [formationFilter, setFormationFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");

  const filteredRuns = runs.filter(run => {
    const matchesSearch = run.myTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         run.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         run.planSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormation = formationFilter === "all" || run.formation === formationFilter;
    const matchesResult = resultFilter === "all" || 
                         (resultFilter === "win" && run.gameResult.includes("Win")) ||
                         (resultFilter === "draw" && run.gameResult.includes("Draw")) ||
                         (resultFilter === "loss" && run.gameResult.includes("Loss"));
    
    return matchesSearch && matchesFormation && matchesResult;
  });

  const getResultColor = (result: string) => {
    if (result.includes("Win")) return 'bg-success text-success-foreground';
    if (result.includes("Draw")) return 'bg-warning text-warning-foreground';
    if (result.includes("Loss")) return 'bg-destructive text-destructive-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  // Calculate statistics
  const totalRuns = runs.length;
  const avgScore = runs.reduce((acc, run) => acc + run.optimizationScore, 0) / totalRuns;
  const wins = runs.filter(run => run.gameResult.includes("Win")).length;
  const winRate = (wins / totalRuns) * 100;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Optimization Runs</h1>
          <p className="text-muted-foreground">
            History and analysis of tactical optimization runs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="gradient-primary">
            <Play className="mr-2 h-4 w-4" />
            New Run
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{avgScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">{winRate.toFixed(1)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold text-foreground">{totalRuns}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Filter Runs</CardTitle>
          <CardDescription>Search and filter optimization history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by team, opponent, or plan summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={formationFilter} onValueChange={setFormationFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formations</SelectItem>
                <SelectItem value="4-3-3">4-3-3</SelectItem>
                <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                <SelectItem value="3-5-2">3-5-2</SelectItem>
                <SelectItem value="4-4-2">4-4-2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="win">Wins</SelectItem>
                <SelectItem value="draw">Draws</SelectItem>
                <SelectItem value="loss">Losses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card className="card-gradient border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Teams</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Formation</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Score</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Result</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Cost</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Plan Summary</th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="border-b border-border/50 hover:bg-muted/5">
                    <td className="py-4 px-6 text-sm text-foreground">
                      {new Date(run.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">{run.myTeam}</div>
                        <div className="text-xs text-muted-foreground">vs {run.opponent}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="font-mono">
                        {run.formation}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm font-bold ${getScoreColor(run.optimizationScore)}`}>
                        {run.optimizationScore}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getResultColor(run.gameResult)}>
                        {run.gameResult}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      £{run.totalCost}M
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">
                      {run.planSummary}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <Link to={`/runs/${run.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredRuns.length === 0 && (
        <Card className="card-gradient border-border/50">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No optimization runs found matching your search criteria.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}