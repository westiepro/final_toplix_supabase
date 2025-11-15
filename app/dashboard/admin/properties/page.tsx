'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Property } from '@/types/property'
import Image from 'next/image'
import {
  fetchPropertiesWithCompany,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/lib/properties'
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
import { ImageUpload } from '@/components/image-upload'
import { LocationPicker } from '@/components/location-picker'

interface PropertyWithCompany extends Property {
  company_name?: string
  status?: 'active' | 'inactive' | 'pending'
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithCompany[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<PropertyWithCompany | null>(null)
  const [isAddingProperty, setIsAddingProperty] = useState(false)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const data = await fetchPropertiesWithCompany()
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
      setProperties([])
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const success = await deleteProperty(id)
      if (success) {
        setProperties(properties.filter((p) => p.id !== id))
        setSelectedProperties((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        alert('Failed to delete property. Please try again.')
      }
    }
  }

  const handleEdit = (id: string) => {
    const property = properties.find((p) => p.id === id)
    if (property) {
      setEditingProperty(property)
      setIsDialogOpen(true)
    }
  }

  const handleSave = async (data: Partial<PropertyWithCompany>) => {
    try {
      if (editingProperty) {
        // Update existing property
        console.log('Updating property:', editingProperty.id, 'with data:', data)
        const updated = await updateProperty(editingProperty.id, data)
        if (updated) {
          setProperties(
            properties.map((p) =>
              p.id === editingProperty.id ? { ...p, ...updated } : p
            )
          )
          setIsDialogOpen(false)
          setEditingProperty(null)
        } else {
          console.error('Failed to update property. Check console for details.')
          
          // Check if it's a mock property ID
          const isMockId = editingProperty.id.includes('-') && !editingProperty.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
          
          if (isMockId) {
            alert(
              'Cannot update mock property. This property is from mock data and doesn\'t exist in the database.\n\n' +
              'Please create a new property instead, or delete this one and create a new one with the same details.'
            )
          } else {
            alert('Failed to update property. Please check the browser console (F12) for detailed error messages.')
          }
        }
      } else {
        // Create new property
        const newProperty = await createProperty({
          title: data.title || '',
          description: data.description || '',
          price: data.price || 0,
          property_type: data.property_type || 'house',
          listing_type: data.listing_type || 'buy',
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          area: data.area || 0,
          address: data.address || '',
          city: data.city || '',
          state: '', // Default empty state since field was removed from form
          zip_code: data.zip_code || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          images: data.images || [],
        } as Omit<Property, 'id' | 'created_at' | 'updated_at'>)
        
        if (newProperty) {
          // Add company_name and status to match PropertyWithCompany interface
          const propertyWithCompany: PropertyWithCompany = {
            ...newProperty,
            company_name: data.company_name || 'Imopix Properties',
            status: (data.status as 'active' | 'inactive' | 'pending') || 'active',
          }
          setProperties([propertyWithCompany, ...properties])
          setIsDialogOpen(false)
          setIsAddingProperty(false)
        } else {
          // Check if Supabase is configured
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            alert('Supabase is not configured. Please check your environment variables.')
          } else {
            // Try to get more details from the error
            console.error('Failed to create property. Check console for details.')
            alert('Failed to create property. Common issues:\n\n1. RLS policies not set up - Run the SQL in supabase-schema.sql\n2. Missing required fields\n3. Invalid data types\n\nPlease check the browser console (F12) for detailed error message.')
          }
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert('An error occurred while saving the property.')
    }
  }

  const handleAddNew = () => {
    setEditingProperty(null)
    setIsAddingProperty(true)
    setIsDialogOpen(true)
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
      <AdminHeader 
        title="All Properties"
        actionButton={
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        }
      />
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setEditingProperty(null)
          setIsAddingProperty(false)
        }
      }}>
        <DialogContent className="!max-w-[60vw] sm:!max-w-[60vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </DialogTitle>
            <DialogDescription>
              {editingProperty
                ? 'Update property details below'
                : 'Fill in the details to add a new property'}
            </DialogDescription>
          </DialogHeader>
          {(editingProperty || isAddingProperty) && (
            <PropertyForm
              property={editingProperty || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingProperty(null)
                setIsAddingProperty(false)
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


function PropertyForm({
  property,
  onSave,
  onCancel,
}: {
  property?: PropertyWithCompany
  onSave: (data: Partial<PropertyWithCompany>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<PropertyWithCompany>>({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || 0,
    property_type: property?.property_type || 'house',
    listing_type: property?.listing_type || 'buy',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    area: property?.area || 0,
    address: property?.address || '', // Empty by default
    city: property?.city || '', // Empty by default
    zip_code: property?.zip_code || '', // Empty by default
    latitude: property?.latitude || 0, // 0 by default (not valid coordinates)
    longitude: property?.longitude || 0, // 0 by default (not valid coordinates)
    status: property?.status || 'active',
    images: property?.images || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that location is set
    if (!formData.latitude || !formData.longitude || formData.latitude === 0 || formData.longitude === 0) {
      alert('Please set the property location by clicking on the map or selecting a city.')
      return
    }
    
    if (!formData.address || !formData.city) {
      alert('Please set the property location by clicking on the map. The address and city will be automatically filled.')
      return
    }
    
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Location Picker - Moved to top */}
      <div>
        <LocationPicker
          initialLatitude={formData.latitude && formData.latitude !== 0 ? formData.latitude : undefined}
          initialLongitude={formData.longitude && formData.longitude !== 0 ? formData.longitude : undefined}
          initialCity={formData.city || ''}
          onLocationChange={(locationData) => {
            setFormData({
              ...formData,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              address: locationData.address,
              city: locationData.city,
              zip_code: locationData.postalCode,
            })
          }}
        />
        
        {/* Read-only location fields below map */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="zip_code">Postal Code</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="text"
              value={formData.latitude}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="text"
              value={formData.longitude}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
      </div>

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
          <Label htmlFor="area">Area (m²)</Label>
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
        <ImageUpload
          images={Array.isArray(formData.images) ? formData.images : []}
          onChange={(newImages) => setFormData({ ...formData, images: newImages })}
          maxImages={10}
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
