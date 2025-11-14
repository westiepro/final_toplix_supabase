'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Edit, Trash2, Plus } from 'lucide-react'
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

interface Company {
  id: string
  name: string
  description: string
  logo_url?: string
  website?: string
  created_at: string
}

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'agent' | 'admin'
  created_at: string
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Mock companies
    setCompanies([
      {
        id: '1',
        name: 'Premium Realty Group',
        description: 'Leading real estate company in NYC',
        website: 'https://premiumrealty.com',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Coastal Properties',
        description: 'Specializing in beachfront properties',
        website: 'https://coastalproperties.com',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Urban Living Realty',
        description: 'Modern urban properties',
        website: 'https://urbanliving.com',
        created_at: new Date().toISOString(),
      },
    ])

    // Mock users
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
    ])
  }

  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter((c) => c.id !== id))
    }
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const handleSaveCompany = (data: Partial<Company>) => {
    if (editingCompany) {
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id ? { ...c, ...data } : c
        )
      )
    } else {
      const newCompany: Company = {
        id: Date.now().toString(),
        name: data.name || '',
        description: data.description || '',
        website: data.website,
        logo_url: data.logo_url,
        created_at: new Date().toISOString(),
      }
      setCompanies([...companies, newCompany])
    }
    setIsCompanyDialogOpen(false)
    setEditingCompany(null)
  }

  const handleSaveUser = (data: Partial<User>) => {
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
    setIsUserDialogOpen(false)
    setEditingUser(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage real estate companies and site users
        </p>
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Real Estate Companies</CardTitle>
                  <CardDescription>
                    Manage all registered real estate companies
                  </CardDescription>
                </div>
                <Dialog
                  open={isCompanyDialogOpen}
                  onOpenChange={setIsCompanyDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCompany(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCompany ? 'Edit Company' : 'Add New Company'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCompany
                          ? 'Update company details'
                          : 'Add a new real estate company'}
                      </DialogDescription>
                    </DialogHeader>
                    <CompanyForm
                      company={editingCompany}
                      onSave={handleSaveCompany}
                      onCancel={() => {
                        setIsCompanyDialogOpen(false)
                        setEditingCompany(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No companies yet
                </p>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <Card key={company.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <CardDescription>{company.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={() => {
                                setEditingCompany(company)
                                setIsCompanyDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Site Users</CardTitle>
                  <CardDescription>
                    Manage all registered users
                  </CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
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
                      onSave={handleSaveUser}
                      onCancel={() => {
                        setIsUserDialogOpen(false)
                        setEditingUser(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                                setIsUserDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CompanyForm({
  company,
  onSave,
  onCancel,
}: {
  company: Company | null
  onSave: (data: Partial<Company>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: company?.name || '',
    description: company?.description || '',
    website: company?.website || '',
    logo_url: company?.logo_url || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          type="url"
          value={formData.logo_url}
          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Company</Button>
      </div>
    </form>
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


