# 🎌 Anime Blog

A modern, full-stack blog application with anime-inspired design, featuring user authentication, content management, and a beautiful responsive UI.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Secure API endpoints with middleware

### 📝 Blog Management
- Create, read, update, delete blog posts
- Rich text editor with markdown support
- Categories and tags system
- Featured images and anime-related metadata
- Comment system with real-time interactions
- Like/unlike functionality
- View counting

### 🎨 Modern UI/UX
- Anime-inspired design with custom color palette
- Dark/light theme support
- Responsive design for all devices
- Smooth animations with Framer Motion
- Custom Tailwind CSS components
- Beautiful gradients and glowing effects

### 🚀 Production Ready
- Docker containerization
- MongoDB database with indexes
- Environment configuration
- Health checks and monitoring
- Nginx reverse proxy configuration
- Security best practices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Cors** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container setup
- **Nginx** - Reverse proxy
- **MongoDB** - Database service

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anime-blog
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   
   # Update environment variables in both files
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

5. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server  # Backend on :5000
   npm run client  # Frontend on :3000
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Deployment

#### Using Docker Compose

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd anime-blog
   cp .env.example .env
   # Update production environment variables
   ```

2. **Build and start**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost
   - API: http://localhost/api

#### Manual Deployment

1. **Build the client**
   ```bash
   cd client && npm run build
   ```

2. **Start the server**
   ```bash
   cd server && npm start
   ```

## 📁 Project Structure

```
anime-blog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities and API
│   │   └── styles/        # CSS and styling
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API route handlers
│   ├── models/            # MongoDB models
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── package.json
├── docker-compose.yml      # Multi-container setup
├── Dockerfile             # Production container
├── nginx.conf             # Reverse proxy config
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/anime-blog
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

The application automatically creates indexes and initial data. For production:

1. **Create MongoDB user**
   ```javascript
   db.createUser({
     user: "anime-blog",
     pwd: "secure-password",
     roles: ["readWrite"]
   })
   ```

2. **Set up indexes** (automatic on first run)

## 🎨 Customization

### Theme Colors
Edit `client/tailwind.config.js` to customize the anime color palette:

```javascript
colors: {
  anime: {
    purple: { /* custom purple shades */ },
    pink: { /* custom pink shades */ },
    blue: { /* custom blue shades */ }
  }
}
```

### Components
All UI components use the anime theme classes and can be customized in `client/src/index.css`.

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Environment variable protection
- SQL injection prevention
- XSS protection

## 🚀 Performance

- Optimized database queries with indexes
- Image optimization and lazy loading
- Code splitting with React lazy loading
- Caching strategies
- Compressed static assets
- CDN-ready static files

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Accessible navigation
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced search with Elasticsearch
- [ ] Social media integration
- [ ] Email newsletters
- [ ] Mobile app with React Native
- [ ] Admin dashboard analytics
- [ ] Multi-language support
- [ ] Progressive Web App features
- [ ] Integration with MyAnimeList API
- [ ] Advanced content editor
- [ ] Comment moderation system
- [ ] RSS feed generation

## 🆘 Support

For support, email support@animeblog.com or create an issue in the repository.

---

Built with ❤️ and ☕ for the anime community