import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';

// Types
interface Player {
  id: string;
  lastName: string;
  firstName: string;
  birthYear: number;
  height: number;
  qualityScore: number;
  speed: number;
  position: string;
  stamina: number;
  strength: number;
  balance: number;
  agility: number;
  jumping: number;
}

interface OpponentPlayer extends Player {
  slot: string;
}

interface Assignment {
  my: Player;
  position: string;
  cost?: number;
}

interface PitchPlayer {
  name: string;
  number: number;
}

interface Squad {
  gk: PitchPlayer | null;
  df: PitchPlayer[];
  cdm: PitchPlayer[];
  cm: PitchPlayer[];
  cam: PitchPlayer[];
  fw: PitchPlayer[];
}

interface TeamData {
  style: {
    color: string;
    numberColor: string;
    nameColor: string;
  };
  squad: Squad;
}

interface OpponentAnalysis {
  averages: {
    defender: { strength: number };
    midfielder: { stamina: number };
  };
  suggestion?: string;
}

interface MatchupData {
  insights: string[];
  suggestions: string[];
}

interface OptimizationResult {
  formation: string;
  assignment: Assignment[];
  totalCost: number;
  homeTeam: TeamData;
  awayTeam: TeamData;
  opponentFormation: string;
  opponentAnalysis: OpponentAnalysis;
  matchup: MatchupData;
  finalSuggestion: string;
}

interface OptimizerProps {
  onOptimization?: (homeTeam: TeamData, awayTeam: TeamData) => void;
}

const Optimizer: React.FC<OptimizerProps> = ({ onOptimization }) => {
  const [myTeam, setMyTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<OpponentPlayer[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // CSV parser for my team
  const parseCSV = (text: string): Player[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((k, i) => obj[k] = values[i]);
      return {
        id: obj.id,
        lastName: obj.lastName,
        firstName: obj.firstName,
        birthYear: parseInt(obj.birthYear),
        height: parseFloat(obj.height),
        qualityScore: parseFloat(obj.qualityScore),
        speed: parseFloat(obj.speed),
        position: obj.position,
        stamina: parseFloat(obj.Stamina),
        strength: parseFloat(obj.Strength),
        balance: parseFloat(obj.Balance),
        agility: parseFloat(obj.Agility),
        jumping: parseFloat(obj.Jumping),
      };
    });
  };

  // File uploads
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMyTeam: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (isMyTeam) {
      setMyTeam(parseCSV(text));
    } else {
      // For now, we'll use the same parser - we'll need the parseOpponentCSV utility
      const parsedData = parseCSV(text) as OpponentPlayer[];
      setOpponentTeam(parsedData);
    }
  };

  // Temporary placeholder for optimization logic
  const runOptimization = async () => {
    setIsOptimizing(true);
    setResult(null);
    
    if (myTeam.length < 11 || opponentTeam.length < 11) {
      alert("Both teams must have at least 11 players. Opponent must include a 'slot' column (supports L/R like 11L, 3R).");
      setIsOptimizing(false);
      return;
    }

    // Temporary mock result until we implement the actual algorithm
    setTimeout(() => {
      const mockResult: OptimizationResult = {
        formation: "4-3-3",
        assignment: [],
        totalCost: 0,
        homeTeam: {
          style: { color: "#e53935", numberColor: "#fff", nameColor: "#fff" },
          squad: { gk: null, df: [], cdm: [], cm: [], cam: [], fw: [] }
        },
        awayTeam: {
          style: { color: "#3949ab", numberColor: "#fff", nameColor: "#fff" },
          squad: { gk: null, df: [], cdm: [], cm: [], cam: [], fw: [] }
        },
        opponentFormation: "4-4-2",
        opponentAnalysis: {
          averages: {
            defender: { strength: 75 },
            midfielder: { stamina: 80 }
          }
        },
        matchup: {
          insights: ["Strong midfield presence", "Weak defensive flanks"],
          suggestions: ["Exploit the wings", "Press high in midfield"]
        },
        finalSuggestion: "Focus on wing play and high pressing"
      };
      
      setResult(mockResult);
      setIsOptimizing(false);
      
      if (onOptimization) {
        onOptimization(mockResult.homeTeam, mockResult.awayTeam);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Team Data Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload My Team CSV:</label>
            <input 
              type="file" 
              onChange={e => handleUpload(e, true)}
              accept=".csv"
              className="w-full p-2 border border-input rounded-md bg-background"
            />
            {myTeam.length > 0 && (
              <p className="text-sm text-muted-foreground">
                ✓ {myTeam.length} players loaded
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Opponent Team CSV (with 'slot' column):</label>
            <input 
              type="file" 
              onChange={e => handleUpload(e, false)}
              accept=".csv"
              className="w-full p-2 border border-input rounded-md bg-background"
            />
            {opponentTeam.length > 0 && (
              <p className="text-sm text-muted-foreground">
                ✓ {opponentTeam.length} opponent players loaded
              </p>
            )}
          </div>

          <Button 
            onClick={runOptimization} 
            disabled={myTeam.length < 11 || opponentTeam.length < 11 || isOptimizing}
            className="w-full"
          >
            {isOptimizing ? "Optimizing..." : "Optimize Lineup"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Formation: {result.formation}</Badge>
              <Badge variant="outline">Opponent: {result.opponentFormation}</Badge>
            </div>

            <Separator />

            {result.opponentAnalysis && (
              <div className="space-y-2">
                <h4 className="font-semibold">Opponent Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg DEF Strength:</span>
                    <span className="ml-2 font-medium">{result.opponentAnalysis.averages.defender.strength}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg MID Stamina:</span>
                    <span className="ml-2 font-medium">{result.opponentAnalysis.averages.midfielder.stamina}</span>
                  </div>
                </div>
              </div>
            )}

            {result.matchup && (
              <div className="space-y-2">
                <h4 className="font-semibold">Matchup Insights</h4>
                <ul className="space-y-1 text-sm">
                  {result.matchup.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 p-3 bg-primary/5 rounded-md border-l-4 border-primary">
                  <p className="text-sm">
                    <strong className="text-primary">Tactical Plan:</strong> {result.finalSuggestion}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Optimizer;