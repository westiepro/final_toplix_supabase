'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyCard } from '@/components/property-card'
import { Property } from '@/types/property'
import { Heart, Clock, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function UserDashboard() {
  const [favorites, setFavorites] = useState<Property[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([])
  const [savedSearches, setSavedSearches] = useState<any[]>([])

  useEffect(() => {
    // Load mock data
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Mock favorites
    const mockFavorites = generateMockProperties().slice(0, 3)
    setFavorites(mockFavorites)

    // Mock recently viewed
    const mockRecent = generateMockProperties().slice(3, 6)
    setRecentlyViewed(mockRecent)

    // Mock saved searches
    setSavedSearches([
      {
        id: '1',
        name: 'NYC Apartments',
        filters: { city: 'New York', property_type: 'apartment' },
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'LA Houses',
        filters: { city: 'Los Angeles', property_type: 'house' },
        created_at: new Date().toISOString(),
      },
    ])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your favorites, recently viewed properties, and saved searches
        </p>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recently Viewed
          </TabsTrigger>
          <TabsTrigger value="searches" className="gap-2">
            <Search className="h-4 w-4" />
            Saved Searches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Properties</CardTitle>
              <CardDescription>
                Properties you've saved as favorites
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No favorite properties yet
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed</CardTitle>
              <CardDescription>
                Properties you've recently viewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyViewed.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recently viewed properties
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentlyViewed.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searches" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
              <CardDescription>
                Your saved search filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedSearches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved searches yet
                </p>
              ) : (
                <div className="space-y-4">
                  {savedSearches.map((search) => (
                    <Card key={search.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{search.name}</CardTitle>
                          <Badge variant="secondary">
                            {new Date(search.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(search.filters).map(([key, value]) => (
                            <Badge key={key} variant="outline">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generateMockProperties(): Property[] {
  return [
    {
      id: '1',
      title: 'Modern Apartment in NYC',
      description: 'Beautiful apartment with city views',
      price: 450000,
      property_type: 'apartment',
      listing_type: 'buy',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      address: '123 Main St',
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
      id: '2',
      title: 'Luxury House in LA',
      description: 'Spacious house with pool',
      price: 1200000,
      property_type: 'house',
      listing_type: 'buy',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90001',
      latitude: 34.0522,
      longitude: -118.2437,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Cozy Condo in Chicago',
      description: 'Perfect for first-time buyers',
      price: 280000,
      property_type: 'condo',
      listing_type: 'buy',
      bedrooms: 1,
      bathrooms: 1,
      area: 800,
      address: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      latitude: 41.8781,
      longitude: -87.6298,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Townhouse in Houston',
      description: 'Family-friendly townhouse',
      price: 350000,
      property_type: 'townhouse',
      listing_type: 'buy',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      address: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zip_code: '77001',
      latitude: 29.7604,
      longitude: -95.3698,
      images: ['https://images.unsplash.com/photo-1568605114967-a8130c7310c0?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Villa in Phoenix',
      description: 'Luxury villa with desert views',
      price: 850000,
      property_type: 'villa',
      listing_type: 'buy',
      bedrooms: 5,
      bathrooms: 4,
      area: 3500,
      address: '654 Desert Rd',
      city: 'Phoenix',
      state: 'AZ',
      zip_code: '85001',
      latitude: 33.4484,
      longitude: -112.074,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Studio Apartment in NYC',
      description: 'Affordable studio in Manhattan',
      price: 320000,
      property_type: 'apartment',
      listing_type: 'buy',
      bedrooms: 0,
      bathrooms: 1,
      area: 500,
      address: '987 Broadway',
      city: 'New York',
      state: 'NY',
      zip_code: '10002',
      latitude: 40.7180,
      longitude: -73.9900,
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}


