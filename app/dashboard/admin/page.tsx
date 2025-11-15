'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { Eye, Building2, Home, List, Users, Euro, BarChart3 } from 'lucide-react'
import { Property } from '@/types/property'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    liveViews: 0,
    totalCompanies: 0,
    totalProperties: 0,
    activeListings: 0,
    totalUsers: 0,
    averageSalePrice: 0,
  })
  const [chartHeights, setChartHeights] = useState<number[]>([])

  useEffect(() => {
    // Load real data from Supabase
    const loadStats = async () => {
      try {
        const { fetchAllProperties } = await import('@/lib/properties')
        const allProperties = await fetchAllProperties()
        const buyProperties = allProperties.filter(p => p.listing_type === 'buy')
        
        const buyPrices = buyProperties.map(p => p.price)
        const avgPrice = buyPrices.length > 0 
          ? buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length 
          : 0

        setStats({
          liveViews: 0,
          totalCompanies: 1,
          totalProperties: allProperties.length,
          activeListings: allProperties.filter(p => {
            const prop = p as any
            return prop.status === 'active' || !prop.status
          }).length,
          totalUsers: 4,
          averageSalePrice: Math.round(avgPrice),
        })

        // Generate chart heights on client side only
        setChartHeights([1, 2, 3, 4, 5].map(() => 80 + Math.random() * 20))
      } catch (error) {
        console.error('Error loading stats:', error)
        // Set default stats if error
        setStats({
          liveViews: 0,
          totalCompanies: 0,
          totalProperties: 0,
          activeListings: 0,
          totalUsers: 0,
          averageSalePrice: 0,
        })
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Admin Panel" />
      
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your property management system</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/properties">View All Properties</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="text-2xl font-bold">{stats.liveViews}</div>
              </div>
              <p className="text-xs text-muted-foreground">Active users on site</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Real estate companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">All properties in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale Price</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.averageSalePrice.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Properties for sale</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <CardTitle>Properties by Type</CardTitle>
              </div>
              <CardDescription>Distribution of property types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center">
                <div className="h-48 w-48 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-muted-foreground">Mixed Types</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Properties by City</CardTitle>
              </div>
              <CardDescription>Top 5 cities with most properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end justify-center gap-4">
                {chartHeights.length > 0 ? (
                  chartHeights.map((height, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 bg-primary rounded-t" style={{ height: `${height}%` }} />
                      <span className="text-xs text-muted-foreground">City {i + 1}</span>
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 bg-primary rounded-t" style={{ height: '80%' }} />
                      <span className="text-xs text-muted-foreground">City {i}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

