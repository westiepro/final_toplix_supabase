'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'agent' | 'admin'
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers([
      {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        role: 'agent',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        email: 'agent@example.com',
        name: 'Agent User',
        role: 'agent',
        created_at: new Date().toISOString(),
      },
    ])
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const handleSave = (data: Partial<User>) => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u))
      )
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email || '',
        name: data.name || '',
        role: data.role || 'user',
        created_at: new Date().toISOString(),
      }
      setUsers([...users, newUser])
    }
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title="Admin Panel"
        actionButton={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? 'Update user details'
                    : 'Add a new user to the system'}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSave={handleSave}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingUser(null)
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Site Users</h2>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No users yet
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              user.role === 'admin'
                                ? 'default'
                                : user.role === 'agent'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {user.role}
                          </Badge>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => {
                              setEditingUser(user)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserForm({
  user,
  onSave,
  onCancel,
}: {
  user: User | null
  onSave: (data: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as any })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="user">User</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save User</Button>
      </div>
    </form>
  )
}

