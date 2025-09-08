import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FootballPitch } from "@/components/FootballPitch";
import { 
  Upload, 
  Download, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { mockOpponents, OpponentPlayer } from "@/lib/mockData";

export default function Opponents() {
  const [opponents, setOpponents] = useState<OpponentPlayer[]>(mockOpponents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");

  const filteredOpponents = opponents.filter(player =>
    `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.slot.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-warning text-warning-foreground';
      case 'CB': case 'LB': case 'RB': return 'bg-destructive text-destructive-foreground';
      case 'CDM': case 'CM': case 'CAM': return 'bg-primary text-primary-foreground';
      case 'LW': case 'RW': case 'ST': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Opponents Management</h1>
          <p className="text-muted-foreground">
            Manage opponent teams and formations for tactical analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Opponent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formation Preview */}
        <div className="xl:col-span-1">
          <Card className="card-gradient border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle className="text-foreground">Formation Preview</CardTitle>
              <CardDescription>Visual representation of opponent formation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select formation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                  </SelectContent>
                </Select>
                <FootballPitch 
                  opponentLineup={filteredOpponents}
                  className="h-fit"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opponents Table */}
        <div className="xl:col-span-2 space-y-6">
          {/* Controls */}
          <Card className="card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Opponent Squad</CardTitle>
              <CardDescription>Manage opponent players and their positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opponents by name, position, or slot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Players Table */}
          <Card className="card-gradient border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 font-medium text-muted-foreground">Slot</th>
                      <th className="text-left py-4 px-6 font-medium text-muted-foreground">Player</th>
                      <th className="text-left py-4 px-6 font-medium text-muted-foreground">Position</th>
                      <th className="text-left py-4 px-6 font-medium text-muted-foreground">Quality</th>
                      <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpponents
                      .sort((a, b) => {
                        const order = ['1', '3L', '4', '5', '2R', '6', '8', '10', '11L', '9', '7R'];
                        return order.indexOf(a.slot) - order.indexOf(b.slot);
                      })
                      .map((player) => (
                      <tr key={player.id} className="border-b border-border/50 hover:bg-muted/5">
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-mono">
                            {player.slot}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground font-medium">
                              {player.firstName[0]}{player.lastName[0] || ''}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">ID: {player.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {player.qualityScore}
                            </span>
                            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-destructive rounded-full transition-all"
                                style={{ width: `${player.qualityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {filteredOpponents.length === 0 && (
            <Card className="card-gradient border-border/50">
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  No opponents found matching your search criteria.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}