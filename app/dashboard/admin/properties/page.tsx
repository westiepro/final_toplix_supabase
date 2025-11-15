'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus, Search, LayoutGrid, Table as TableIcon, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { useToast } from '@/components/ui/toast'

interface PropertyWithCompany extends Property {
  company_name?: string
  status?: 'active' | 'inactive' | 'pending'
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithCompany[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithCompany[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<PropertyWithCompany | null>(null)
  const [isAddingProperty, setIsAddingProperty] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [listingFilter, setListingFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const data = await fetchPropertiesWithCompany()
      setProperties(data)
      setFilteredProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
      setProperties([])
      setFilteredProperties([])
    }
  }

  // Apply filters whenever search or filters change
  useEffect(() => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.property_type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => (p.status || 'active') === statusFilter)
    }

    // Listing filter
    if (listingFilter !== 'all') {
      filtered = filtered.filter((p) => p.listing_type === listingFilter)
    }

    setFilteredProperties(filtered)
  }, [properties, searchQuery, typeFilter, statusFilter, listingFilter])

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
          price: data.price ?? 0,
          property_type: data.property_type || 'house',
          listing_type: data.listing_type || 'buy',
          bedrooms: data.bedrooms ?? 0,
          bathrooms: data.bathrooms ?? 0,
          area: data.area ?? 0,
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
          showToast('Property added successfully!', 'success')
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
      setSelectedProperties(new Set(filteredProperties.map((p) => p.id)))
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
      {ToastComponent}
      <AdminHeader 
        title="All Properties"
        actionButton={
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
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
        <DialogContent className="!max-w-[60vw] sm:!max-w-[60vw] w-full max-h-[90vh] overflow-y-auto" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
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
        {/* Search and Filters */}
        <Card className="mb-4 border-2 shadow-md">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* All Types Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>

              {/* All Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* All Listings Filter */}
              <Select value={listingFilter} onValueChange={setListingFilter}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="buy">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {properties.length === 0 ? 'No properties yet' : 'No properties match your filters'}
              </div>
            ) : (
              <>
                {/* Showing count and View Toggle */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProperties.length} of {properties.length} properties
                  </p>
                  <div className="flex items-center gap-2 border rounded-lg p-1 bg-background">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="h-8 px-3"
                    >
                      <TableIcon className="h-4 w-4 mr-2" />
                      Table
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 px-3"
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                  </div>
                </div>
                
                {viewMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProperties.size === filteredProperties.length && filteredProperties.length > 0}
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
                  {filteredProperties.map((property) => (
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
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredProperties.map((property) => (
                        <PropertyGridCard
                          key={property.id}
                          property={property}
                          isSelected={selectedProperties.has(property.id)}
                          onSelect={(checked) => handleSelectProperty(property.id, checked)}
                          onEdit={() => handleEdit(property.id)}
                          onDelete={() => handleDelete(property.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PropertyGridCard({
  property,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  property: PropertyWithCompany
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const images = property.images && property.images.length > 0 ? property.images : []
  const hasMultipleImages = images.length > 1

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg h-full flex flex-col pt-0 pb-0 gap-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-muted">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            {hasMultipleImages && isHovered && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-500/50 hover:bg-gray-500/60 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-500/50 hover:bg-gray-500/60 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </>
            )}
            {hasMultipleImages && currentImageIndex > 0 && isHovered && (
              <div className="absolute bottom-2 left-2 z-20 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="absolute top-2 left-2 z-20">
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
        </div>
      </div>
      <CardContent className="px-3 pt-2 pb-2 flex-1 relative">
        {/* Price and action icons */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-2xl font-bold text-blue-600">
            €{property.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-600 hover:text-destructive" />
            </Button>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {property.title}
        </h3>
        
        {/* Location - only city */}
        <div className="flex items-center gap-1 text-base text-muted-foreground mb-1.5">
          <MapPin className="h-4 w-4" />
          <span>{property.city}</span>
        </div>
        
        {/* Divider line */}
        <div className="border-t border-gray-200 my-1.5"></div>
        
        {/* Property details */}
        <div className="flex items-center gap-4 text-base">
          <div className="flex items-center gap-1.5">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{property.area} m²</span>
          </div>
          
          {/* Property type at bottom right */}
          <div className="ml-auto">
            <span className="text-sm font-medium capitalize">{property.property_type}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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
    price: property?.price || undefined,
    property_type: property?.property_type || 'house',
    listing_type: property?.listing_type || 'buy',
    bedrooms: property?.bedrooms || undefined,
    bathrooms: property?.bathrooms || undefined,
    area: property?.area || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
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
            value={formData.price || ''}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value ? parseInt(e.target.value) : undefined })
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
              <SelectItem value="buy">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
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
            value={formData.bedrooms ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })
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
            value={formData.bathrooms ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, bathrooms: e.target.value ? parseInt(e.target.value) : undefined })
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
            value={formData.area ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, area: e.target.value ? parseInt(e.target.value) : undefined })
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
