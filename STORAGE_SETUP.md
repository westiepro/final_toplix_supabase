# Supabase Storage Setup for Property Images

This guide will help you set up Supabase Storage to enable image uploads for properties.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `property-images`
5. Check **Public bucket** (this allows public read access to images)
6. Click **Create bucket**

## Step 2: Set Up Storage Policies

Run the SQL in `supabase-storage-setup.sql` in your Supabase SQL Editor, OR manually set up policies:

### Option A: Run SQL (Recommended)

1. Open `supabase-storage-setup.sql` file
2. Copy all the SQL code
3. Go to Supabase Dashboard → **SQL Editor**
4. Paste and click **Run**

### Option B: Manual Setup via Dashboard

1. Go to **Storage** → **Policies** → `property-images` bucket
2. Create the following policies:

#### Public Read Access
- Policy name: `Public Access`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'property-images'`

#### Public Upload (for development)
- Policy name: `Public can upload images`
- Allowed operation: `INSERT`
- Target roles: `public`
- Policy definition: `bucket_id = 'property-images'`

#### Public Update (for development)
- Policy name: `Public can update images`
- Allowed operation: `UPDATE`
- Target roles: `public`
- Policy definition: `bucket_id = 'property-images'`

#### Public Delete (for development)
- Policy name: `Public can delete images`
- Allowed operation: `DELETE`
- Target roles: `public`
- Policy definition: `bucket_id = 'property-images'`

## Step 3: Test Image Upload

1. Go to Admin Panel → All Properties
2. Click **Add Property**
3. Scroll down to the **Property Images** section
4. Click the upload area or drag and drop images
5. Images should upload and appear in the grid
6. The first image will be marked as "Main" (primary image)

## Features

- **Multiple Images**: Upload up to 10 images per property
- **Drag & Drop**: Drag images directly onto the upload area
- **Image Preview**: See thumbnails of all uploaded images
- **Remove Images**: Click the X button on any image to remove it
- **Main Image**: The first image is automatically set as the main/primary image
- **File Validation**: Only image files (PNG, JPG, GIF) up to 5MB each

## Troubleshooting

### Images not uploading?
- Check that the `property-images` bucket exists in Supabase Storage
- Verify storage policies are set up correctly
- Check browser console for error messages
- Ensure Supabase environment variables are configured

### Images not displaying?
- Verify the bucket is set to **Public**
- Check that the storage policies allow SELECT operations
- Verify image URLs are being saved correctly in the database

### Upload errors?
- Check file size (max 5MB per image)
- Ensure file is a valid image format (PNG, JPG, GIF)
- Check browser console for detailed error messages

## Production Considerations

For production, you should:
1. Remove public upload/update/delete policies
2. Only allow authenticated users to upload images
3. Add image optimization/compression
4. Consider using a CDN for faster image delivery
5. Implement image size limits and validation on the server side

