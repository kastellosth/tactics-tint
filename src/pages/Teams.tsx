import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Download, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { mockPlayers, Player } from "@/lib/mockData";

export default function Teams() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");

  const filteredPlayers = players.filter(player => {
    const matchesSearch = `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    
    return matchesSearch && matchesPosition;
  });

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-warning text-warning-foreground';
      case 'CB': case 'LB': case 'RB': return 'bg-destructive text-destructive-foreground';
      case 'CDM': case 'CM': case 'CAM': return 'bg-primary text-primary-foreground';
      case 'LW': case 'RW': case 'ST': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const exportPlayersCSV = () => {
    const headers = [
      'firstName', 'lastName', 'position', 'height', 'qualityScore', 
      'speed', 'stamina', 'strength', 'balance', 'agility', 'jumping'
    ];
    
    const csvContent = [
      headers.join(','),
      ...players.map(player => [
        player.firstName,
        player.lastName,
        player.position,
        player.height,
        player.qualityScore,
        player.speed,
        player.stamina,
        player.strength,
        player.balance,
        player.agility,
        player.jumping
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-team.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return;
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newPlayers: Player[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < headers.length) continue;
          
          const player: Player = {
            id: `imported-${Date.now()}-${i}`,
            firstName: values[headers.indexOf('firstname')] || '',
            lastName: values[headers.indexOf('lastname')] || '',
            birthYear: new Date().getFullYear() - 25, // Default age
            height: parseInt(values[headers.indexOf('height')]) || 180,
            position: values[headers.indexOf('position')] || 'CM',
            qualityScore: parseInt(values[headers.indexOf('qualityscore')]) || 70,
            speed: parseInt(values[headers.indexOf('speed')]) || 70,
            stamina: parseInt(values[headers.indexOf('stamina')]) || 70,
            strength: parseInt(values[headers.indexOf('strength')]) || 70,
            balance: parseInt(values[headers.indexOf('balance')]) || 70,
            agility: parseInt(values[headers.indexOf('agility')]) || 70,
            jumping: parseInt(values[headers.indexOf('jumping')]) || 70,
          };
          
          newPlayers.push(player);
        }
        
        setPlayers(newPlayers);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teams Management</h1>
          <p className="text-muted-foreground">
            Manage your squad players and their attributes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPlayersCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-csv')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImportCSV}
          />
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Player Database</CardTitle>
          <CardDescription>Search and filter your squad members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GK">Goalkeeper</SelectItem>
                <SelectItem value="CB">Center Back</SelectItem>
                <SelectItem value="LB">Left Back</SelectItem>
                <SelectItem value="RB">Right Back</SelectItem>
                <SelectItem value="CDM">Defensive Mid</SelectItem>
                <SelectItem value="CM">Central Mid</SelectItem>
                <SelectItem value="CAM">Attacking Mid</SelectItem>
                <SelectItem value="LW">Left Wing</SelectItem>
                <SelectItem value="RW">Right Wing</SelectItem>
                <SelectItem value="ST">Striker</SelectItem>
              </SelectContent>
            </Select>
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
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Player</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Position</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Age</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Height</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Quality</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Speed</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Stamina</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Strength</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Balance</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Agility</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Jumping</th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="border-b border-border/50 hover:bg-muted/5">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                          {player.firstName[0]}{player.lastName[0]}
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
                    <td className="py-4 px-6 text-sm text-foreground">
                      {new Date().getFullYear() - player.birthYear}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {player.height} cm
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{player.qualityScore}</span>
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${player.qualityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.speed}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.stamina}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.strength}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.balance}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.agility}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{player.jumping}</td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
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

      {filteredPlayers.length === 0 && (
        <Card className="card-gradient border-border/50">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No players found matching your search criteria.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}