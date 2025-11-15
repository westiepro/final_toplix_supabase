import { supabase } from './supabase'
import { Property } from '@/types/property'

export interface PropertyWithCompany extends Property {
  company_name?: string
  status?: 'active' | 'inactive' | 'pending'
}

/**
 * Fetch all properties from Supabase
 */
export async function fetchAllProperties(): Promise<Property[]> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Returning empty array.')
      return []
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching all properties')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Full error:', JSON.stringify(error, null, 2))
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchAllProperties:', error)
    return []
  }
}

/**
 * Fetch properties by listing type (buy or rent)
 */
export async function fetchPropertiesByType(listingType: 'buy' | 'rent'): Promise<Property[]> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Using mock data.')
      return []
    }

    // Try to fetch with status filter first, fallback without if it fails
    let query = supabase
      .from('properties')
      .select('*')
      .eq('listing_type', listingType)
      .order('created_at', { ascending: false })
    
    // Only filter by status if the column exists (some tables might not have it yet)
    // We'll filter in memory if needed
    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching properties by type:', listingType)
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('Full error:', JSON.stringify(error, null, 2))
      
      // Common error messages
      if (error.code === 'PGRST116') {
        console.error('❌ TABLE NOT FOUND: The properties table does not exist.')
        console.error('💡 SOLUTION: Run the SQL schema from supabase-schema.sql in your Supabase SQL Editor')
      } else if (error.code === '42501') {
        console.error('🔒 RLS POLICY ERROR: Row Level Security is blocking this query.')
        console.error('💡 SOLUTION: Make sure RLS policies allow SELECT operations')
        console.error('   Run this SQL in Supabase:')
        console.error('   CREATE POLICY "Allow public read access" ON properties FOR SELECT TO public USING (true);')
      } else if (error.code === '42703') {
        console.error('❌ COLUMN NOT FOUND: A column in the query does not exist.')
        console.error('💡 SOLUTION: Make sure your table schema matches supabase-schema.sql')
      }
      
      // Don't throw, return empty array to allow fallback
      return []
    }

    // Filter by status in memory if the column exists
    const filteredData = data?.filter((p: any) => {
      // If status column doesn't exist or is null, include it
      if (!('status' in p) || p.status === null || p.status === undefined) {
        return true
      }
      // Otherwise, only include active properties
      return p.status === 'active'
    }) || []

    return filteredData
  } catch (error) {
    console.error('Error in fetchPropertiesByType:', error)
    return []
  }
}

/**
 * Fetch a single property by ID
 */
export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Cannot fetch property.')
      return null
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchPropertyById:', error)
    return null
  }
}

/**
 * Create a new property
 */
export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Cannot create property.')
      return null
    }

    // Prepare the property data, ensuring all required fields are present
    // Convert numeric values to proper types for Supabase
    const propertyData: any = {
      title: String(property.title || '').trim(),
      description: String(property.description || '').trim(),
      price: parseFloat(String(property.price || 0)) || 0,
      property_type: String(property.property_type || 'house'),
      listing_type: String(property.listing_type || 'buy'),
      bedrooms: parseInt(String(property.bedrooms || 0), 10) || 0,
      bathrooms: parseInt(String(property.bathrooms || 0), 10) || 0,
      area: parseInt(String(property.area || 0), 10) || 0,
      address: String(property.address || '').trim(),
      city: String(property.city || '').trim(),
      state: String(property.state || '').trim(),
      zip_code: String(property.zip_code || '').trim(),
      latitude: parseFloat(String(property.latitude || 0)) || 0,
      longitude: parseFloat(String(property.longitude || 0)) || 0,
      images: Array.isArray(property.images) ? property.images : [],
      // Only include status if the column exists in the database
      // Uncomment the line below after adding the status column to your Supabase table
      // status: 'active',
    }

    // Additional validation for coordinates
    if (propertyData.latitude === 0 && propertyData.longitude === 0) {
      console.warn('Warning: Both latitude and longitude are 0. This might be invalid.')
    }

    // Validate required fields
    if (!propertyData.title || !propertyData.city || !propertyData.address) {
      console.error('Missing required fields:', {
        hasTitle: !!propertyData.title,
        hasCity: !!propertyData.city,
        hasAddress: !!propertyData.address,
      })
      return null
    }

    console.log('Attempting to create property with data:', propertyData)
    
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) {
      console.error('❌ SUPABASE ERROR:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      console.error('Property data being sent:', JSON.stringify(propertyData, null, 2))
      console.error('Property data types:', {
        title: typeof propertyData.title,
        price: typeof propertyData.price,
        latitude: typeof propertyData.latitude,
        longitude: typeof propertyData.longitude,
        bedrooms: typeof propertyData.bedrooms,
        bathrooms: typeof propertyData.bathrooms,
        area: typeof propertyData.area,
        images: Array.isArray(propertyData.images),
      })
      
      // Common error messages
      if (error.code === '42501') {
        console.error('🔒 RLS POLICY ERROR: Row Level Security is blocking this operation.')
        console.error('💡 SOLUTION: Run the SQL policies from supabase-schema.sql in your Supabase SQL Editor')
      } else if (error.code === '23502') {
        console.error('❌ NULL CONSTRAINT ERROR: A required field is missing or null.')
      } else if (error.code === '23505') {
        console.error('❌ UNIQUE CONSTRAINT ERROR: A unique constraint was violated.')
      } else if (error.code === 'PGRST116') {
        console.error('❌ NOT FOUND ERROR: The table or column does not exist.')
        console.error('💡 SOLUTION: Make sure you have run the SQL schema in Supabase')
      } else if (error.code === 'PGRST204') {
        console.error('❌ COLUMN NOT FOUND ERROR: A column in the insert/update does not exist in the database.')
        console.error('💡 SOLUTION: The status column is missing. Either:')
        console.error('   1. Remove status from your form (already done in code), or')
        console.error('   2. Add the status column by running add-status-column.sql in your Supabase SQL Editor')
      }
      
      return null
    }
    
    console.log('✅ Property created successfully:', data)

    return data
  } catch (error) {
    console.error('Error in createProperty:', error)
    return null
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(
  id: string,
  updates: Partial<Omit<Property, 'id' | 'created_at'>>
): Promise<Property | null> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Cannot update property.')
      return null
    }

    // Prepare update data with proper type conversions
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Convert numeric fields if they exist
    if (updates.price !== undefined) {
      updateData.price = parseFloat(String(updates.price)) || 0
    }
    if (updates.bedrooms !== undefined) {
      updateData.bedrooms = parseInt(String(updates.bedrooms), 10) || 0
    }
    if (updates.bathrooms !== undefined) {
      updateData.bathrooms = parseInt(String(updates.bathrooms), 10) || 0
    }
    if (updates.area !== undefined) {
      updateData.area = parseInt(String(updates.area), 10) || 0
    }
    if (updates.latitude !== undefined) {
      updateData.latitude = parseFloat(String(updates.latitude)) || 0
    }
    if (updates.longitude !== undefined) {
      updateData.longitude = parseFloat(String(updates.longitude)) || 0
    }

    // Ensure images is an array
    if (updates.images !== undefined) {
      updateData.images = Array.isArray(updates.images) ? updates.images : []
    }

    // Remove status from update if column doesn't exist in database
    // Uncomment the line below after adding the status column to your Supabase table
    // if (updates.status !== undefined) {
    //   updateData.status = updates.status
    // }
    if ('status' in updateData) {
      delete updateData.status
    }

    // Ensure string fields are trimmed
    if (updateData.title) updateData.title = String(updateData.title).trim()
    if (updateData.description) updateData.description = String(updateData.description).trim()
    if (updateData.address) updateData.address = String(updateData.address).trim()
    if (updateData.city) updateData.city = String(updateData.city).trim()
    if (updateData.zip_code) updateData.zip_code = String(updateData.zip_code).trim()
    if (updateData.state) updateData.state = String(updateData.state).trim()

    console.log('Updating property with data:', updateData)
    console.log('Property ID:', id, 'Type:', typeof id)

    // Check if ID is a valid UUID format (Supabase uses UUIDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error('❌ Invalid property ID format. Expected UUID, got:', id)
      console.error('💡 This property appears to be from mock data. Please create a new property or use a property from the database.')
      return null
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating property:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      console.error('Update data:', JSON.stringify(updateData, null, 2))
      console.error('Property ID:', id)
      
      // Common error messages
      if (error.code === 'PGRST116') {
        console.error('❌ PROPERTY NOT FOUND: The property with this ID does not exist in the database.')
        console.error('💡 This might be a mock property. Try creating a new property instead.')
      } else if (error.code === '42501') {
        console.error('🔒 RLS POLICY ERROR: Row Level Security is blocking this update.')
        console.error('💡 SOLUTION: Make sure update policies are set up in Supabase')
      } else if (error.code === '23502') {
        console.error('❌ NULL CONSTRAINT ERROR: A required field is missing or null.')
      }
      
      return null
    }

    console.log('✅ Property updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updateProperty:', error)
    return null
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting property:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteProperty:', error)
    return false
  }
}

/**
 * Fetch properties with company information (for admin panel)
 */
export async function fetchPropertiesWithCompany(): Promise<PropertyWithCompany[]> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Returning empty array.')
      return []
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching properties with company:', error)
      return []
    }

    // Map the data to include company_name and status
    return (data || []).map((property) => ({
      ...property,
      company_name: property.company_name || 'N/A',
      status: property.status || 'active',
    }))
  } catch (error) {
    console.error('Error in fetchPropertiesWithCompany:', error)
    return []
  }
}

