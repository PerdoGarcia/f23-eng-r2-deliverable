"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard(species: Species) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-72 m-4 w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.common_name}</h3>
      <h4 className="text-lg font-light italic">{species.scientific_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      {/* Replace with detailed view */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full" onClick={() => setOpen(true)}>
            Learn More
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {species.image && (
                <div className="relative h-40 w-full">
                  <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              <h3 className="mt-3 text-2xl font-semibold">{species.common_name}</h3>
              <h4 className="text-lg font-light italic"> {species.scientific_name}</h4>
            </DialogDescription>
          </DialogHeader>
          <p> {species.total_population}</p>
          <p> {species.kingdom}</p>
          <p> {species.description}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
