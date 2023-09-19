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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
type Species = Database["public"]["Tables"]["species"]["Row"];
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const speciesSchema = z.object({
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  description: z
    .string()
    .nullable()
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  kingdom: kingdoms,
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  total_population: z.number().int().positive().min(1).optional(),
  image: z
    .string()
    .url()
    .nullable()
    .transform((val) => val?.trim()),
});

type FormData = z.infer<typeof speciesSchema>;

const defaultValues: Partial<FormData> = {
  kingdom: "Animalia",
};

export default function SpeciesCard({ species, userId }: { species: Species; userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [, setDeleteOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onDelete = async () => {
    // The `session` logic to get the user's session remains the same as in your `onSubmit` function
    const supabase = createClientComponentClient<Database>();

    const { error } = await supabase.from("species").delete().eq("id", species.id);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    form.reset();
    setDeleteOpen(false);
    router.refresh();
  };

  const onSubmit = async (input: FormData) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createClientComponentClient<Database>();

    const updateData = [
      {
        id: species.id,
        author: userId,
        common_name: input.common_name ?? null,
        description: input.description ?? null,
        kingdom: input.kingdom || "",
        scientific_name: input.scientific_name,
        total_population: input.total_population ?? null,
        image: input.image ?? null,
      },
    ] as {
      author?: string; // Make 'author' property optional
      common_name?: string | null; // Keep 'common_name' property optional
      description?: string | null; // Keep 'description' property optional
      kingdom?: "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria"; // Keep 'kingdom' property required
      scientific_name?: string; // Keep 'scientific_name' property required
      total_population?: number | null; // Make 'total_population' property optional
      image?: string | null; // Make 'image' property optional
    };

    const { error } = await supabase.from("species").update(updateData).eq("id", species.id).eq("author", userId);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }
    // Reset form values to the data values that have been processed by zod.
    form.reset(input);
    setIsEditOpen(false);
    router.refresh();
  };

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
              <h2 className="mt-3 text-2xl font-semibold">
                <b>Common Name: </b>
                {species.common_name}
              </h2>
              <h4 className="text-lg font-light italic">
                <b> Scientific Name</b> {species.scientific_name}
              </h4>
              <h4 className="text-lg font-light italic">
                {" "}
                <b>Kingdom: </b> {species.kingdom}
              </h4>
            </DialogDescription>
          </DialogHeader>
          <p>
            <b>Total Population: </b>
            {species.total_population}
          </p>
          <p>
            <b>Description: </b>
            {species.description}
          </p>
        </DialogContent>
      </Dialog>
      {/* edit */}
      <div>
        {species.author == userId && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2 w-full" onClick={() => setIsEditOpen(true)}>
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Species</DialogTitle>
                <DialogDescription>
                  Edit new species here. Click &quot;Edit Species&quot; below when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
                  <div className="grid w-full items-center gap-4">
                    <FormField
                      control={form.control}
                      name="scientific_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scientific Name</FormLabel>
                          <FormControl>
                            <Input placeholder={species.scientific_name} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="common_name"
                      render={({ field }) => {
                        // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                        const { value } = field;
                        return (
                          <FormItem>
                            <FormLabel>Common Name</FormLabel>
                            <FormControl>
                              <Input
                                value={value ?? ""}
                                placeholder={species.common_name ?? ""}
                                onChange={(event) => field.onChange(event.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="kingdom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kingdom</FormLabel>
                          {/* Using shadcn/ui form with enum: https://github.com/shadcn-ui/ui/issues/772 */}
                          <Select
                            onValueChange={(value) => field.onChange(kingdoms.parse(value))}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a kingdom" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                {kingdoms.options.map((kingdom, index) => (
                                  <SelectItem key={index} value={kingdom}>
                                    {kingdom}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total_population"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total population</FormLabel>
                          <FormControl>
                            {/* Using shadcn/ui form with number: https://github.com/shadcn-ui/ui/issues/421 */}
                            <Input
                              type="number"
                              placeholder={String(species.total_population)}
                              onChange={(event) => field.onChange(+event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder={species.image ?? ""} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => {
                        // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                        const { value, ...rest } = field;
                        return (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea value={value ?? ""} placeholder={species.description ?? ""} {...rest} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <div className="flex">
                      <Button type="submit" className="ml-1 mr-1 flex-auto">
                        Edit Species
                      </Button>
                      <Button
                        type="button"
                        className="ml-1 mr-1 flex-auto"
                        variant="secondary"
                        onClick={() => setIsEditOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* remove */}
      {species.author == userId && (
        <Dialog onClick={() => setDeleteOpen(false)}>
          <DialogTrigger asChild>
            <Button className="mt-3 w-full">Delete Species</Button>
          </DialogTrigger>
          <DialogContent>
            <p>Are you sure you want to delete this species?</p>
            <Button
              onClick={() => {
                onDelete;
              }}
            >
              Yes, Delete
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
