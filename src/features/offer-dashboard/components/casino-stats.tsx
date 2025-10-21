interface CasinoStatsProps {
    stats: {
        activeCount: number;
        avgBonusAmount: number;
        avgWageringRequirement: number;
        daysSinceLastCheck: number | null;
    };
}

export function CasinoStats({ stats }: CasinoStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-3 md:py-4">
            <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">{stats.activeCount}</div>
                <div className="text-xs text-muted-foreground">Active Offers</div>
            </div>
            <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">${stats.avgBonusAmount}</div>
                <div className="text-xs text-muted-foreground">Avg Bonus</div>
            </div>
            <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">{stats.avgWageringRequirement}x</div>
                <div className="text-xs text-muted-foreground">Avg Wagering</div>
            </div>
            <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">
                    {stats.daysSinceLastCheck !== null ? `${stats.daysSinceLastCheck}d` : 'Never'}
                </div>
                <div className="text-xs text-muted-foreground">Last Check</div>
            </div>
        </div>
    );
}

