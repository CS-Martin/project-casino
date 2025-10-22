import { TableRow, TableCell } from '@/components/ui/table';
import { ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { SavedCasinosPanel } from './saved-casinos-panel';
import { DuplicateCasinosPanel } from './duplicate-casinos-panel';

interface DiscoveryLogDetailsProps {
    savedCasinos?: Array<{
        name: string;
        state: string;
        website?: string;
    }>;
    duplicates?: Array<{
        discovered: string;
        existing: string;
        reason: string;
        score?: number;
    }>;
}

export function DiscoveryLogDetails({ savedCasinos, duplicates }: DiscoveryLogDetailsProps) {
    return (
        <TableRow>
            <TableCell colSpan={8} className="bg-muted/30 p-4">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="min-h-[300px] rounded-lg border"
                >
                    <SavedCasinosPanel savedCasinos={savedCasinos} />
                    <ResizableHandle withHandle />
                    <DuplicateCasinosPanel duplicates={duplicates} />
                </ResizablePanelGroup>
            </TableCell>
        </TableRow>
    );
}

