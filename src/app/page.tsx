"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CasinosList() {
  const casinos = useQuery(api.casinos.index.getAllCasinos);

  if (casinos === undefined) return <div>Loading casinos…</div>;
  if (!casinos?.length) return <div>No casinos found.</div>;

  return (
    <Table>
      <TableCaption>All casinos. Untracked are highlighted.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Website</TableHead>
          <TableHead>License</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="text-right">Tracked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {casinos.map((c: any) => (
          <TableRow key={c._id} className={!c.is_tracked ? "bg-red-100" : undefined}>
            <TableCell className="flex flex-col">
              <div className="font-medium">
                {c.name}
              </div>
              <span className=" text-[11px] text-muted-foreground">
                {c.state.name}
              </span>
            </TableCell>
            <TableCell>
              {c.website ? (
                <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {c.website}
                </a>
              ) : (
                <span className="text-muted-foreground">No website</span>
              )}
            </TableCell>
            <TableCell>{c.license_status ?? <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell>{c.state?.abbreviation ?? <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell className="text-right">{c.is_tracked ? "Yes" : <span className="text-red-700 font-semibold">No</span>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Home() {

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Casinos</h1>
      <CasinosList />
    </div>
  );
}