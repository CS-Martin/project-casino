import { CheckCircle2 } from 'lucide-react';
import { ResizablePanel } from '@/components/ui/resizable';
import { SavedCasinoCard } from './saved-casino-card';

interface SavedCasinosPanelProps {
    savedCasinos?: Array<{
        name: string;
        state: string;
        website?: string;
    }>;
}

export function SavedCasinosPanel({ savedCasinos }: SavedCasinosPanelProps) {
    const hasSaved = savedCasinos && savedCasinos.length > 0;

    return (
        <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Saved Casinos ({hasSaved ? savedCasinos.length : 0})
                </h4>
                {hasSaved ? (
                    <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                        {savedCasinos.map((casino, idx) => (
                            <SavedCasinoCard key={idx} casino={casino} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No casinos saved</p>
                    </div>
                )}
            </div>
        </ResizablePanel>
    );
}

