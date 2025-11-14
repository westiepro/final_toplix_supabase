'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
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

interface Company {
  id: string
  name: string
  description: string
  logo_url?: string
  website?: string
  created_at: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = () => {
    setCompanies([
      {
        id: '1',
        name: 'Premium Realty Group',
        description: 'Leading real estate company in Algarve',
        website: 'https://premiumrealty.com',
        created_at: new Date().toISOString(),
      },
    ])
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter((c) => c.id !== id))
    }
  }

  const handleSave = (data: Partial<Company>) => {
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
    setIsDialogOpen(false)
    setEditingCompany(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title="Admin Panel"
        actionButton={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onSave={handleSave}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingCompany(null)
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Real Estate Companies</h2>
          <p className="text-muted-foreground">Manage all registered real estate companies</p>
        </div>

        <Card>
          <CardContent className="pt-6">
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
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(company.id)}
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
      </div>
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

