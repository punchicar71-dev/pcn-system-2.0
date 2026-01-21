"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ComboboxOption {
  value: string
  label: string
}

interface AddableComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  // Add new item functionality
  allowAdd?: boolean
  addButtonText?: string
  addDialogTitle?: string
  addDialogDescription?: string
  addInputLabel?: string
  addInputPlaceholder?: string
  onAddNew?: (name: string) => Promise<{ id: string; name: string } | null>
  isAdding?: boolean
}

export function AddableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  allowAdd = false,
  addButtonText = "Add New",
  addDialogTitle = "Add New Item",
  addDialogDescription = "Enter the name for the new item.",
  addInputLabel = "Name",
  addInputPlaceholder = "Enter name...",
  onAddNew,
  isAdding = false,
}: AddableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newItemName, setNewItemName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const selectedOption = options.find((option) => option.value === value)

  const handleAddNew = async () => {
    if (!newItemName.trim()) {
      setError("Name is required")
      return
    }

    // Check if item already exists (case-insensitive)
    const existingItem = options.find(
      (option) => option.label.toLowerCase() === newItemName.trim().toLowerCase()
    )
    if (existingItem) {
      setError("This item already exists")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (onAddNew) {
        const newItem = await onAddNew(newItemName.trim())
        if (newItem) {
          // Select the newly added item
          onValueChange?.(newItem.id)
          setNewItemName("")
          setIsDialogOpen(false)
          setOpen(false)
        }
      }
    } catch (err) {
      console.error("Error adding new item:", err)
      setError("Failed to add item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenAddDialog = () => {
    setOpen(false)
    setNewItemName("")
    setError(null)
    setIsDialogOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault()
      handleAddNew()
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled || isAdding}
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </span>
            ) : selectedOption ? (
              selectedOption.label
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            {/* Add New Button - Positioned at top for better visibility */}
            {allowAdd && onAddNew && (
              <div className="px-2 py-2 border-b">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddDialog}
                  className="w-full justify-start bg-gray-100 border-primary/30 hover:bg-black hover:text-white"
                >
                  {addButtonText}
                </Button>
              </div>
            )}
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Add New Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{addDialogTitle}</DialogTitle>
            <DialogDescription>{addDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-item-name">{addInputLabel}</Label>
              <Input
                id="new-item-name"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder={addInputPlaceholder}
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNew} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
