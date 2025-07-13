# TrustHub - Modern Trust-Driven Dating App

A revolutionary dating platform that replaces superficial swiping with meaningful connections built on trust, social testimonials, and authentic relationships.

## 🌟 Key Features

### Trust-Based Discovery
- **RealBar Scoring System**: Dynamic trust scores (0-100) based on vouches, ratings, and profile completeness
- **Categorized Trust Levels**: Verified (85%+), Trusted (70%+), Emerging (50%+), New (<50%)
- **Connection-Focused Interface**: Intentional "Connect" buttons replace mindless swiping

### Social Testimonial System
- **Props from RealOnes**: Friends and family provide character testimonials
- **Relationship Context**: Vouchers specify their relationship (sibling, coworker, friend)
- **Multi-Dimensional Ratings**: Personality traits, reliability, and character assessment
- **User-Controlled Visibility**: Approve testimonials before they appear publicly

### RealOnes Interview System
- **Voucher Access**: Daters can grant matches permission to interview their testimonial writers
- **Authentic Insights**: Get genuine perspectives from people who know potential matches
- **Question Management**: Custom interview questions tailored to specific relationships

### Interactive Circle Communities
- **Social Circles**: Create and join interest-based communities (Adventure, Fitness, Food, Culture)
- **Privacy Controls**: Granular name display preferences with global and per-circle settings
- **Member Invitations**: Invite other daters to join your circles with custom messages

### Seven-Stage Relationship System
Progressive relationship journey: Solo → Explorers → Potentials → Warm Sparks → On Deck → Committed → Archived

### Comprehensive Privacy Features
- **Global Name Privacy**: First initials of last names shown by default throughout the app
- **Per-Circle Override**: Individual privacy controls for each circle membership
- **Profile Privacy Settings**: Control visibility of personal information and photos

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern, responsive styling
- **Radix UI** components with shadcn/ui design system
- **TanStack React Query** for server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express framework
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL database
- **Express Sessions** with PostgreSQL store
- **WebSocket** support for real-time messaging
- **Bcrypt** for secure password hashing

### Database
- **PostgreSQL** with Neon serverless hosting
- **Drizzle Kit** for schema management and migrations
- Comprehensive relational schema with users, profiles, circles, testimonials, and messaging

### Authentication
- **Multi-Provider Support**: Email/password, Google OAuth, Facebook
- **Session Management**: Secure session handling with refresh tokens
- **Route Protection**: Comprehensive middleware for authenticated endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/renwic/TrustHub.git
   cd TrustHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/trusthub
   SESSION_SECRET=your-secure-random-string-here
   NODE_ENV=development
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📱 Core User Experience

### For New Users
1. **Sign Up**: Choose from multiple authentication options
2. **Profile Creation**: Complete comprehensive profile with photos and interests
3. **Invite RealOnes**: Request testimonials from friends and family
4. **Build Trust**: Accumulate props to increase RealBar score
5. **Discover Connections**: Browse trust-categorized profiles
6. **Join Circles**: Connect with like-minded individuals in interest groups

### For Returning Users
- **Trust Hub**: Primary interface showing categorized profiles by trust level
- **My Props**: Manage received testimonials and invite new vouchers
- **Circles**: Participate in community groups and social activities
- **Matches**: View connections and manage relationship progression
- **Messages**: Real-time chat with matched users

## 🔒 Privacy & Safety

### Comprehensive Legal Framework
- **Privacy Policy**: GDPR/CCPA compliant data protection
- **Terms of Service**: Clear user rights and responsibilities
- **Community Guidelines**: Standards for respectful interaction
- **Safety Guidelines**: Protection measures and reporting systems
- **Cookie Policy**: Transparent data usage disclosure

### Safety Features
- **User Reporting**: Report inappropriate behavior or content
- **Block/Unmatch**: Immediate protection from unwanted contact
- **Content Moderation**: AI-assisted moderation with human oversight
- **Admin System**: Three-tier permission system (user, moderator, administrator)

## 🏗 Architecture

### Database Schema
- **Users & Profiles**: Core user information and dating profiles
- **Trust System**: Testimonials, ratings, and verification data
- **Social Features**: Circles, memberships, and invitations
- **Matching System**: Swipes, matches, and relationship progression
- **Communication**: Messages, notifications, and real-time updates
- **Administration**: Moderation queue, admin actions, and platform settings

### API Design
- RESTful API endpoints for all major features
- Real-time WebSocket connections for messaging
- Comprehensive error handling and validation
- Role-based access control for admin features

## 🌐 Deployment

### Render.com (Recommended)
1. Connect GitHub repository to Render
2. Create PostgreSQL database service
3. Deploy web service with environment variables
4. Run `npm run db:push` to initialize schema

### Environment Variables (Production)
```bash
NODE_ENV=production
DATABASE_URL=your-postgres-connection-string
SESSION_SECRET=cryptographically-secure-random-string
```

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Trust-Based Discovery | Complete | RealBar scoring and categorized profiles |
| ✅ Props System | Complete | Social testimonials from friends/family |
| ✅ RealOnes Interviews | Complete | Interview vouchers for authentic insights |
| ✅ Circles Communities | Complete | Interest-based social groups |
| ✅ Privacy Controls | Complete | Global and per-circle name privacy |
| ✅ Relationship Stages | Complete | Seven-stage progression system |
| ✅ Real-time Messaging | Complete | WebSocket-based chat system |
| ✅ Admin Dashboard | Complete | Comprehensive moderation tools |
| ✅ Mobile Responsive | Complete | Mobile-first design approach |
| ✅ Legal Framework | Complete | GDPR/CCPA compliant documentation |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For deployment support or technical questions, please refer to the documentation or contact the development team.

---

**TrustHub** - Where authentic connections begin with trust.