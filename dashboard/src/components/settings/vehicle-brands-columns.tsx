"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VehicleBrand, VehicleModel } from "@/lib/database.types"

export type BrandWithModels = VehicleBrand & {
  models: VehicleModel[]
}

export const createColumns = (
  onEdit: (brand: VehicleBrand) => void,
  onDelete: (id: string) => void,
  onViewModels: (id: string) => void
): ColumnDef<BrandWithModels>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "models",
    header: "Model",
    cell: ({ row }) => {
      const models = row.original.models || []
      return (
        <div className="flex flex-wrap gap-1">
          {models.slice(0, 10).map((model) => (
            <span
              key={model.id}
              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs"
            >
              {model.name}
            </span>
          ))}
          {models.length > 10 && (
            <span className="text-xs text-gray-500">
              +{models.length - 10} more
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const brand = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModels(brand.id)}
          >
            View All
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(brand)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(brand.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
