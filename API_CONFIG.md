# API Configuration

To connect the frontend to the backend, create a `.env.local` file in the root directory and add the following:

```bash
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

The API client in `src/lib/api-client.ts` will automatically use this URL.
