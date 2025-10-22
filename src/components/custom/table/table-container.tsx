// components/table/table-container.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface TableContainerProps {
    title: string | ReactNode;
    description: string | ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function TableContainer({
    title,
    description,
    children,
    className = "",
    contentClassName = ""
}: TableContainerProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    );
}