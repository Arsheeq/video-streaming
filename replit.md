# NuBinix - Video Streaming Platform

## Overview
NuBinix is a modern video streaming platform built with React, Express, and PostgreSQL. The application allows users to upload, transcode, and stream videos using AWS services (S3, MediaConvert, CloudFront).

## Project Status
- **Status**: Imported from GitHub and successfully configured for Replit
- **Last Updated**: November 21, 2025
- **Setup Completed**: Database migrations, workflow configuration, deployment settings

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

### Database Setup
- Configured PostgreSQL database connection
- Ran Drizzle migrations to create tables (users, videos, aws_config)
- Modified `server/storage.ts` to use standard `pg` driver instead of `@neondatabase/serverless`
  - Reason: Replit's local PostgreSQL doesn't support WebSocket connections required by Neon serverless
  - Changed import from `drizzle-orm/neon-serverless` to `drizzle-orm/node-postgres`
  - Fixed ESM import for `pg` package (using default export)

### Workflow Configuration
- Configured single workflow: "Start application"
- Command: `npm run dev`
- Port: 5000 (serves both API and frontend via Express + Vite in dev mode)
- Output: webview

### Deployment Configuration
- Target: autoscale (stateless web application)
- Build: `npm run build` (compiles Vite frontend and bundles server)
- Run: `node dist/index.js` (production server)

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
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `PORT`: Server port (defaults to 5000)
- `NODE_ENV`: Environment mode (development/production)

Optional AWS environment variables (configured via admin panel):
- AWS credentials stored in database (aws_config table)

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

## Next Steps for Users

1. **Configure AWS Credentials**: Visit `/admin/settings` to configure S3, MediaConvert, and CloudFront
2. **Upload Videos**: Use `/admin/media` to upload and manage video content
3. **Customize Theme**: Modify `client/src/index.css` for branding
4. **Add Authentication**: Implement user authentication (schema already includes users table)
