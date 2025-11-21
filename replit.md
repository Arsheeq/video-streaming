# NuBinix - Video Streaming Platform

## Overview
NuBinix is a modern video streaming platform built with React, Express, and PostgreSQL. The application allows users to upload, transcode, and stream videos using AWS services (S3, MediaConvert, CloudFront) with adaptive bitrate streaming.

## Project Status
- **Status**: ✅ Fully configured and running on Replit
- **Last Updated**: November 21, 2025
- **Setup Completed**: Database, AWS credentials, workflow configuration, deployment settings, bug fixes

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.1.9
- **Styling**: TailwindCSS 4.1.14 with custom dark theme
- **UI Components**: Radix UI components with shadcn/ui
- **Routing**: Wouter 3.3.5
- **State Management**: React Context API
- **Video Player**: HLS.js for adaptive streaming

### Backend
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express 4.21.2
- **Database**: PostgreSQL with Drizzle ORM
- **AWS Services**: S3, MediaConvert, CloudFront
- **Dev Server**: tsx for TypeScript execution

### Database
- **ORM**: Drizzle ORM 0.39.1
- **Driver**: node-postgres (pg)
- **Tables**: users, videos, aws_config

## Project Architecture

### Directory Structure
```
.
├── client/               # Frontend React application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       │   ├── home/    # Homepage components
│       │   ├── layout/  # Layout components (Navbar, AdminLayout)
│       │   ├── ui/      # Reusable UI components (shadcn/ui)
│       │   └── video/   # Video player component
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utilities and data
│       ├── pages/       # Page components
│       │   └── admin/   # Admin panel pages
│       ├── App.tsx      # Main app component with routing
│       └── main.tsx     # Entry point
├── server/              # Backend Express application
│   ├── aws.ts          # AWS service integration
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database storage layer
│   └── vite.ts         # Vite integration for dev mode
├── shared/              # Shared code between client/server
│   └── schema.ts       # Database schema and types
└── migrations/          # Database migrations

```

## Recent Changes (November 21, 2025)

### Initial Setup & Configuration
1. **Dependencies Installation**: Installed all npm packages successfully
2. **Database Setup**:
   - PostgreSQL database auto-configured by Replit
   - Ran `npm run db:push` to create schema (users, videos, aws_config tables)
   - Database connection: Uses standard `pg` driver with Drizzle ORM

3. **AWS Credentials Configuration**:
   - Configured AWS secrets for S3, CloudFront, and MediaConvert
   - Secrets configured: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_CLOUDFRONT_DOMAIN`
   - AWS service initializes automatically from environment variables
   - CloudFront domain: `https://d2mcz61iafdmct.cloudfront.net`

4. **Workflow Configuration**:
   - Single workflow: "Start application"
   - Command: `npm run dev`
   - Port: 5000 (serves both API and frontend)
   - Output: webview for live preview

5. **Deployment Configuration**:
   - Target: autoscale (stateless web application)
   - Build: `npm run build` (compiles Vite frontend and bundles server)
   - Run: `node dist/index.js` (production server)

### Bug Fixes
- **Fixed Nested Link Elements**: Removed nested `<a>` tags in `AdminLayout.tsx` (lines 26-52)
  - Issue: wouter's `Link` component already renders an `<a>` tag
  - Fix: Applied className directly to `Link` component instead of wrapping with `<a>`
  - Result: Eliminated React hydration errors

## Key Features

### User Features
- Browse video library with categorized content
- Watch videos with adaptive HLS streaming
- Responsive video player with quality selection
- Dark-themed Netflix-style UI

### Admin Features
- Dashboard with platform statistics
- Media library management
- Video upload with AWS S3 integration
- Video transcoding using AWS MediaConvert
- AWS configuration management
- CloudFront CDN integration

## Development

### Running Locally
The application runs automatically via the configured workflow. The Express server:
1. Serves API routes at `/api/*`
2. Integrates Vite dev server in development mode
3. Serves static frontend in production mode

### Environment Variables

**Auto-configured by Replit:**
- `DATABASE_URL`: PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`: Database connection details

**Required for video streaming (configured in Secrets):**
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET_NAME`: S3 bucket for video storage
- `AWS_CLOUDFRONT_DOMAIN`: CloudFront distribution domain

**Application defaults:**
- `PORT`: Server port (defaults to 5000)
- `NODE_ENV`: Environment mode (development/production)

### API Endpoints
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video details
- `POST /api/videos` - Create new video entry
- `PATCH /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/upload-url` - Get presigned S3 upload URL
- `POST /api/videos/:id/transcode` - Start video transcoding
- `GET /api/aws-config` - Get AWS configuration
- `POST /api/aws-config` - Update AWS configuration

## Configuration Notes

### Vite Configuration
- Host: `0.0.0.0` (required for Replit proxy)
- AllowedHosts: `true` (allows iframe preview)
- Port: 5000 (matches backend)

### Express Server
- Single port setup (5000) for both API and frontend
- Vite middleware only in development
- Static file serving in production

## Deployment

The application is configured for Replit Autoscale deployment:
- Build step compiles frontend and backend
- Production server runs on single port (5000)
- Frontend assets served from `dist/public`
- Backend API bundled in `dist/index.js`

## AWS S3 Bucket Configuration

For video uploads to work, your S3 bucket **must** have CORS configured:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**To configure CORS on your S3 bucket:**
1. Go to AWS S3 Console
2. Select your bucket
3. Go to Permissions → CORS configuration
4. Add the above JSON configuration
5. Save changes

## Video Upload Flow

1. **Upload to S3**: Videos are uploaded directly to `inputs/<videoId>/<filename>` in your S3 bucket
2. **Transcoding**: AWS MediaConvert transcodes videos to multiple bitrates (requires MediaConvert configuration)
3. **Adaptive Streaming**: Transcoded videos generate HLS playlists in `assets/<videoId>/HLS/` folder
4. **CloudFront Delivery**: Videos are served via CloudFront CDN at:
   ```
   https://d2mcz61iafdmct.cloudfront.net/assets/<videoId>/HLS/<filename>.m3u8
   ```

## Next Steps

1. **Configure S3 Bucket CORS**: Add the CORS configuration above to enable uploads
2. **Upload Videos**: Use `/admin/media` to upload and manage video content
3. **Set up MediaConvert**: Configure AWS MediaConvert for automatic transcoding
4. **Add Authentication**: Implement user authentication (schema includes users table)
5. **Customize Branding**: Modify `client/src/index.css` and update logos
