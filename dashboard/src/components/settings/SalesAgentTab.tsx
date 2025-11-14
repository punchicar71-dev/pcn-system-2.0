'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase-client'
import { SalesAgent } from '@/lib/database.types'

const AGENT_TYPES = [
  { value: 'Office Sales Agent', label: 'Office Sales Agent' },
  { value: 'Vehicle Showroom Agent', label: 'Vehicle Showroom Agent' },
] as const

export default function SalesAgentTab() {
  const [agents, setAgents] = useState<SalesAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    agent_type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  }>({
    name: '',
    email: '',
    agent_type: 'Office Sales Agent',
  })

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_agents')
        .select('*')
        .order('name')

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateUserId = async (): Promise<string> => {
    try {
      // Fetch all existing user IDs
      const { data, error } = await supabase
        .from('sales_agents')
        .select('user_id')
        .order('user_id', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        // Extract the numeric part from the last user ID and increment it
        const lastUserId = data[0].user_id
        const numericPart = parseInt(lastUserId.replace(/\D/g, ''))
        const nextNumber = numericPart + 1
        // Pad with zeros to maintain 5 digits
        return nextNumber.toString().padStart(5, '0')
      } else {
        // If no agents exist, start with 00001
        return '00001'
      }
    } catch (error) {
      console.error('Error generating user ID:', error)
      // Fallback to a random number if something goes wrong
      return Math.floor(10000 + Math.random() * 90000).toString()
    }
  }

  const handleAddAgent = async () => {
    if (!formData.name.trim()) {
      alert('Please fill in Sales Agent Name')
      return
    }

    try {
      // Generate a new unique user ID
      const newUserId = await generateUserId()

      const { error } = await supabase
        .from('sales_agents')
        .insert([{
          user_id: newUserId,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          agent_type: formData.agent_type,
          is_active: true,
        }])

      if (error) {
        console.error('Database error:', error)
        alert(`Error adding agent: ${error.message}`)
        return
      }

      setFormData({ name: '', email: '', agent_type: 'Office Sales Agent' })
      setIsAddDialogOpen(false)
      fetchAgents()
    } catch (error) {
      console.error('Error adding agent:', error)
      alert('An unexpected error occurred while adding the agent')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        console.error('Database error:', error)
        alert(`Error updating agent status: ${error.message}`)
        return
      }
      
      fetchAgents()
    } catch (error) {
      console.error('Error updating agent:', error)
      alert('An unexpected error occurred while updating the agent status')
    }
  }

  const handleDelete = async (id: string) => {
    setAgentToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!agentToDelete) return

    try {
      const { error } = await supabase
        .from('sales_agents')
        .delete()
        .eq('id', agentToDelete)

      if (error) {
        console.error('Database error:', error)
        alert(`Error deleting agent: ${error.message}`)
        return
      }
      
      fetchAgents()
    } catch (error) {
      console.error('Error deleting agent:', error)
      alert('An unexpected error occurred while deleting the agent')
    } finally {
      setIsDeleteDialogOpen(false)
      setAgentToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">In-house Sales Agents</h2>
          <p className="text-sm text-gray-500">
            Only in-house permanent sales staff are displayed. Third-party sellers are not permitted to be added.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add new seller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sales Agent</DialogTitle>
              <DialogDescription>
                Add a new in-house sales agent to the system. User ID will be auto-generated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Sales Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Rashmina Yapa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-type">Agent Type</Label>
                <Select
                  value={formData.agent_type}
                  onValueChange={(value) => setFormData({ ...formData, agent_type: value as 'Office Sales Agent' | 'Vehicle Showroom Agent' })}
                >
                  <SelectTrigger id="agent-type">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent className="z-[150]" position="popper">
                    {AGENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-email">Email (Optional)</Label>
                <Input
                  id="agent-email"
                  type="email"
                  placeholder="agent@pcn.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAgent}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Sales Agent Name</TableHead>
              <TableHead>Agent Type</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No sales agents found
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent.id} className={!agent.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{agent.user_id}</TableCell>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.agent_type}</TableCell>
                  <TableCell>
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={() => handleToggleActive(agent.id, agent.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Sales Agent</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                Are you sure you want to delete this sales agent?
              </p>
              <p className="text-gray-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
