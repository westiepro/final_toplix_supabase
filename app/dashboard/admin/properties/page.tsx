'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { Property } from '@/types/property'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea'

interface PropertyWithCompany extends Property {
  company_name?: string
  status?: 'active' | 'inactive' | 'pending'
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithCompany[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<PropertyWithCompany | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = () => {
    const buyProperties = generateMockBuyProperties()
    const rentProperties = generateMockRentProperties()
    const allProperties = [...buyProperties, ...rentProperties].map((p) => ({
      ...p,
      company_name: 'Imopix Properties',
      status: 'active' as const,
    }))
    setProperties(allProperties)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter((p) => p.id !== id))
      setSelectedProperties((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleEdit = (id: string) => {
    const property = properties.find((p) => p.id === id)
    if (property) {
      setEditingProperty(property)
      setIsDialogOpen(true)
    }
  }

  const handleSave = (data: Partial<PropertyWithCompany>) => {
    if (editingProperty) {
      setProperties(
        properties.map((p) =>
          p.id === editingProperty.id
            ? { ...p, ...data, updated_at: new Date().toISOString() }
            : p
        )
      )
    }
    setIsDialogOpen(false)
    setEditingProperty(null)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(new Set(properties.map((p) => p.id)))
    } else {
      setSelectedProperties(new Set())
    }
  }

  const handleSelectProperty = (id: string, checked: boolean) => {
    setSelectedProperties((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const formatPropertyId = (id: string) => {
    return id.length > 12 ? `${id.substring(0, 12)}...` : id
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="All Properties" />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property details below
            </DialogDescription>
          </DialogHeader>
          {editingProperty && (
            <PropertyForm
              property={editingProperty}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingProperty(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            {properties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No properties yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProperties.size === properties.length && properties.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Beds</TableHead>
                      <TableHead>Baths</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProperties.has(property.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProperty(property.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            {property.images && property.images.length > 0 ? (
                              <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{property.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {formatPropertyId(property.id)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{property.city}</span>
                          <span className="text-xs text-muted-foreground">
                            {property.zip_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{property.company_name || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{formatPrice(property.price)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{property.property_type}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={property.status === 'active' ? 'default' : 'secondary'}
                          className={
                            property.status === 'active'
                              ? 'bg-green-500 text-white hover:bg-green-600 border-0'
                              : ''
                          }
                        >
                          {property.status === 'active' ? 'Active' : property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{property.bedrooms}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{property.bathrooms}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={() => handleEdit(property.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Generate mock properties
function generateMockBuyProperties(): Property[] {
  const cities = [
    { name: 'Faro', lat: 37.0194, lng: -7.9322 },
    { name: 'Lagos', lat: 37.1020, lng: -8.6753 },
    { name: 'Portimão', lat: 37.1386, lng: -8.5378 },
    { name: 'Albufeira', lat: 37.0889, lng: -8.2503 },
    { name: 'Tavira', lat: 37.1264, lng: -7.6486 },
    { name: 'Loulé', lat: 37.1377, lng: -8.0197 },
    { name: 'Vilamoura', lat: 37.0764, lng: -8.1097 },
    { name: 'Carvoeiro', lat: 37.0975, lng: -8.4681 },
  ]

  const propertyTypes: Property['property_type'][] = [
    'house', 'apartment', 'condo', 'townhouse', 'villa',
  ]

  const properties: Property[] = []

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 5; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const bedrooms = Math.floor(Math.random() * 4) + 1
      const bathrooms = Math.floor(Math.random() * 3) + 1
      const area = Math.floor(Math.random() * 3000) + 800
      const basePrice = (cityIndex + 1) * 100000 + Math.random() * 400000

      const titleVariations = [
        `${city.name} ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} center`,
        `${city.name} ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`,
        `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${city.name}`,
      ]
      const title = titleVariations[i % titleVariations.length]

      properties.push({
        id: `buy-${city.name}-${i}`,
        title: title,
        description: `Beautiful ${propertyType} with modern amenities in the heart of ${city.name}, Algarve.`,
        price: Math.floor(basePrice),
        property_type: propertyType,
        listing_type: 'buy',
        bedrooms,
        bathrooms,
        area,
        address: `${Math.floor(Math.random() * 999)} Rua ${['da Praia', 'do Sol', 'dos Pescadores', 'da Igreja', 'Principal'][i]}`,
        city: city.name,
        state: 'Algarve',
        zip_code: `${8000 + Math.floor(Math.random() * 999)}`,
        latitude: city.lat + (Math.random() * 0.05 + 0.02),
        longitude: city.lng + (Math.random() - 0.5) * 0.05,
        images: [`https://images.unsplash.com/photo-${1568605114967 + i}-a6c3738ba01d?w=800`],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  })

  return properties
}

function generateMockRentProperties(): Property[] {
  const cities = [
    { name: 'Faro', lat: 37.0194, lng: -7.9322 },
    { name: 'Lagos', lat: 37.1020, lng: -8.6753 },
    { name: 'Portimão', lat: 37.1386, lng: -8.5378 },
    { name: 'Albufeira', lat: 37.0889, lng: -8.2503 },
    { name: 'Tavira', lat: 37.1264, lng: -7.6486 },
  ]

  const propertyTypes: Property['property_type'][] = [
    'house', 'apartment', 'condo', 'townhouse', 'villa',
  ]

  const properties: Property[] = []

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 5; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const bedrooms = Math.floor(Math.random() * 3) + 1
      const bathrooms = Math.floor(Math.random() * 2) + 1
      const area = Math.floor(Math.random() * 2000) + 600
      const basePrice = (cityIndex + 1) * 500 + Math.random() * 1500

      const titleVariations = [
        `Rental in ${city.name}`,
        `${city.name} ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} for Rent`,
        `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} for Rent in ${city.name}`,
      ]
      const title = titleVariations[i % titleVariations.length]

      properties.push({
        id: `rent-${city.name}-${i}`,
        title: title,
        description: `Spacious ${propertyType} available for rent in ${city.name}, Algarve.`,
        price: Math.floor(basePrice),
        property_type: propertyType,
        listing_type: 'rent',
        bedrooms,
        bathrooms,
        area,
        address: `${Math.floor(Math.random() * 999)} Rua ${['da Praia', 'do Sol', 'dos Pescadores', 'da Igreja', 'Principal'][i]}`,
        city: city.name,
        state: 'Algarve',
        zip_code: `${8000 + Math.floor(Math.random() * 999)}`,
        latitude: city.lat + (Math.random() * 0.05 + 0.02),
        longitude: city.lng + (Math.random() - 0.5) * 0.05,
        images: [`https://images.unsplash.com/photo-${1568605114967 + i}-a6c3738ba01d?w=800`],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  })

  return properties
}

function PropertyForm({
  property,
  onSave,
  onCancel,
}: {
  property: PropertyWithCompany
  onSave: (data: Partial<PropertyWithCompany>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<PropertyWithCompany>>({
    title: property.title || '',
    description: property.description || '',
    price: property.price || 0,
    property_type: property.property_type || 'house',
    listing_type: property.listing_type || 'buy',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip_code: property.zip_code || '',
    latitude: property.latitude || 0,
    longitude: property.longitude || 0,
    status: property.status || 'active',
    company_name: property.company_name || '',
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
          <Label htmlFor="price">Price (€)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property_type">Property Type</Label>
          <Select
            value={formData.property_type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                property_type: value as Property['property_type'],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
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
              setFormData({
                ...formData,
                listing_type: value as Property['listing_type'],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select listing type" />
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
            min="0"
            value={formData.bedrooms}
            onChange={(e) =>
              setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            value={formData.bathrooms}
            onChange={(e) =>
              setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="area">Area (sqft)</Label>
          <Input
            id="area"
            type="number"
            min="0"
            value={formData.area}
            onChange={(e) =>
              setFormData({ ...formData, area: parseInt(e.target.value) || 0 })
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
              setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
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
              setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              status: value as 'active' | 'inactive' | 'pending',
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) =>
            setFormData({ ...formData, company_name: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Property</Button>
      </div>
    </form>
  )
}
