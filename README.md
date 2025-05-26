# InnerCalm Frontend

Modern, responsive React frontend for the InnerCalm AI-powered emotional healing companion.

## Features

- **Modern UI/UX**: Clean, beautiful interface built with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Chat**: Streaming AI responses with typing indicators
- **Emotion Tracking**: Visual emotion analysis and progress tracking
- **Personalized Recommendations**: Interactive recommendation cards
- **Progress Analytics**: Comprehensive emotional journey visualization
- **Secure Authentication**: JWT-based user authentication

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Axios**: HTTP client for API communication
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **Vite**: Fast build tool and development server

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd innercalm-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Production Deployment on Vercel

### Prerequisites
- Vercel account
- Backend API deployed and accessible
- Node.js 18+ for local development

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Set environment variables (if needed)

3. **Environment Variables**
   Create `.env.production` or set in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-api.vercel.app
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── chat/           # Chat-related components
│   ├── auth/           # Authentication components
│   └── analytics/      # Analytics components
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Chat.tsx        # Chat interface
│   ├── Analytics.tsx   # Analytics dashboard
│   └── Recommendations.tsx # Recommendations page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   ├── api.ts          # API client configuration
│   ├── auth.ts         # Authentication services
│   ├── chat.ts         # Chat services
│   └── analytics.ts    # Analytics services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## Key Components

### Authentication
- **AuthContext**: Global authentication state management
- **ProtectedRoute**: Route protection for authenticated users
- **Login/Register**: User authentication forms

### Chat Interface
- **ChatInterface**: Main chat component with streaming responses
- **MessageBubble**: Individual message display
- **TypingIndicator**: Shows when AI is responding

### Analytics Dashboard
- **EmotionChart**: Emotion trends visualization
- **ProgressMetrics**: Progress tracking cards
- **InsightCards**: Personalized insights

### Recommendations
- **RecommendationCard**: Interactive recommendation display
- **RecommendationModal**: Detailed recommendation view

## Styling

The application uses Tailwind CSS for styling with:
- **Custom color palette**: Calming blues and greens for emotional wellness
- **Responsive design**: Mobile-first approach
- **Dark mode support**: Automatic theme switching
- **Smooth animations**: Framer Motion for enhanced UX

## API Integration

The frontend communicates with the backend API using:
- **Axios**: HTTP client with interceptors for authentication
- **React Query**: Caching, background updates, and optimistic updates
- **Error handling**: Comprehensive error boundaries and user feedback

## Build and Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Preview production build locally
```

### Linting and Type Checking
```bash
npm run lint     # ESLint
npm run type-check  # TypeScript checking
```

## Environment Variables

Create `.env.local` for local development:
```
VITE_API_BASE_URL=http://localhost:8000
```

For production, set in Vercel dashboard or `.env.production`:
```
VITE_API_BASE_URL=https://your-backend-api.vercel.app
```

## Performance Optimizations

- **Code splitting**: Automatic route-based code splitting
- **Image optimization**: Optimized images and lazy loading
- **Bundle analysis**: Webpack bundle analyzer for optimization
- **Caching**: React Query for intelligent data caching
- **Tree shaking**: Unused code elimination

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
