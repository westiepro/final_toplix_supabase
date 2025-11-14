'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { PropertyFilters, FilterState } from '@/components/property-filters'
import { PropertyCard } from '@/components/property-card'
import { geocodeCity, PropertyMapRef } from '@/components/property-map'
import { Property } from '@/types/property'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

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

export default function RentPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [viewportProperties, setViewportProperties] = useState<Property[]>([])
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    minPrice: 0,
    maxPrice: 10000,
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    minArea: 0,
    maxArea: 10000,
  })
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.006, 40.7128])
  const [mapZoom, setMapZoom] = useState(10)
  const mapRef = useRef<PropertyMapRef>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [properties, filters])

  const loadProperties = async () => {
    try {
      setLoading(true)
      const mockProperties = generateMockRentProperties()
      setProperties(mockProperties)
      setFilteredProperties(mockProperties)
      setViewportProperties(mockProperties)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...properties]

    // Filter by listing type (rent)
    filtered = filtered.filter((p) => p.listing_type === 'rent')

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
  }

  const handleCitySearch = async (city: string) => {
    if (!city) return

    const coordinates = await geocodeCity(city)
    if (coordinates) {
      setMapCenter(coordinates)
      setMapZoom(12)
      if (mapRef.current) {
        mapRef.current.flyToLocation(coordinates[0], coordinates[1], 12)
      }
    }
  }

  const handleViewportChange = (bounds: {
    ne: [number, number]
    sw: [number, number]
  }) => {
    const inViewport = filteredProperties.filter((property) => {
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
  }

  const handleSaveSearch = () => {
    alert('Search saved! (Feature coming soon)')
  }

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
        onFiltersChange={setFilters}
        onCitySearch={handleCitySearch}
        onSaveSearch={handleSaveSearch}
      />
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Column - Property Cards */}
        <div className="flex-1 overflow-y-auto border-r bg-background lg:w-2/3">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">
              Properties ({viewportProperties.length})
            </h2>
            {viewportProperties.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>No properties found in this area</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewportProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="h-[400px] flex-1 overflow-hidden lg:h-auto lg:w-1/3">
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

// Generate mock rent properties
function generateMockRentProperties(): Property[] {
  const cities = [
    { name: 'New York', lat: 40.7128, lng: -74.006 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.074 },
  ]

  const propertyTypes: Property['property_type'][] = [
    'house',
    'apartment',
    'condo',
    'townhouse',
  ]

  const properties: Property[] = []

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 4; i++) {
      const propertyType =
        propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const bedrooms = Math.floor(Math.random() * 3) + 1
      const bathrooms = Math.floor(Math.random() * 2) + 1
      const area = Math.floor(Math.random() * 2000) + 600
      const basePrice = (cityIndex + 1) * 500 + Math.random() * 2000

      properties.push({
        id: `rent-${city.name}-${i}-${Date.now()}`,
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} for Rent in ${city.name}`,
        description: `Spacious ${propertyType} available for rent in ${city.name}.`,
        price: Math.floor(basePrice),
        property_type: propertyType,
        listing_type: 'rent',
        bedrooms,
        bathrooms,
        area,
        address: `${Math.floor(Math.random() * 9999)} Oak Ave`,
        city: city.name,
        state: 'CA',
        zip_code: `${Math.floor(Math.random() * 90000) + 10000}`,
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        images: [
          `https://images.unsplash.com/photo-${1568605114967 + i}-a6c3738ba01d?w=800`,
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  })

  return properties
}

