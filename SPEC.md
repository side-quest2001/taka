# TAKA - Business-Influencer Marketplace Mobile App

## 1. Project Overview

**Project Name:** TAKA  
**Type:** React Native Mobile Application (Expo)  
**Core Functionality:** A platform connecting businesses in Indore with local influencers for marketing campaigns, featuring location-based discovery and direct outreach capabilities.

---

## 2. Technology Stack

### Frontend
- **Framework:** React Native with Expo SDK 52
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context API + useReducer
- **UI Components:** React Native Paper (Material Design 3)
- **Maps:** react-native-maps with offline tiles support
- **Icons:** @expo/vector-icons (MaterialCommunityIcons)

### Backend
- **Framework:** Express.js with TypeScript
- **Database:** SQLite (for local development)
- **Authentication:** JWT tokens
- **API Style:** RESTful

---

## 3. User Roles

### 1. Business
- Create marketing campaigns
- Search and discover local influencers
- Send collaboration requests to influencers
- Manage campaigns and track performance
- Onboard for TAKA-based marketing services

### 2. Personal (Individual User)
- Browse local businesses and offers
- Save favorite businesses
- Write reviews and ratings
- Refer businesses to earn rewards

### 3. Influencer
- Create and manage profile (niche, reach, rates)
- Receive and manage collaboration requests
- Track earnings and campaign history
- Set availability and service rates

---

## 4. Feature List

### Authentication
- [ ] Login/Signup with email and password
- [ ] Role selection (Business/Personal/Influencer)
- [ ] Profile creation based on role
- [ ] Session management with JWT

### Business Features
- [ ] Dashboard with campaign overview
- [ ] Create new marketing campaign
- [ ] Search influencers by location, niche, follower count
- [ ] View influencer profiles
- [ ] Send collaboration requests
- [ ] Track active campaigns
- [ ] TAKA marketing onboarding form

### Personal Features
- [ ] Discover local businesses on map
- [ ] Browse business listings
- [ ] Save favorites
- [ ] View business details and offers

### Influencer Features
- [ ] Profile management (bio, niche, rates, portfolio)
- [ ] Dashboard with pending requests
- [ ] Accept/decline collaboration requests
- [ ] View campaign history
- [ ] Earnings tracker

### Map Features
- [ ] Display Indore map with custom tiles
- [ ] Show influencer locations as markers
- [ ] Show business locations as markers
- [ ] Cluster markers for dense areas
- [ ] Filter markers by category

### Onboarding (TAKA Marketing)
- [ ] Multi-step form for business onboarding
- [ ] Capture business details, marketing needs, budget
- [ ] Submit onboarding request to TAKA team

### Direct Outreach
- [ ] Business can message influencers directly
- [ ] In-app messaging system
- [ ] Conversation history

---

## 5. UI/UX Design

### Color Scheme
- **Primary:** #6C63FF (Purple - TAKA brand)
- **Secondary:** #FF6B6B (Coral - Accent)
- **Background:** #F8F9FA (Light Gray)
- **Surface:** #FFFFFF (White)
- **Text Primary:** #1A1A2E (Dark Navy)
- **Text Secondary:** #6B7280 (Gray)
- **Success:** #10B981 (Green)
- **Error:** #EF4444 (Red)

### Typography
- **Headings:** System font, bold, 24-32px
- **Body:** System font, regular, 14-16px
- **Captions:** System font, light, 12px

### Layout
- **Navigation:** Bottom tab navigation (4 tabs)
- **Screens:** Stack navigation within each tab
- **Cards:** Rounded corners (12px), subtle shadows

---

## 6. Data Models

### User
```
- id: string
- email: string
- password: string (hashed)
- role: 'business' | 'personal' | 'influencer'
- createdAt: timestamp
```

### Business Profile
```
- userId: string
- businessName: string
- category: string
- address: string
- location: { lat, lng }
- description: string
- phone: string
```

### Influencer Profile
```
- userId: string
- name: string
- bio: string
- niche: string[]
- followerCount: number
- location: { lat, lng }
- hourlyRate: number
- portfolio: string[]
- rating: number
```

### Campaign
```
- id: string
- businessId: string
- title: string
- description: string
- budget: number
- status: 'active' | 'completed' | 'cancelled'
- createdAt: timestamp
```

### Collaboration Request
```
- id: string
- businessId: string
- influencerId: string
- campaignId: string
- message: string
- status: 'pending' | 'accepted' | 'declined'
- createdAt: timestamp
```

### Message
```
- id: string
- senderId: string
- receiverId: string
- content: string
- createdAt: timestamp
```

---

## 7. Dummy Data

### Indore Influencers (10 profiles)
Located across different areas of Indore:
- Vijay Nagar, MG Road, Rajwada, Palasia, AB Road
- Categories: Food, Fashion, Travel, Tech, Fitness, Beauty

### Indore Businesses (10 profiles)
- Restaurants, cafes, salons, gyms, shops
- Located throughout Indore

---

## 8. API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users/profile/:id
- PUT /api/users/profile

### Influencers
- GET /api/influencers (with filters)
- GET /api/influencers/:id

### Businesses
- GET /api/businesses
- GET /api/businesses/:id
- POST /api/businesses

### Campaigns
- GET /api/campaigns
- POST /api/campaigns
- GET /api/campaigns/:id

### Collaborations
- GET /api/collaborations
- POST /api/collaborations
- PUT /api/collaborations/:id

### Messages
- GET /api/messages/:userId
- POST /api/messages

### Onboarding
- POST /api/onboarding

---

## 9. Project Structure

```
taka-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Tab screens
│   └── _layout.tsx
├── components/            # Reusable components
├── context/               # React Context providers
├── services/              # API services
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── constants/             # App constants
└── assets/                # Images, fonts

taka-backend/
├── src/
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── models/           # Data models
│   ├── middleware/       # Auth middleware
│   └── index.ts          # Server entry
├── package.json
└── tsconfig.json
```

---

## 10. Acceptance Criteria

1. ✅ User can register/login as Business, Personal, or Influencer
2. ✅ Business can create campaigns and search influencers
3. ✅ Business can send direct outreach to influencers
4. ✅ Influencer can manage profile and respond to requests
5. ✅ Personal can view map with businesses and influencers
6. ✅ Map displays Indore with marker clusters
7. ✅ Business can complete TAKA marketing onboarding form
8. ✅ In-app messaging works between business and influencer
9. ✅ Each user type has appropriate dashboard
10. ✅ App builds and runs without errors