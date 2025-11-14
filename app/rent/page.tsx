'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { PropertyFilters, FilterState } from '@/components/property-filters'
import { PropertyCard } from '@/components/property-card'
import { geocodeCity, PropertyMapRef } from '@/components/property-map'
import { Property } from '@/types/property'
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([-7.9322, 37.0194]) // Faro, Algarve
  const [mapZoom, setMapZoom] = useState(10)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<PropertyMapRef>(null)

  const applyFilters = useCallback(() => {
    let filtered = [...properties]

    // Filter by listing type (rent only)
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
  }, [properties, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

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

// Generate mock rent properties
function generateMockRentProperties(): Property[] {
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
    'house',
    'apartment',
    'condo',
    'townhouse',
    'villa',
  ]

  const properties: Property[] = []

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 5; i++) {
      const propertyType =
        propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
      const bedrooms = Math.floor(Math.random() * 3) + 1
      const bathrooms = Math.floor(Math.random() * 2) + 1
      const area = Math.floor(Math.random() * 2000) + 600
      const basePrice = (cityIndex + 1) * 500 + Math.random() * 1500

      properties.push({
        id: `rent-${city.name}-${i}`,
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} for Rent in ${city.name}`,
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
