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
