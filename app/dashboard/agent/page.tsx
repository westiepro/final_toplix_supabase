'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'
import { Property } from '@/types/property'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AgentDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = () => {
    // Mock properties for the agent's company
    const mockProperties = generateMockAgentProperties()
    setProperties(mockProperties)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter((p) => p.id !== id))
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsDialogOpen(true)
  }

  const handleSave = (formData: Partial<Property>) => {
    if (editingProperty) {
      // Update existing property
      setProperties(
        properties.map((p) =>
          p.id === editingProperty.id ? { ...p, ...formData } : p
        )
      )
    } else {
      // Add new property
      const newProperty: Property = {
        id: Date.now().toString(),
        title: formData.title || '',
        description: formData.description || '',
        price: formData.price || 0,
        property_type: formData.property_type || 'house',
        listing_type: formData.listing_type || 'buy',
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        area: formData.area || 0,
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zip_code: formData.zip_code || '',
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        images: formData.images || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProperties([...properties, newProperty])
    }
    setIsDialogOpen(false)
    setEditingProperty(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your real estate company properties
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProperty(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </DialogTitle>
              <DialogDescription>
                {editingProperty
                  ? 'Update the property details below'
                  : 'Fill in the details to add a new property'}
              </DialogDescription>
            </DialogHeader>
            <PropertyForm
              property={editingProperty}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingProperty(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Properties ({properties.length})</CardTitle>
          <CardDescription>
            All properties managed by your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No properties yet. Add your first property to get started.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PropertyForm({
  property,
  onSave,
  onCancel,
}: {
  property: Property | null
  onSave: (data: Partial<Property>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || 0,
    property_type: property?.property_type || 'house',
    listing_type: property?.listing_type || 'buy',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    area: property?.area || 0,
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zip_code: property?.zip_code || '',
    latitude: property?.latitude || 0,
    longitude: property?.longitude || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) })
            }
            required
          />
        </div>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property_type">Property Type</Label>
          <Select
            value={formData.property_type}
            onValueChange={(value) =>
              setFormData({ ...formData, property_type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="listing_type">Listing Type</Label>
          <Select
            value={formData.listing_type}
            onValueChange={(value) =>
              setFormData({ ...formData, listing_type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) =>
              setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) =>
              setFormData({ ...formData, bathrooms: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="area">Area (sqft)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) =>
              setFormData({ ...formData, area: parseInt(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="zip_code">Zip Code</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) =>
              setFormData({ ...formData, zip_code: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({ ...formData, latitude: parseFloat(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({ ...formData, longitude: parseFloat(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Property</Button>
      </div>
    </form>
  )
}

function generateMockAgentProperties(): Property[] {
  return [
    {
      id: 'agent-1',
      title: 'Luxury Downtown Apartment',
      description: 'Premium apartment in the heart of the city',
      price: 650000,
      property_type: 'apartment',
      listing_type: 'buy',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      address: '100 Business St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      latitude: 40.7128,
      longitude: -74.006,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'agent-2',
      title: 'Family Home with Garden',
      description: 'Spacious family home with large backyard',
      price: 850000,
      property_type: 'house',
      listing_type: 'buy',
      bedrooms: 4,
      bathrooms: 3,
      area: 2400,
      address: '200 Family Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90001',
      latitude: 34.0522,
      longitude: -118.2437,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}


