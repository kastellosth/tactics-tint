import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hungarianAlgorithm } from '@/lib/hungarianAlgorithm';
import { calculatePlayerPositionCost } from '@/lib/costFunction';
import { formationPositions, getRoleFromSlot, positionMap } from '@/lib/formationPositions';
import { parseOpponentCSV, analyzeOpponentTeam, analyzeMatchups } from '@/lib/opponentAnalysis';

// Types
interface Player {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  preferredFoot?: string;
  height: number;
  position: string;
  number?: number;
  quality: number;
  speed: number;
  stamina: number;
  strength: number;
  balance: number;
  agility: number;
  jumping: number;
  heading?: number;
  aerial?: number;
  passing?: number;
  vision?: number;
  firstTouch?: number;
  finishing?: number;
  tackling?: number;
  positioning?: number;
  pressResistance?: number;
  offBall?: number;
  slot?: string;
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
  insights: {
    backlinePace: number;
    backlineAerial: number;
    midfieldStamina: number;
    midfieldPress: number;
    attackSpeed: number;
    attackFinishing: number;
  };
  suggestions: string[];
  finalSuggestion: string;
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

interface LineupResult {
  formation: string;
  assignments: Assignment[];
  totalCost: number;
}

interface OptimizerProps {
  onOptimization?: (homeTeam: TeamData, awayTeam: TeamData) => void;
}

const Optimizer: React.FC<OptimizerProps> = ({ onOptimization }) => {
  const [myTeam, setMyTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [topLineups, setTopLineups] = useState<LineupResult[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Enhanced CSV parser for my team
  const parseCSV = (text: string): Player[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((k, i) => obj[k] = values[i] || '');
      
      const safeNum = (val: string, defaultVal = 0): number => {
        const num = Number(val);
        return isNaN(num) ? defaultVal : Math.max(0, Math.min(100, num));
      };
      
      return {
        id: obj.id || obj.number || `player_${Math.random()}`,
        firstName: obj.firstname || obj.first_name || '',
        lastName: obj.lastname || obj.last_name || '',
        name: obj.name || '',
        preferredFoot: obj.preferredfoot || obj.preferred_foot || obj.foot,
        height: safeNum(obj.height, 180),
        position: (obj.position || '').toUpperCase(),
        number: safeNum(obj.number),
        quality: safeNum(obj.quality),
        speed: safeNum(obj.speed),
        stamina: safeNum(obj.stamina),
        strength: safeNum(obj.strength),
        balance: safeNum(obj.balance),
        agility: safeNum(obj.agility),
        jumping: safeNum(obj.jumping),
        heading: safeNum(obj.heading),
        aerial: safeNum(obj.aerial),
        passing: safeNum(obj.passing),
        vision: safeNum(obj.vision),
        firstTouch: safeNum(obj.firsttouch || obj.first_touch),
        finishing: safeNum(obj.finishing),
        tackling: safeNum(obj.tackling),
        positioning: safeNum(obj.positioning),
        pressResistance: safeNum(obj.pressresistance || obj.press_resistance),
        offBall: safeNum(obj.offball || obj.off_ball),
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
      setOpponentTeam(parseOpponentCSV(text));
    }
  };

  // Matrix utilities
  const padCostMatrixToSquare = (matrix: number[][], bigM = 1e6) => {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const n = Math.max(rows, cols);
    const paddedMatrix = matrix.map(row => row.concat(Array(n - cols).fill(bigM)));
    for (let r = rows; r < n; r++) {
      paddedMatrix.push(Array(n).fill(bigM));
    }
    return { matrix: paddedMatrix, rows, cols, bigM };
  };

  const buildCostMatrix = (players: Player[], requiredPositions: string[], oppList: Player[], myFormation: string, oppFormation: string) => {
    return players.map(myPlayer =>
      requiredPositions.map((posCode) => {
        const oppPlayer = oppList.find(p => String(p.slot) === String(posCode)) || null;
        return calculatePlayerPositionCost(myPlayer, posCode, oppPlayer, myFormation, oppFormation);
      })
    );
  };

  // UI grouping by roles for pitch visualization
  const groupByFormation = (assignments: Assignment[]): Squad => {
    const squad: Squad = { gk: null, df: [], cdm: [], cm: [], cam: [], fw: [] };
    
    const mapToPitchPlayer = (player: Player, fallbackNum: number): PitchPlayer => ({
      name: `${player.firstName} ${player.lastName}`.trim() || player.name || `Player ${fallbackNum}`,
      number: player.number || fallbackNum
    });
    
    assignments.forEach((item, index) => {
      const player = item.my;
      const pos = String(item.position).match(/\d+/)?.[0];
      const mapped = mapToPitchPlayer(player, index + 1);
      
      switch (pos) {
        case '1': squad.gk = mapped; break;
        case '2': case '3': case '4': case '5': squad.df.push(mapped); break;
        case '6': squad.cdm.push(mapped); break;
        case '7': case '8': squad.cm.push(mapped); break;
        case '10': squad.cam.push(mapped); break;
        case '9': case '11': squad.fw.push(mapped); break;
        default: squad.cm.push(mapped);
      }
    });
    return squad;
  };

  const detectOpponentFormation = (opp: Player[]): string => {
    const counts = { df: 0, mid: 0, att: 0 };
    opp.forEach(p => {
      const role = getRoleFromSlot(p.slot || '');
      if (role === 'defender') counts.df++;
      if (role === 'midfielder') counts.mid++;
      if (role === 'attacker') counts.att++;
    });
    return `${counts.df}-${counts.mid}-${Math.max(1, counts.att)}`;
  };

  // Main optimization logic
  const runOptimization = async () => {
    setIsOptimizing(true);
    setResult(null);
    setTopLineups([]);
    
    if (myTeam.length < 11 || opponentTeam.length < 11) {
      alert("Both teams must have at least 11 players. Opponent must include a 'slot' column.");
      setIsOptimizing(false);
      return;
    }

    // Check for goalkeeper
    const hasGK = myTeam.some(p => p.position === 'GK');
    if (!hasGK) {
      alert("Your team must include at least one goalkeeper (position = 'GK').");
      setIsOptimizing(false);
      return;
    }

    setTimeout(() => {
      const formationsToTry = Object.keys(formationPositions);
      const results: LineupResult[] = [];

      formationsToTry.forEach((formation) => {
        const required = formationPositions[formation];
        const oppFormation = detectOpponentFormation(opponentTeam);
        const rectCost = buildCostMatrix(myTeam, required, opponentTeam, formation, oppFormation);
        const { matrix, rows, cols, bigM } = padCostMatrixToSquare(rectCost);
        const assignment = hungarianAlgorithm(matrix);

        const resultAssignments: Assignment[] = [];
        let totalCost = 0;

        assignment.forEach((colIdx, rowIdx) => {
          if (colIdx < cols && rowIdx < rows && colIdx !== -1) {
            const cost = matrix[rowIdx][colIdx];
            if (cost < bigM / 2) {
              resultAssignments.push({ 
                my: myTeam[rowIdx], 
                position: required[colIdx],
                cost: cost
              });
              totalCost += cost;
            }
          }
        });

        if (resultAssignments.length === required.length) {
          results.push({ formation, assignments: resultAssignments, totalCost });
        }
      });

      if (results.length === 0) {
        alert("Could not find a valid optimized team.");
        setIsOptimizing(false);
        return;
      }

      // Sort by total cost and get top 3
      results.sort((a, b) => a.totalCost - b.totalCost);
      const top3 = results.slice(0, 3);
      setTopLineups(top3);

      const best = results[0];
      const homeTeam: TeamData = {
        style: { color: "#e53935", numberColor: "#fff", nameColor: "#fff" },
        squad: groupByFormation(best.assignments)
      };

      const awayAssignments = opponentTeam.map(p => ({ my: p, position: p.slot || '' }));
      const awayTeam: TeamData = {
        style: { color: "#3949ab", numberColor: "#fff", nameColor: "#fff" },
        squad: groupByFormation(awayAssignments)
      };

      const oppFormation = detectOpponentFormation(opponentTeam);
      const opponentAnalysis = analyzeOpponentTeam(opponentTeam);
      const matchup = analyzeMatchups(best.assignments, opponentTeam);

      const finalSuggestion = matchup?.suggestions?.length 
        ? matchup.suggestions.join(" | ")
        : (opponentAnalysis?.suggestions?.[0] || "Balanced approach");

      const optimizationResult: OptimizationResult = {
        formation: best.formation,
        assignment: best.assignments,
        totalCost: best.totalCost,
        homeTeam,
        awayTeam,
        opponentFormation: oppFormation,
        opponentAnalysis,
        matchup,
        finalSuggestion
      };

      setResult(optimizationResult);
      setIsOptimizing(false);

      if (onOptimization) {
        onOptimization(homeTeam, awayTeam);
      }
    }, 1000);
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
        <>
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Formation: {result.formation}</Badge>
                <Badge variant="outline">Opponent: {result.opponentFormation}</Badge>
                <Badge variant="outline">Total Cost: {result.totalCost.toFixed(2)}</Badge>
              </div>

              <Separator />

              {/* Cost Breakdown Table */}
              <div className="space-y-2">
                <h4 className="font-semibold">Cost Breakdown</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>→ Slot</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.assignment.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {assignment.my.number || index + 1}
                          </TableCell>
                          <TableCell>
                            {`${assignment.my.firstName} ${assignment.my.lastName}`.trim() || assignment.my.name || 'Unknown'}
                          </TableCell>
                          <TableCell>{assignment.position}</TableCell>
                          <TableCell className="text-right font-mono">
                            {(assignment.cost || 0).toFixed(3)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Top 3 Lineups */}
              {topLineups.length > 1 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Top 3 Lineups</h4>
                  <div className="space-y-1 text-sm">
                    {topLineups.map((lineup, index) => (
                      <div key={index} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>{index + 1}. {lineup.formation}</span>
                        <span className="font-mono">{lineup.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {result.opponentAnalysis && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Opponent Analysis</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Backline Pace:</span>
                      <span className="ml-2 font-medium">{result.opponentAnalysis.insights?.backlinePace || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Midfield Stamina:</span>
                      <span className="ml-2 font-medium">{result.opponentAnalysis.insights?.midfieldStamina || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attack Speed:</span>
                      <span className="ml-2 font-medium">{result.opponentAnalysis.insights?.attackSpeed || 'N/A'}</span>
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
        </>
      )}
    </div>
  );
};

export default Optimizer;