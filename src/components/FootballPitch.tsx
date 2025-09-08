import React from "react";
import { cn } from "@/lib/utils";
import { Player, OpponentPlayer } from "@/lib/mockData";

interface PitchPlayerProps {
  name: string;
  position: string;
  slot: string;
  isOpponent?: boolean;
  quality?: number;
  style?: React.CSSProperties;
}

function PitchPlayer({ name, position, slot, isOpponent, quality, style }: PitchPlayerProps) {
  return (
    <div 
      className={cn(
        "absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2",
        "text-xs text-center"
      )}
      style={style}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium border-2",
        isOpponent 
          ? "bg-destructive text-destructive-foreground border-destructive-foreground/20" 
          : "bg-success text-success-foreground border-success-foreground/20"
      )}>
        {slot}
      </div>
      <div className="mt-1 space-y-0.5 min-w-0">
        <div className="font-medium text-[10px] text-foreground truncate max-w-16">
          {name.split(' ').slice(-1)[0]}
        </div>
        <div className="text-[9px] text-muted-foreground">{position}</div>
        {quality && (
          <div className="text-[9px] font-medium text-primary">{quality}</div>
        )}
      </div>
    </div>
  );
}

interface FootballPitchProps {
  myLineup?: Array<{
    player: Player;
    slot: string;
    cost: number;
    effectiveness: number;
  }>;
  opponentLineup?: OpponentPlayer[];
  className?: string;
  title?: string;
}

export function FootballPitch({ myLineup, opponentLineup, className, title }: FootballPitchProps) {
  // Position mapping for 4-3-3 formation
  const positionMap: Record<string, { top: string; left: string }> = {
    // Goalkeeper
    "1": { top: "90%", left: "50%" },
    
    // Defense
    "2R": { top: "75%", left: "80%" },
    "4": { top: "75%", left: "60%" },
    "5": { top: "75%", left: "40%" },
    "3L": { top: "75%", left: "20%" },
    
    // Midfield
    "6": { top: "55%", left: "50%" },
    "8": { top: "50%", left: "70%" },
    "10": { top: "50%", left: "30%" },
    
    // Attack
    "11L": { top: "25%", left: "20%" },
    "9": { top: "20%", left: "50%" },
    "7R": { top: "25%", left: "80%" },
  };

  return (
    <div className={cn("bg-card rounded-lg shadow-card", className)}>
      {title && (
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <div className="relative w-full h-80 bg-pitch rounded-lg border-2 border-pitch-line overflow-hidden">
          {/* Pitch markings */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Center line */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="8" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            
            {/* Penalty areas */}
            <rect x="35" y="0" width="30" height="16" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            <rect x="35" y="84" width="30" height="16" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            
            {/* Goal areas */}
            <rect x="42" y="0" width="16" height="6" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            <rect x="42" y="94" width="16" height="6" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            
            {/* Corner arcs */}
            <path d="M 0 0 Q 3 0 3 3" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            <path d="M 100 0 Q 97 0 97 3" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            <path d="M 0 100 Q 3 100 3 97" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
            <path d="M 100 100 Q 97 100 97 97" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
          </svg>

          {/* My lineup (green) */}
          {myLineup?.map((player) => {
            const pos = positionMap[player.slot];
            if (!pos) return null;
            
            return (
              <PitchPlayer
                key={player.player.id}
                name={`${player.player.firstName} ${player.player.lastName}`}
                position={player.player.position}
                slot={player.slot}
                quality={player.effectiveness}
                style={{
                  top: pos.top,
                  left: pos.left,
                }}
              />
            );
          })}

          {/* Opponent lineup (red) */}
          {opponentLineup?.map((player) => {
            const pos = positionMap[player.slot];
            if (!pos) return null;
            
            // Flip the field for opponent
            const opponentTop = `${100 - parseFloat(pos.top)}%`;
            
            return (
              <PitchPlayer
                key={player.id}
                name={`${player.firstName} ${player.lastName}`}
                position={player.position}
                slot={player.slot}
                quality={player.qualityScore}
                isOpponent
                style={{
                  top: opponentTop,
                  left: pos.left,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
