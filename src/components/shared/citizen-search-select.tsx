"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Citizen } from "@/types/entities.types";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CitizenSearchSelectProps {
  citizens: Citizen[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function CitizenSearchSelect({
  citizens,
  value,
  onValueChange,
  placeholder = "Select citizen",
  searchPlaceholder = "Search by name, village, or ID...",
  emptyMessage = "No citizens found.",
  className,
}: CitizenSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = citizens.find((citizen) => citizen.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? (
            <span className="truncate">
              {selected.firstName} {selected.lastName} · {selected.address.village}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {citizens.map((citizen) => (
                <CommandItem
                  key={citizen.id}
                  value={`${citizen.firstName} ${citizen.lastName} ${citizen.nationalId} ${citizen.address.village} ${citizen.address.district}`}
                  onSelect={() => {
                    onValueChange(citizen.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === citizen.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {citizen.firstName} {citizen.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {citizen.nationalId} · {citizen.address.village},{" "}
                      {citizen.address.district}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
