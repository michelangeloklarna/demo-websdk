# Development Notes

## Environment Variables

This project uses environment variables for configuration. Create a `.env.local` file in the root directory for local development.

### Available Variables

```bash
# Klarna SDK Configuration
NEXT_PUBLIC_KLARNA_CLIENT_ID=your_client_id_here

# Development configuration (optional)
NEXT_PUBLIC_ENABLE_DEBUG_FEATURES=false
```

## Local Development

Standard Next.js development workflow is supported. Some configuration options may be available in development environments.

## Production Deployment

When deploying to production:
- Ensure `NODE_ENV=production` 
- Configure appropriate environment variables
- Features will be automatically optimized for production 
