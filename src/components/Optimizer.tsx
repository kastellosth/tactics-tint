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
import { parseMyTeamCSV } from '@/lib/parseMyTeam';
import { inferOpponentFormation } from '@/lib/inferOpponentFormation';

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

  // Helper functions for robust name display
  const coalesceNameParts = (vals: any[]): string[] =>
    vals.filter(Boolean).map(String).map(s => s.trim()).filter(Boolean);

  const coalesceName = (record: any): string => {
    const parts = coalesceNameParts([
      record?.name,
      record?.player,
      record?.displayName,
      [record?.firstName, record?.lastName].filter(Boolean).join(" "),
      [record?.first_name, record?.last_name].filter(Boolean).join(" ")
    ]);
    return parts[0] || "";
  };

  const displayFullName = (p: Player): string => {
    const first = (p?.firstName || "").trim();
    const last = (p?.lastName || "").trim();
    const both = [first, last].filter(Boolean).join(" ");
    return both || (p?.name || "").trim() || "Unknown Player";
  };

  // Guardrail functions
  const assertFinite2D = (matrix: number[][], name = "matrix"): void => {
    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
      throw new Error(`${name} is not a 2D array`);
    }
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const v = row[c];
        if (!Number.isFinite(v)) {
          throw new Error(`${name}[${r}][${c}] is not finite: ${v}`);
        }
      }
    }
  };

  const hasNegative = (matrix: number[][]): boolean => {
    for (const row of matrix) {
      for (const v of row) {
        if (v < 0) return true;
      }
    }
    return false;
  };

  // File uploads with enhanced parsing
  const onMyCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMyTeam(parseMyTeamCSV(String(reader.result || '')));
    reader.readAsText(file);
  };

  const onOppCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setOpponentTeam(parseOpponentCSV(text));
    };
    reader.readAsText(file);
  };

  const padCostMatrixToSquare = ({ matrix, rows, cols, bigM }: { matrix: number[][], rows: number, cols: number, bigM: number }) => {
    const n = Math.max(rows, cols);
    const padded = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) =>
        (r < rows && c < cols) ? matrix[r][c] : bigM
      )
    );
    return { matrix: padded, rows, cols, bigM };
  };

  // Build costs with opponent insights (biases)
  const buildCostMatrix = (my: Player[], required: string[], oppFormation: string, myFormation: string, oppInsights: any) => {
    const rows = my.length;
    const cols = required.length;
    const bigM = 9999;
    const oppBySlot = new Map((opponentTeam || []).map(p => [String(p.slot || p.position), p]));
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(bigM));
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        matrix[r][c] = calculatePlayerPositionCost(
          my[r],
          required[c],
          oppBySlot.get(String(required[c])) || null,
          myFormation,
          oppFormation,
          oppInsights
        );
      }
    }
    return { matrix, rows, cols, bigM };
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


  // Main optimization logic
  const onOptimize = () => {
    if (!myTeam.length || !opponentTeam.length) {
      alert("Please upload both CSVs");
      return;
    }

    setIsOptimizing(true);
    setResult(null);
    setTopLineups([]);

    // Check for goalkeeper
    const hasGK = myTeam.some(p => p.position === 'GK');
    if (!hasGK) {
      alert("Your team must include at least one goalkeeper (position = 'GK').");
      setIsOptimizing(false);
      return;
    }

    setTimeout(() => {
      const oppFormation = inferOpponentFormation(opponentTeam);
      const formations = Object.keys(formationPositions);

      // Opponent insights bias
      const opp = analyzeOpponentTeam(opponentTeam);
      const oppInsights = opp?.insights || {};

      let lowest = Infinity;
      let best: LineupResult | null = null;
      const topLineups: LineupResult[] = [];

      formations.forEach((formation) => {
        const required = formationPositions[formation];
        const rectCost = buildCostMatrix(myTeam, required, oppFormation, formation, oppInsights);

        // Guardrail: rectangular matrix must be finite; warn if no negatives
        assertFinite2D(rectCost.matrix, "rectCost");
        if (!hasNegative(rectCost.matrix)) {
          console.warn("[warn] rectCost has no negative entries — did something clamp costs to >= 0?");
        }

        const { matrix, rows, cols, bigM } = padCostMatrixToSquare(rectCost);

        // Guardrail: padded square matrix must be finite
        assertFinite2D(matrix, "paddedCost");

        // Solve
        const assignment = hungarianAlgorithm(matrix);
        
        // Normalize Hungarian output to array of {rowIdx, colIdx}
        const normalizeAssignment = (assign: any, rows: number, cols: number) => {
          if (!assign) return [];
          // Most libs: array of column index per row index
          if (Array.isArray(assign) && assign.length === rows && typeof assign[0] === 'number') {
            return assign.map((colIdx: number, rowIdx: number) => ({ rowIdx, colIdx }));
          }
          // Some return array of [row,col] pairs
          if (Array.isArray(assign) && Array.isArray(assign[0])) {
            return assign.map(([r, c]: [number, number]) => ({ rowIdx: r, colIdx: c }));
          }
          // Rare: array of row index per column index
          if (Array.isArray(assign) && assign.length === cols && typeof assign[0] === 'number') {
            return assign.map((rowIdx: number, colIdx: number) => ({ rowIdx, colIdx }));
          }
          return [];
        };

        const normAssign = normalizeAssignment(assignment, rows, cols);

        const resultAssignments: Assignment[] = [];
        normAssign.forEach(({ rowIdx, colIdx }: { rowIdx: number, colIdx: number }) => {
          if (colIdx < cols && rowIdx < rows) {
            const cost = matrix[rowIdx][colIdx];
            if (cost < bigM / 2) {
              const my = { ...myTeam[rowIdx] };
              // Ensure we have display fields populated
              my.name = coalesceName(my) || my.name || "";
              resultAssignments.push({ my, position: required[colIdx], cost });
            }
          }
        });

        if (resultAssignments.length === required.length) {
          const total = resultAssignments.reduce((s, r) => s + (typeof r.cost === 'number' ? r.cost : 0), 0);
          topLineups.push({ formation, assignments: resultAssignments, totalCost: total });
          if (total < lowest) {
            lowest = total;
            best = { formation, assignments: resultAssignments, totalCost: total };
          }
        }
      });

      topLineups.sort((a, b) => a.totalCost - b.totalCost);
      const top3 = topLineups.slice(0, 3);
      setTopLineups(top3);

      if (!best) { 
        alert("Could not find a valid optimized team."); 
        setIsOptimizing(false);
        return; 
      }

      // Matchup analysis + suggestion with robust fallback
      const matchup = analyzeMatchups(best.assignments, opponentTeam);
      const safeSuggestion =
        (matchup?.finalSuggestion) ||
        (opp?.suggestions?.[0]) ||
        "Balanced plan; no clear systemic mismatch.";

      const homeTeam: TeamData = {
        style: { color: "#e53935", numberColor: "#fff", nameColor: "#fff" },
        squad: groupByFormation(best.assignments)
      };

      const awayAssignments = opponentTeam.map(p => ({ my: p, position: p.slot || '' }));
      const awayTeam: TeamData = {
        style: { color: "#3949ab", numberColor: "#fff", nameColor: "#fff" },
        squad: groupByFormation(awayAssignments)
      };

      const optimizationResult: OptimizationResult = {
        formation: best.formation,
        assignment: best.assignments,
        totalCost: best.totalCost,
        homeTeam,
        awayTeam,
        opponentFormation: oppFormation,
        opponentAnalysis: {
          insights: opp?.insights || {
            backlinePace: 0,
            backlineAerial: 0,
            midfieldStamina: 0,
            midfieldPress: 0,
            attackSpeed: 0,
            attackFinishing: 0
          },
          suggestions: opp?.suggestions || [],
          finalSuggestion: opp?.finalSuggestion || ""
        },
        matchup: {
          insights: matchup?.insights || [],
          suggestions: matchup?.suggestions || []
        },
        finalSuggestion: safeSuggestion
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
              onChange={onMyCSV}
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
              onChange={onOppCSV}
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
            onClick={onOptimize} 
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
                            {displayFullName(assignment.my)}
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