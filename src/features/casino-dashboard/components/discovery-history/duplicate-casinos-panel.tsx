import { AlertCircle } from 'lucide-react';
import { ResizablePanel } from '@/components/ui/resizable';
import { DuplicateCasinoCard } from './duplicate-casino-card';

interface DuplicateCasinosPanelProps {
    duplicates?: Array<{
        discovered: string;
        existing: string;
        reason: string;
        score?: number;
    }>;
}

export function DuplicateCasinosPanel({ duplicates }: DuplicateCasinosPanelProps) {
    const hasDuplicates = duplicates && duplicates.length > 0;

    return (
        <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Duplicate Casinos ({hasDuplicates ? duplicates.length : 0})
                </h4>
                {hasDuplicates ? (
                    <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                        {duplicates.map((duplicate, idx) => (
                            <DuplicateCasinoCard key={idx} duplicate={duplicate} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No duplicates found</p>
                    </div>
                )}
            </div>
        </ResizablePanel>
    );
}

