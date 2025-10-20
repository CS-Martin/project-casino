// components/table/table-container.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface TableContainerProps {
    title: string;
    description: string | ReactNode;
    children: ReactNode;
    className?: string;
}

export function TableContainer({ title, description, children, className = "" }: TableContainerProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}