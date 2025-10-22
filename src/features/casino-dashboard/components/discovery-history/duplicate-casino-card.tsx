import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DuplicateCasinoCardProps {
    duplicate: {
        discovered: string;
        existing: string;
        reason: string;
        score?: number;
    };
}

export function DuplicateCasinoCard({ duplicate }: DuplicateCasinoCardProps) {
    return (
        <div className="flex items-start gap-2 p-2 rounded-md bg-background border text-sm">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{duplicate.discovered}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-blue-600 dark:text-blue-400">
                        {duplicate.existing}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {duplicate.reason}
                </p>
                {duplicate.score !== undefined && (
                    <Badge variant="outline" className="text-xs mt-1">
                        Similarity: {Math.round(duplicate.score * 100)}%
                    </Badge>
                )}
            </div>
            <Badge variant="secondary" className="text-xs">
                Duplicate
            </Badge>
        </div>
    );
}

