"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 drop-shadow-md text-foreground bg-card",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  placeholder?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  maxCount?: number;
  animation?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      placeholder,
      options,
      value,
      onValueChange,
      disabled,
      maxCount = 5,
      variant,
      animation,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<string[]>(value);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setSelected(value);
    }, [value]);

    const handleSelect = (item: string) => {
      if (!selected.includes(item)) {
        const newSelected = [...selected, item];
        setSelected(newSelected);
        onValueChange(newSelected);
      }
    };

    const handleRemove = (item: string) => {
      const newSelected = selected.filter((s) => s !== item);
      setSelected(newSelected);
      onValueChange(newSelected);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            const newSelected = [...selected];
            newSelected.pop();
            setSelected(newSelected);
            onValueChange(newSelected);
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    };

    const selectables = options.filter(
      (option) => !selected.includes(option.value)
    );

    return (
      <div ref={ref} {...props}>
        <Command
          onKeyDown={handleKeyDown}
          className="overflow-visible bg-transparent"
        >
          <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex flex-wrap gap-1">
              {selected.map((item) => {
                const option = options.find((o) => o.value === item);
                return (
                  <Badge
                    key={item}
                    className={cn(multiSelectVariants({ variant }))}
                    style={{ animationDelay: `${animation}s` }}
                  >
                    {option?.label}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(item);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleRemove(item)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })}
              <CommandPrimitive.Input
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                onBlur={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                disabled={
                  disabled || (maxCount ? selected.length >= maxCount : false)
                }
              />
            </div>
          </div>
          <div className="relative mt-2">
            {open && selectables.length > 0 ? (
              <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                <CommandList className="h-full overflow-auto">
                  <CommandGroup>
                    {selectables.map((option) => {
                      return (
                        <CommandItem
                          key={option.value}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onSelect={() => {
                            setInputValue("");
                            handleSelect(option.value);
                          }}
                          className={"cursor-pointer"}
                        >
                          {option.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </div>
            ) : null}
          </div>
        </Command>
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
