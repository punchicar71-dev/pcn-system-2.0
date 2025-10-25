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
import { supabase } from '@/lib/supabase-client'
import { SalesAgent } from '@/lib/database.types'

export default function SalesAgentTab() {
  const [agents, setAgents] = useState<SalesAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
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

  const handleAddAgent = async () => {
    if (!formData.user_id.trim() || !formData.name.trim()) return

    try {
      const { error } = await supabase
        .from('sales_agents')
        .insert([{
          user_id: formData.user_id,
          name: formData.name,
          email: formData.email || null,
          is_active: true,
        }])

      if (error) throw error

      setFormData({ user_id: '', name: '', email: '' })
      setIsAddDialogOpen(false)
      fetchAgents()
    } catch (error) {
      console.error('Error adding agent:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchAgents()
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sales agent?')) return

    try {
      const { error } = await supabase
        .from('sales_agents')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAgents()
    } catch (error) {
      console.error('Error deleting agent:', error)
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
                Add a new in-house sales agent to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  placeholder="e.g., 00471"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                />
              </div>
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
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No sales agents found
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent.id} className={!agent.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{agent.user_id}</TableCell>
                  <TableCell>{agent.name}</TableCell>
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
    </div>
  )
}
