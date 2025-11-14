'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Phone,
  Mail,
  Share2
} from 'lucide-react'
import { Property } from '@/types/property'

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const propertyId = typeof params.id === 'string' ? params.id : params.id?.[0] || ''

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const buyProperties = generateMockProperties()
      const rentProperties = generateMockRentProperties()
      const allProperties = [...buyProperties, ...rentProperties]
      const foundProperty = allProperties.find((p) => p.id === propertyId)
      
      if (foundProperty) {
        setProperty(foundProperty)
      } else {
        router.push('/buy')
      }
    } catch (error) {
      console.error('Error loading property:', error)
      router.push('/buy')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Property Not Found</h1>
          <Button asChild>
            <Link href="/buy">Back to Listings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-muted sm:h-[500px]">
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}
              </div>
              
              {property.images && property.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {property.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-20 overflow-hidden rounded-md bg-muted sm:h-24"
                    >
                      <Image
                        src={image}
                        alt={`${property.title} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">{property.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {property.property_type}
                  </Badge>
                </div>

                <div className="mb-6 flex flex-wrap gap-6 border-b pb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.bedrooms}</span>
                    <span className="text-muted-foreground">Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.bathrooms}</span>
                    <span className="text-muted-foreground">Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.area.toLocaleString()}</span>
                    <span className="text-muted-foreground">sqft</span>
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-semibold">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold">Property Details</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-semibold capitalize">{property.property_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Listing Type</p>
                    <p className="font-semibold capitalize">{property.listing_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-semibold">{property.area.toLocaleString()} sqft</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{property.city}, {property.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-primary">
                    €{property.price.toLocaleString()}
                  </div>
                  {property.listing_type === 'rent' && (
                    <p className="text-muted-foreground">per month</p>
                  )}
                </div>

                <div className="mb-6 space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Agent
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Property
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="mb-4 font-semibold">Property Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property ID</span>
                      <span className="font-medium">{property.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listed</span>
                      <span className="font-medium">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(property.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate mock properties
function generateMockProperties(): Property[] {
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
      const bedrooms = Math.floor(Math.random() * 4) + 1
      const bathrooms = Math.floor(Math.random() * 3) + 1
      const area = Math.floor(Math.random() * 3000) + 800
      const basePrice = (cityIndex + 1) * 100000 + Math.random() * 400000

      properties.push({
        id: `buy-${city.name}-${i}`,
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${city.name}`,
        description: `Beautiful ${propertyType} with modern amenities in the heart of ${city.name}, Algarve. This stunning property features ${bedrooms} bedrooms and ${bathrooms} bathrooms, perfect for families or professionals. Located in a prime area with easy access to beaches, shopping, dining, and entertainment.`,
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
        description: `Beautiful ${propertyType} available for rent with modern amenities in the heart of ${city.name}, Algarve.`,
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
