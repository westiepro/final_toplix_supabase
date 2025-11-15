'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { PropertyFilters, FilterState } from '@/components/property-filters'
import { PropertyCard } from '@/components/property-card'
import { geocodeCity, PropertyMapRef } from '@/components/property-map'
import { Property } from '@/types/property'
import { Loader2, List, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchPropertiesByType } from '@/lib/properties'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PropertyMap = dynamic(
  () => import('@/components/property-map').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
) as React.ComponentType<React.ComponentProps<typeof import('@/components/property-map').PropertyMap>> & {
  displayName?: string
}

export default function BuyPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [viewportProperties, setViewportProperties] = useState<Property[]>([])
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    country: undefined,
    minPrice: 0,
    maxPrice: 2000000,
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    minArea: 0,
    maxArea: 500,
    features: [],
  })
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.0, 37.1]) // Center of Algarve region
  const [mapZoom, setMapZoom] = useState(8.5) // Zoom level to show all of Algarve
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map')
  const mapRef = useRef<PropertyMapRef>(null)

  const applyFilters = useCallback(() => {
    let filtered = [...properties]

    // Filter by listing type (buy only)
    filtered = filtered.filter((p) => p.listing_type === 'buy')

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter((p) =>
        p.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    // Filter by price
    filtered = filtered.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    )

    // Filter by property type
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter((p) => p.property_type === filters.propertyType)
    }

    // Filter by bedrooms
    if (filters.bedrooms !== 'all') {
      if (Array.isArray(filters.bedrooms)) {
        // Multiple values selected - show properties with any of these bedroom counts
        filtered = filtered.filter((p) => (filters.bedrooms as number[]).includes(p.bedrooms))
      } else {
        // Single value selected - show properties with exact bedroom count
        filtered = filtered.filter((p) => p.bedrooms === filters.bedrooms)
      }
    }

    // Filter by bathrooms
    if (filters.bathrooms !== 'all') {
      if (Array.isArray(filters.bathrooms)) {
        // Multiple values selected - show properties with any of these bathroom counts
        filtered = filtered.filter((p) => (filters.bathrooms as number[]).includes(p.bathrooms))
      } else {
        // Single value selected - show properties with exact bathroom count
        filtered = filtered.filter((p) => p.bathrooms === filters.bathrooms)
      }
    }

    // Filter by area
    filtered = filtered.filter(
      (p) => p.area >= filters.minArea && p.area <= filters.maxArea
    )

    setFilteredProperties(filtered)
    setViewportProperties(filtered)
  }, [properties, filters])

  const sortProperties = useCallback((props: Property[], sortOption: string): Property[] => {
    const sorted = [...props]
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA // Newest first
        })
      case 'price-low-to-high':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-high-to-low':
        return sorted.sort((a, b) => b.price - a.price)
      case 'area-high-to-low':
        return sorted.sort((a, b) => b.area - a.area)
      default:
        return sorted
    }
  }, [])

  const sortedViewportProperties = sortProperties(viewportProperties, sortBy)

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const loadProperties = async () => {
    try {
      setLoading(true)
      const data = await fetchPropertiesByType('buy')
      setProperties(data)
      setFilteredProperties(data)
      setViewportProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
      setProperties([])
      setFilteredProperties([])
      setViewportProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleCitySearch = useCallback(async (city: string) => {
    if (!city) return

    const coordinates = await geocodeCity(city)
    if (coordinates) {
      setMapCenter(coordinates)
      setMapZoom(12)
      if (mapRef.current) {
        mapRef.current.flyToLocation(coordinates[0], coordinates[1], 12)
      }
    }
  }, [])

  const viewportTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const filteredPropertiesRef = useRef(filteredProperties)
  
  useEffect(() => {
    filteredPropertiesRef.current = filteredProperties
  }, [filteredProperties])
  
  const handleViewportChange = useCallback((bounds: {
    ne: [number, number]
    sw: [number, number]
  }) => {
    if (viewportTimeoutRef.current) {
      clearTimeout(viewportTimeoutRef.current)
    }
    
    viewportTimeoutRef.current = setTimeout(() => {
      const inViewport = filteredPropertiesRef.current.filter((property) => {
        const lat = property.latitude
        const lng = property.longitude
        return (
          lat >= bounds.sw[1] &&
          lat <= bounds.ne[1] &&
          lng >= bounds.sw[0] &&
          lng <= bounds.ne[0]
        )
      })
      setViewportProperties(inViewport)
    }, 200)
  }, [])
  
  useEffect(() => {
    return () => {
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current)
      }
    }
  }, [])

  const handleSaveSearch = () => {
    console.log('Saving search with filters:', filters)
  }

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  useEffect(() => {
    loadProperties()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <PropertyFilters
        onFiltersChange={handleFiltersChange}
        onCitySearch={handleCitySearch}
        onSaveSearch={handleSaveSearch}
        filteredCount={filteredProperties.length}
        properties={properties}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {/* View Toggle - Top Right Above Map (PC only) */}
        <div className="hidden lg:flex absolute top-4 right-4 z-20 items-center gap-1 border rounded-lg p-1 bg-white shadow-lg">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="h-8 px-3"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        {/* Property Cards - Left Side */}
        <div className={`w-full overflow-y-auto bg-background ${viewMode === 'map' ? 'border-r lg:w-[53%]' : 'w-full'}`}>
          <div className="container mx-auto p-4">
            {/* Header and Sort/Counter on same line */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {filters.city 
                  ? (
                    <>
                      Properties for sale in {filters.city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                      {filters.country && (
                        <span className="text-lg">
                          {filters.country.toLowerCase().includes('portugal') ? '🇵🇹' : filters.country.toLowerCase().includes('spain') || filters.country.toLowerCase().includes('españa') ? '🇪🇸' : ''}
                        </span>
                      )}
                    </>
                  )
                  : 'Properties for sale'}
              </h1>
              
              {/* Sort Dropdown and Property Counter */}
              <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'lg:mr-[180px]' : ''}`}>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-to-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-to-low">Price: High to Low</SelectItem>
                  <SelectItem value="area-high-to-low">Square Meter: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {sortedViewportProperties.length} {sortedViewportProperties.length === 1 ? 'home' : 'homes'}
              </div>
              </div>
            </div>
            
            {sortedViewportProperties.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12">
                <p className="text-muted-foreground">No properties found in this area</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-4 ${viewMode === 'list' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
                {sortedViewportProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    onMouseEnter={() => setHoveredPropertyId(property.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map - Right Side */}
        {viewMode === 'map' && (
          <div className="hidden w-full lg:block lg:w-[47%]">
            <PropertyMap
              ref={mapRef}
              properties={filteredProperties}
              onViewportChange={handleViewportChange}
              initialCenter={mapCenter}
              initialZoom={mapZoom}
              hoveredPropertyId={hoveredPropertyId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

