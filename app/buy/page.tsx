'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { PropertyFilters, FilterState } from '@/components/property-filters'
import { PropertyCard } from '@/components/property-card'
import { geocodeCity, PropertyMapRef } from '@/components/property-map'
import { Property } from '@/types/property'
import { Loader2 } from 'lucide-react'
import { fetchPropertiesByType } from '@/lib/properties'

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
    minPrice: 0,
    maxPrice: 2000000,
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    minArea: 0,
    maxArea: 10000,
  })
  const [mapCenter, setMapCenter] = useState<[number, number]>([-7.9322, 37.0194]) // Faro, Algarve
  const [mapZoom, setMapZoom] = useState(10)
  const [loading, setLoading] = useState(true)
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
      filtered = filtered.filter((p) => p.bedrooms >= (filters.bedrooms as number))
    }

    // Filter by bathrooms
    if (filters.bathrooms !== 'all') {
      filtered = filtered.filter((p) => p.bathrooms >= (filters.bathrooms as number))
    }

    // Filter by area
    filtered = filtered.filter(
      (p) => p.area >= filters.minArea && p.area <= filters.maxArea
    )

    setFilteredProperties(filtered)
    setViewportProperties(filtered)
  }, [properties, filters])

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
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Property Cards - Left Side */}
        <div className="w-full overflow-y-auto border-r bg-background lg:w-1/2">
          <div className="container mx-auto p-4">
            {viewportProperties.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12">
                <p className="text-muted-foreground">No properties found in this area</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {viewportProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map - Right Side */}
        <div className="hidden w-full lg:block lg:w-1/2">
          <PropertyMap
            ref={mapRef}
            properties={filteredProperties}
            onViewportChange={handleViewportChange}
            initialCenter={mapCenter}
            initialZoom={mapZoom}
          />
        </div>
      </div>
    </div>
  )
}

