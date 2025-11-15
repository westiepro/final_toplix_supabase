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
    // Load real data from Supabase
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: Load favorites, recently viewed, and saved searches from Supabase
      // For now, set empty arrays until these features are implemented
      setFavorites([])
      setRecentlyViewed([])
      setSavedSearches([])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setFavorites([])
      setRecentlyViewed([])
      setSavedSearches([])
    }
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



