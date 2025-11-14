export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'villa'
export type ListingType = 'buy' | 'rent'

export interface Property {
  id: string
  title: string
  description: string
  price: number
  property_type: PropertyType
  listing_type: ListingType
  bedrooms: number
  bathrooms: number
  area: number // in square feet
  address: string
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  images: string[]
  agent_id?: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  filters: {
    city?: string
    min_price?: number
    max_price?: number
    property_type?: PropertyType[]
    bedrooms?: number
    bathrooms?: number
    min_area?: number
    max_area?: number
    listing_type: ListingType
  }
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
}

export interface RecentlyViewed {
  id: string
  user_id: string
  property_id: string
  viewed_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'agent' | 'admin'
  created_at: string
}

export interface Company {
  id: string
  name: string
  description: string
  logo_url?: string
  website?: string
  created_at: string
}


