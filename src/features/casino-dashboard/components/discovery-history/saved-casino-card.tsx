import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SavedCasinoCardProps {
    casino: {
        name: string;
        state: string;
        website?: string;
    };
}

export function SavedCasinoCard({ casino }: SavedCasinoCardProps) {
    return (
        <div className="flex items-start gap-2 p-2 rounded-md bg-background border text-sm">
            <Building2 className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{casino.name}</span>
                    <Badge variant="outline" className="text-xs">
                        {casino.state}
                    </Badge>
                </div>
                {casino.website && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        {casino.website}
                    </p>
                )}
            </div>
            <Badge className="text-xs bg-green-600">New</Badge>
        </div>
    );
}

