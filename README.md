# Chat Testing - RAG Chat Application

A modern, production-ready chat application with RAG (Retrieval-Augmented Generation) capabilities, built with Next.js 15 and integrating with the dcktrp-rag backend.

## ✨ Features

- 🔐 **Authentication System**
  - JWT-based authentication
  - Secure login/registration
  - Protected routes
  - Admin token support for user registration

- 💬 **Real-time Chat**
  - Streaming AI responses (NDJSON)
  - Conversation management
  - Message history persistence
  - Auto-scrolling chat interface

- 🎛️ **Advanced RAG Configuration**
  - Multiple query modes (Global, Mix, Local, Hybrid, Naive, Bypass)
  - Configurable retrieval parameters (local_k, global_k)
  - Division-based document filtering
  - Access level filtering
  - Conversation history context

- 🎨 **Modern UI/UX**
  - Beautiful, responsive design
  - Dark mode support
  - Smooth animations
  - Toast notifications
  - Professional sidebar with conversation list

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** React Hooks + Context API
- **HTTP Client:** Axios
- **Date Formatting:** date-fns
- **Notifications:** Sonner

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Running instance of [dcktrp-rag](https://github.com/your-repo/dcktrp-rag) backend

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dcktrp-client
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file**
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://your-backend-url:port
   # Example: http://localhost:8012
   # Or: http://34.50.116.32:9621
   ```

## 🏃 Running the Application

### Development Mode

```bash
pnpm run dev
# or
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm run build
pnpm run start
# or
npm run build
npm run start
```

## 📁 Project Structure

```
dcktrp-client/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API proxy routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── users/           # User management endpoints
│   │   ├── conversations/   # Conversation endpoints
│   │   └── query/           # RAG query endpoints
│   ├── chat/                # Main chat page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── chat/               # Chat-specific components
│   │   ├── ChatSettingsPanel.tsx
│   │   ├── ConversationSidebar.tsx
│   │   ├── Message.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   ├── ui/                 # shadcn/ui components
│   └── ProtectedRoute.tsx  # Route protection HOC
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Utilities and helpers
│   ├── api/               # API client modules
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── conversations.ts
│   │   └── users.ts
│   ├── api-client.ts      # Axios configuration
│   ├── constants.ts       # App constants
│   └── utils/
│       └── storage.ts     # localStorage utilities
├── types/                 # TypeScript type definitions
│   └── index.ts
└── public/                # Static assets
```

## 🔧 Configuration

### API Proxy

The application uses Next.js API routes to proxy requests to the backend, avoiding CORS issues:

- `/api/auth/login` → Backend `/login`
- `/api/users/me` → Backend `/users/me`
- `/api/conversations/` → Backend `/conversations/`
- `/api/query/stream` → Backend `/query/stream`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8012` |

### Chat Settings

Default RAG configuration (can be changed via Settings panel):

```typescript
{
  mode: 'global',              // Query mode
  local_k: 5,                  // Local search results
  global_k: 10,                // Global search results
  include_references: true,    // Include document references
  division_filter: [],         // Document division filters
  access_filter: ['external'], // Access level filters
}
```

## 🔐 Authentication Flow

1. User enters credentials on `/login`
2. Client sends POST to `/api/auth/login`
3. Next.js proxy forwards to backend `/login`
4. Backend validates and returns JWT token
5. Token stored in localStorage
6. Token automatically included in subsequent requests via Axios interceptor
7. Protected routes check authentication status via `ProtectedRoute` component

### User Registration

Registration requires an **admin bearer token** for development:

1. Go to `/register`
2. Fill in user details
3. Enter admin bearer token
4. Token is sent as `Authorization: Bearer <token>` header
5. Backend validates admin privileges and creates user

## 📱 Key Features Explained

### Conversation Management

- Create new conversations with auto-generated titles
- View conversation history in sidebar
- Delete conversations
- Automatic title generation from first message

### Message Streaming

- Real-time streaming responses using NDJSON format
- Chunk-by-chunk rendering
- Smooth auto-scroll during streaming
- Error handling with retry support

### Settings Panel

Access via the ⚙️ icon in chat header:

- **Query Mode:** Select retrieval strategy
- **Local K:** Number of document chunks to retrieve
- **Global K:** Number of documents to retrieve
- **Include References:** Toggle document citations
- **Division Filter:** Filter by document divisions
- Reset to defaults button

### Division Filters

Available divisions:
- Umum
- Pemanfaatan Ruang
- Pengendalian Ruang
- Pertanahan dan Informasi Geospasial
- Bangunan Gedung
- Bina Konstruksi
- Gedung Pemerintah Daerah

## 🐛 Troubleshooting

### "Network Error" on Login

1. Verify backend is running
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env`
3. Restart Next.js dev server after changing `.env`
4. Check browser console for CORS errors

### Messages Not Streaming

1. Verify `/api/query/stream` endpoint is accessible
2. Check browser Network tab for request details
3. Ensure backend streaming endpoint is working

### Authentication Issues

1. Clear localStorage: `localStorage.clear()`
2. Check token validity
3. Verify backend authentication endpoint

### Build Errors

```bash
# Clean and rebuild
rm -rf .next
pnpm install
pnpm run build
```

## 🔄 API Integration

### Backend Requirements

The application expects the following backend endpoints:

- `POST /login` - User authentication
- `GET /users/me` - Get current user
- `POST /users/` - Create user (requires admin token)
- `GET /conversations/` - List conversations
- `POST /conversations/` - Create conversation
- `GET /conversations/{id}/messages` - Get messages
- `POST /conversations/{id}/messages` - Create message
- `POST /query/stream` - Stream RAG responses

### Query Request Format

```typescript
{
  query: string;
  mode: 'global' | 'mix' | 'local' | 'hybrid' | 'naive' | 'bypass';
  stream: true;
  include_references: boolean;
  local_k: number;
  global_k: number;
  division_filter?: string[];
  access_filter?: string[];
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

## 📝 Development Notes

- Always restart Next.js dev server after changing `.env`
- API routes are server-side only (not exposed to client)
- Tokens are stored in localStorage (not cookies)
- All API requests include JWT via Axios interceptor
- 401 responses trigger automatic logout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend: [dcktrp-rag](https://github.com/your-repo/dcktrp-rag)
