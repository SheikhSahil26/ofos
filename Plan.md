# 🍔 FoodFleet — Online Food Ordering System

> A production-grade, multi-portal food ordering platform built with Node.js, Express, TypeScript, Prisma ORM, MySQL (Aiven Cloud), React, Redis, and Socket.IO.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Prisma](https://img.shields.io/badge/prisma-5.x-2D3748)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Database Modules](#5-database-modules)
6. [Complete API Route Documentation](#6-complete-api-route-documentation)
7. [Controller List](#7-controller-list)
8. [Service Layer Design](#8-service-layer-design)
9. [Repository Layer](#9-repository-layer)
10. [Prisma ORM Structure](#10-prisma-orm-structure)
11. [Aiven Cloud Database Setup](#11-aiven-cloud-database-setup)
12. [Redis Usage](#12-redis-usage)
13. [Socket.IO Events](#13-socketio-events)
14. [Background Jobs](#14-background-jobs)
15. [Security Architecture](#15-security-architecture)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Development Workflow](#17-development-workflow)
18. [Future Enhancements](#18-future-enhancements)
19. [Team Responsibilities](#19-team-responsibilities)
20. [Project Roadmap](#20-project-roadmap)

---

## 1. Project Overview

### 1.1 Problem Statement

The food delivery industry in India and globally is booming, yet many restaurant businesses still rely on aggregator platforms (Zomato, Swiggy, UberEats) that charge commissions of 25–35% per order. Independent restaurant chains, cloud kitchens, and regional food businesses need a **self-hosted, white-label food ordering platform** that gives them full control over their operations, customer data, branding, and profit margins.

Additionally, existing solutions often lack:

- Real-time order tracking with live driver GPS
- Multi-branch restaurant management from a single dashboard
- Flexible menu customization with modifier groups and add-ons
- Integrated loyalty and promotion engines
- Robust delivery partner fleet management
- Comprehensive admin analytics and audit trails

### 1.2 Business Goal

Build a **scalable, production-grade, multi-portal food ordering system** that enables:

- **Restaurants** to manage menus, branches, staff, promotions, and orders independently
- **Customers** to discover restaurants, customize orders, track deliveries in real time, and earn loyalty rewards
- **Delivery Partners** to receive, accept, and fulfill delivery assignments with GPS navigation
- **Administrators** to oversee the entire platform, manage verifications, resolve disputes, and analyze business metrics

### 1.3 Product Vision

FoodFleet aims to be a **complete, enterprise-ready food ordering ecosystem** — not just an MVP. The platform is designed from day one for:

- **Multi-tenancy** — multiple restaurants and branches on a single platform
- **Horizontal scalability** — stateless API servers behind a load balancer, Redis for caching, queue-based background processing
- **Real-time experiences** — Socket.IO for live order status, driver tracking, and push notifications
- **Security-first architecture** — JWT + refresh tokens, RBAC, rate limiting, input validation, SQL injection protection via Prisma

### 1.4 Target Users

| User Type | Description |
|---|---|
| **Customers** | End users who browse restaurants, place orders, track deliveries, leave reviews, and redeem loyalty points |
| **Restaurant Owners** | Business owners who register restaurants, manage branches, configure menus, and monitor order analytics |
| **Restaurant Staff** | Branch-level employees who receive and process incoming orders, update order status, and manage daily operations |
| **Delivery Partners** | Independent drivers/riders who register, get verified, receive delivery assignments, and navigate to customer addresses |
| **Platform Administrators** | Internal team members who verify restaurants, manage coupons, resolve support tickets, view analytics, and oversee platform health |

### 1.5 Key Features

#### Customer Portal
- User registration & login (email, mobile, OTP)
- Browse nearby restaurants with search, filters, and sorting
- View restaurant menus with categories, dietary tags, and modifier add-ons
- Cart management with item customization
- Coupon and promo code application
- Multiple delivery addresses with Google Maps autocomplete
- Real-time order tracking with live driver location on map
- Order history and re-ordering
- Food, delivery, and packaging ratings with photo reviews
- Loyalty points earning and redemption
- Push notifications for order status updates
- In-app support ticket creation

#### Restaurant Portal
- Restaurant and branch registration with FSSAI/GSTIN verification
- Multi-branch management from a single dashboard
- Menu management — categories, items, modifiers, dietary tags, availability toggles
- Operating hours configuration per branch
- Incoming order management — accept, prepare, mark ready
- Staff management — invite and assign users to branches
- Promotions and discount management
- Order history, revenue reports, and analytics
- Review monitoring and response

#### Delivery Partner Portal
- Driver registration with vehicle and government ID verification
- Real-time delivery assignment notifications
- Accept/reject delivery requests
- GPS-based navigation to restaurant and customer
- Order pickup confirmation and delivery completion
- Earnings dashboard and payout history
- Availability toggle (online/offline)

#### Admin Portal
- Platform-wide dashboard with KPIs
- Restaurant and branch verification (approve/reject/suspend)
- Delivery partner verification
- Global coupon and promotion management
- Support ticket management and resolution
- User management (ban, deactivate, role assignment)
- Refund approval and processing
- Financial reports — revenue, commissions, payouts
- Audit logs for critical operations
- System health monitoring

---

## 2. Technology Stack

### 2.1 Backend

| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | Server-side JavaScript runtime | ≥ 18.x LTS |
| **Express.js** | Minimal and flexible HTTP framework | 4.x |
| **TypeScript** | Static typing for robust, maintainable code | 5.x |

### 2.2 Frontend

| Technology | Purpose | Version |
|---|---|---|
| **React.js** | Component-based UI library | 18.x |
| **TypeScript** | Type-safe frontend development | 5.x |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development | 3.x |
| **React Router** | Client-side routing for SPA navigation | 6.x |
| **Axios** | Promise-based HTTP client | 1.x |
| **Socket.IO Client** | Real-time event communication | 4.x |
| **React Query / TanStack Query** | Server state management and caching | 5.x |
| **Zustand / Redux Toolkit** | Client-side state management | Latest |
| **Google Maps React** | Map rendering for delivery tracking and address picker | Latest |
| **React Hook Form + Zod** | Form handling and client-side validation | Latest |

### 2.3 Database

| Technology | Purpose |
|---|---|
| **MySQL 8.x** | Primary relational database — ACID compliant, performant for transactional workloads |
| **Aiven Cloud MySQL** | Managed cloud database with automated backups, high availability, SSL encryption, and monitoring |

### 2.4 ORM

| Technology | Purpose |
|---|---|
| **Prisma ORM 5.x** | Type-safe database access layer with auto-generated client, schema-first migrations, and introspection support |

### 2.5 Authentication & Authorization

| Technology | Purpose |
|---|---|
| **JSON Web Tokens (JWT)** | Stateless access token-based authentication |
| **Refresh Tokens** | Long-lived tokens stored in DB for session renewal |
| **bcrypt** | Password hashing with configurable salt rounds |
| **Role-Based Access Control (RBAC)** | Fine-grained permissions per user role |

### 2.6 Caching & Session Management

| Technology | Purpose |
|---|---|
| **Redis 7.x** | In-memory data store for caching, rate limiting, OTP storage, session management, and real-time tracking data |

### 2.7 Real-Time Communication

| Technology | Purpose |
|---|---|
| **Socket.IO 4.x** | Bi-directional event-based communication for live order tracking, driver GPS updates, and instant notifications |

### 2.8 Maps & Geolocation

| Technology | Purpose |
|---|---|
| **Google Maps JavaScript API** | Map rendering for delivery tracking and restaurant discovery |
| **Google Places API** | Address autocomplete and place search |
| **Google Geocoding API** | Address-to-coordinates and reverse geocoding |
| **Google Directions API** | Route calculation and ETA estimation |
| **Google Distance Matrix API** | Distance and travel time between multiple origins/destinations |

### 2.9 Payments

| Technology | Purpose |
|---|---|
| **Razorpay / Stripe** | Payment gateway integration for card, UPI, wallet, net banking |
| **Webhook Listeners** | Asynchronous payment status verification |

### 2.10 File Storage

| Technology | Purpose |
|---|---|
| **AWS S3 / Cloudinary / Google Cloud Storage** | Cloud storage for restaurant logos, menu item images, review photos, government ID documents |
| **Multer** | Multipart file upload middleware for Express |

### 2.11 Background Job Processing

| Technology | Purpose |
|---|---|
| **BullMQ** | Redis-backed job queue for emails, SMS, push notifications, refund processing, auto-cancellation |
| **Node-Cron** | Scheduled recurring tasks (analytics aggregation, payout processing) |

### 2.12 Email & SMS

| Technology | Purpose |
|---|---|
| **Nodemailer + SendGrid / AWS SES** | Transactional email delivery |
| **Twilio / MSG91** | OTP and transactional SMS delivery |
| **Firebase Cloud Messaging (FCM)** | Push notifications for mobile and web |

### 2.13 API Documentation

| Technology | Purpose |
|---|---|
| **Swagger / OpenAPI 3.0** | Interactive API documentation |

### 2.14 Testing

| Technology | Purpose |
|---|---|
| **Jest** | Unit and integration testing framework |
| **Supertest** | HTTP assertion library for API testing |

### 2.15 DevOps & Deployment

| Technology | Purpose |
|---|---|
| **Docker** | Containerization of backend, frontend, Redis |
| **Docker Compose** | Local multi-service orchestration |
| **Nginx** | Reverse proxy and static file serving |
| **GitHub Actions / GitLab CI** | CI/CD pipeline automation |
| **PM2** | Node.js process management in production |
| **AWS / GCP / DigitalOcean** | Cloud hosting infrastructure |

### 2.16 Monitoring & Logging

| Technology | Purpose |
|---|---|
| **Winston** | Structured application logging |
| **Morgan** | HTTP request logging middleware |
| **Sentry** | Error tracking and performance monitoring |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Customer    │  │  Restaurant  │  │  Delivery     │  │   Admin     │ │
│  │  Portal      │  │  Portal      │  │  Partner App  │  │   Portal    │ │
│  │  (React)     │  │  (React)     │  │  (React)      │  │   (React)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  └─────┬──────┘ │
│         │                 │                  │                  │        │
└─────────┼─────────────────┼──────────────────┼──────────────────┼────────┘
          │    HTTPS/WSS    │                  │                  │
          ▼                 ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       NGINX REVERSE PROXY                               │
│                  (SSL Termination, Load Balancing)                       │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Express Server  │  │  Express Server  │  │  Express Server  │
│   Instance 1     │  │   Instance 2     │  │   Instance N     │
│  (Node.js + TS)  │  │  (Node.js + TS)  │  │  (Node.js + TS)  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                        API LAYER                                        │
│                                                                         │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │ Routes  │→ │ Middlewares   │→ │ Validators │→ │   Controllers     │  │
│  │         │  │ (Auth, RBAC,  │  │ (Zod)      │  │                   │  │
│  │         │  │  Rate Limit)  │  │            │  │                   │  │
│  └─────────┘  └──────────────┘  └────────────┘  └────────┬──────────┘  │
│                                                           │             │
└───────────────────────────────────────────────────────────┼─────────────┘
                                                            │
┌───────────────────────────────────────────────────────────┼─────────────┐
│                     BUSINESS LAYER                        │             │
│                                                           ▼             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐    │
│  │    Services       │    │    Event          │    │   Socket.IO    │    │
│  │  (Business Logic) │    │    Emitters       │    │   Gateway      │    │
│  └────────┬──────────┘    └────────┬──────────┘    └───────┬────────┘    │
│           │                        │                       │            │
└───────────┼────────────────────────┼───────────────────────┼────────────┘
            │                        │                       │
┌───────────┼────────────────────────┼───────────────────────┼────────────┐
│           ▼                        ▼                       ▼            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐    │
│  │   Repositories    │    │   BullMQ Queues   │    │   Redis Cache  │    │
│  │  (Data Access)    │    │   (Background      │    │                │    │
│  │                   │    │    Jobs)           │    │                │    │
│  └────────┬──────────┘    └──────────────────┘    └────────────────┘    │
│           │                                                             │
│       DATA LAYER                                                        │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                   │
│                                                                         │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐   │
│  │      Prisma ORM Client       │    │       Redis 7.x              │   │
│  │  (Auto-generated TypeScript)  │    │  (Cache, Sessions, Queues)   │   │
│  └──────────────┬───────────────┘    └──────────────────────────────┘   │
│                 │                                                       │
│                 ▼                                                       │
│  ┌──────────────────────────────┐                                      │
│  │  Aiven Cloud MySQL 8.x       │                                      │
│  │  (SSL, Automated Backups,     │                                      │
│  │   High Availability)          │                                      │
│  └──────────────────────────────┘                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                  │
│                                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────────┐    │
│  │ Razorpay/  │ │ Google Maps│ │ SendGrid/  │ │ AWS S3/           │    │
│  │ Stripe     │ │ APIs       │ │ Twilio/FCM │ │ Cloudinary        │    │
│  │ (Payments) │ │ (Maps)     │ │ (Comms)    │ │ (File Storage)    │    │
│  └────────────┘ └────────────┘ └────────────┘ └───────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow

```
Client (Browser/App)
    │
    ▼
[HTTPS Request] ──→ Nginx Reverse Proxy
                        │
                        ▼
                    Express Server
                        │
                        ▼
                    Route Matcher ──→ Identifies endpoint
                        │
                        ▼
                    Middleware Chain:
                    ├── 1. Morgan (Request Logging)
                    ├── 2. CORS Validation
                    ├── 3. Helmet (Security Headers)
                    ├── 4. Rate Limiter (Redis-backed)
                    ├── 5. JWT Authentication (verify token)
                    ├── 6. RBAC Authorization (check role permissions)
                    └── 7. Input Validation (Zod schema)
                        │
                        ▼
                    Controller
                    ├── Parses request (params, query, body)
                    ├── Calls Service layer
                    └── Returns formatted response
                        │
                        ▼
                    Service Layer
                    ├── Executes business logic
                    ├── Orchestrates repository calls
                    ├── Emits events (Socket.IO, BullMQ)
                    └── Returns result to Controller
                        │
                        ▼
                    Repository Layer
                    ├── Prisma ORM queries
                    ├── Redis cache reads/writes
                    └── Returns raw data to Service
                        │
                        ▼
                    Response → Client
```

### 3.3 Authentication Flow

```
┌──────────┐                    ┌──────────────┐                ┌──────────┐
│  Client   │                    │  Auth Service │                │  MySQL   │
└─────┬─────┘                    └──────┬───────┘                └─────┬────┘
      │                                │                              │
      │  1. POST /auth/register        │                              │
      │  { email, mobile, password }   │                              │
      │ ─────────────────────────────→ │                              │
      │                                │  2. Check duplicate          │
      │                                │ ────────────────────────────→│
      │                                │  3. Hash password (bcrypt)   │
      │                                │  4. Create user record       │
      │                                │ ────────────────────────────→│
      │                                │  5. Generate OTP             │
      │                                │  6. Store OTP in Redis       │
      │                                │  7. Send OTP via SMS/Email   │
      │  8. { message: "OTP sent" }    │                              │
      │ ←───────────────────────────── │                              │
      │                                │                              │
      │  9. POST /auth/verify-otp      │                              │
      │  { mobile, otp }              │                              │
      │ ─────────────────────────────→ │                              │
      │                                │  10. Validate OTP from Redis │
      │                                │  11. Mark user as verified   │
      │                                │ ────────────────────────────→│
      │                                │  12. Generate Access Token   │
      │                                │       (JWT, 15min expiry)    │
      │                                │  13. Generate Refresh Token  │
      │                                │       (JWT, 7d expiry)       │
      │                                │  14. Store Refresh Token     │
      │                                │       in DB                  │
      │  15. { accessToken,            │ ────────────────────────────→│
      │        refreshToken }          │                              │
      │ ←───────────────────────────── │                              │
      │                                │                              │
      │  16. GET /users/profile        │                              │
      │  Authorization: Bearer <token> │                              │
      │ ─────────────────────────────→ │                              │
      │                                │  17. Verify JWT signature    │
      │                                │  18. Decode payload          │
      │                                │  19. Fetch user + roles      │
      │                                │ ────────────────────────────→│
      │  20. { user profile data }     │                              │
      │ ←───────────────────────────── │                              │
```

### 3.4 Order Flow

```
Customer                    Server                     Restaurant             Delivery Partner
   │                          │                            │                       │
   │ 1. POST /orders          │                            │                       │
   │  (cart items, address,   │                            │                       │
   │   coupon, payment)       │                            │                       │
   │ ───────────────────────→ │                            │                       │
   │                          │ 2. Validate cart items     │                       │
   │                          │ 3. Validate coupon         │                       │
   │                          │ 4. Calculate totals        │                       │
   │                          │    (subtotal, tax,         │                       │
   │                          │     delivery fee, discount)│                       │
   │                          │ 5. Create order record     │                       │
   │                          │    (status: PLACED)        │                       │
   │                          │ 6. Initiate payment        │                       │
   │                          │                            │                       │
   │ ← 7. Payment gateway URL │                            │                       │
   │                          │                            │                       │
   │ 8. Complete payment ───→ │                            │                       │
   │                          │ 9. Payment webhook         │                       │
   │                          │    (status: PAID)          │                       │
   │                          │ 10. Update order           │                       │
   │                          │     (status: CONFIRMED)    │                       │
   │                          │ 11. Emit Socket.IO:        │                       │
   │                          │     "order_created" ──────→│                       │
   │                          │                            │                       │
   │ ← 12. Real-time update   │                            │ 13. Accept order      │
   │    "Order Confirmed"     │ ←──────────────────────────│     (status:          │
   │                          │ 14. Update to PREPARING    │      PREPARING)       │
   │                          │                            │                       │
   │ ← 15. "Order Preparing"  │                            │ 16. Mark READY        │
   │                          │ ←──────────────────────────│                       │
   │                          │ 17. Update to              │                       │
   │                          │     READY_FOR_PICKUP       │                       │
   │                          │ 18. Find nearest driver    │                       │
   │                          │ 19. Create delivery        │                       │
   │                          │     assignment ───────────────────────────────────→│
   │                          │                            │                       │
   │                          │                            │        20. Accept     │
   │                          │ ←─────────────────────────────────────────────────│
   │                          │ 21. Assign driver          │                       │
   │                          │ 22. Status: PICKED_UP      │                       │
   │ ← 23. "Out for Delivery" │                            │                       │
   │                          │                            │   24. GPS updates     │
   │ ← 25. Live location ─────│ ←─────────────────────────────────────────────────│
   │                          │                            │                       │
   │                          │                            │   26. Mark DELIVERED  │
   │                          │ ←─────────────────────────────────────────────────│
   │ ← 27. "Order Delivered"  │                            │                       │
   │                          │ 28. Award loyalty points   │                       │
   │                          │ 29. Send review prompt     │                       │
```

### 3.5 Payment Flow

```
Customer              Server               Payment Gateway        Webhook
   │                    │                       │                     │
   │ 1. Checkout        │                       │                     │
   │ ──────────────────→│                       │                     │
   │                    │ 2. Create order        │                     │
   │                    │    (payment: PENDING)  │                     │
   │                    │ 3. Create gateway      │                     │
   │                    │    order ─────────────→│                     │
   │                    │ 4. Receive order_id    │                     │
   │ ← 5. Gateway URL  │ ←─────────────────────│                     │
   │    + order_id      │                       │                     │
   │                    │                       │                     │
   │ 6. Pay on gateway ─────────────────────────→                     │
   │                    │                       │                     │
   │                    │                       │ 7. Webhook POST     │
   │                    │                       │ ───────────────────→│
   │                    │                       │                     │
   │                    │ 8. Verify signature ←──────────────────────│
   │                    │ 9. Verify amount       │                     │
   │                    │ 10. Update payment     │                     │
   │                    │     status: SUCCESS    │                     │
   │                    │ 11. Update order       │                     │
   │                    │     payment_status:    │                     │
   │                    │     PAID               │                     │
   │                    │ 12. Emit order events  │                     │
   │ ← 13. Success      │                       │                     │
   │    confirmation    │                       │                     │
```

### 3.6 Delivery Tracking Flow

```
Delivery Partner App          Server (Socket.IO)           Customer App
       │                            │                          │
       │ 1. Connect to Socket.IO    │                          │
       │    (room: driver_{id})     │                          │
       │ ──────────────────────────→│                          │
       │                            │                          │
       │                            │ ← 2. Customer connects  │
       │                            │    (room: order_{id})    │
       │                            │ ←────────────────────────│
       │                            │                          │
       │ 3. Emit:                   │                          │
       │    "driver_location_update"│                          │
       │    { lat, lng, heading,    │                          │
       │      speed, timestamp }    │                          │
       │ ──────────────────────────→│                          │
       │                            │ 4. Store in Redis        │
       │                            │    (driver:location:{id})│
       │                            │ 5. Broadcast to          │
       │                            │    order room            │
       │                            │ ────────────────────────→│
       │                            │                          │ 6. Update map
       │                            │                          │    marker position
       │                            │                          │
       │ 7. Repeat every 5 seconds  │                          │
       │ ──────────────────────────→│ ────────────────────────→│
       │                            │                          │
       │ 8. Emit:                   │                          │
       │    "order_delivered"       │                          │
       │ ──────────────────────────→│                          │
       │                            │ 9. Update order status   │
       │                            │ 10. Broadcast final      │
       │                            │     status               │
       │                            │ ────────────────────────→│
       │                            │                          │ 11. Show
       │                            │                          │     "Delivered!"
```

---

## 4. Project Folder Structure

```
food-ordering-system/
│
├── client/                          # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Static assets (images, fonts, icons)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Buttons, Inputs, Modals, Loaders
│   │   │   ├── layout/              # Header, Footer, Sidebar, Navigation
│   │   │   └── maps/                # Google Maps components
│   │   ├── pages/                   # Page-level components per portal
│   │   │   ├── customer/
│   │   │   ├── restaurant/
│   │   │   ├── delivery/
│   │   │   └── admin/
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service layer (Axios instances)
│   │   ├── store/                   # State management (Zustand/Redux)
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Utility functions
│   │   ├── constants/               # App-wide constants
│   │   ├── context/                 # React Context providers
│   │   ├── routes/                  # Route configuration
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # Node.js Backend Application
│   ├── src/
│   │   ├── controllers/             # Request handlers — parse input, call services, send response
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── address.controller.ts
│   │   │   ├── restaurant.controller.ts
│   │   │   ├── branch.controller.ts
│   │   │   ├── operating-hours.controller.ts
│   │   │   ├── staff.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── menu-item.controller.ts
│   │   │   ├── modifier.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── refund.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── coupon.controller.ts
│   │   │   ├── promotion.controller.ts
│   │   │   ├── loyalty.controller.ts
│   │   │   ├── delivery.controller.ts
│   │   │   ├── fleet.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── support.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── analytics.controller.ts
│   │   │
│   │   ├── services/                # Business logic layer — orchestrates repositories and external services
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── address.service.ts
│   │   │   ├── restaurant.service.ts
│   │   │   ├── branch.service.ts
│   │   │   ├── operating-hours.service.ts
│   │   │   ├── staff.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── menu-item.service.ts
│   │   │   ├── modifier.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── refund.service.ts
│   │   │   ├── review.service.ts
│   │   │   ├── coupon.service.ts
│   │   │   ├── promotion.service.ts
│   │   │   ├── loyalty.service.ts
│   │   │   ├── delivery.service.ts
│   │   │   ├── fleet.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── socket.service.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   ├── support.service.ts
│   │   │   ├── admin.service.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   ├── repositories/            # Data access layer — Prisma queries abstracted behind repository pattern
│   │   │   ├── user.repository.ts
│   │   │   ├── role.repository.ts
│   │   │   ├── address.repository.ts
│   │   │   ├── restaurant.repository.ts
│   │   │   ├── branch.repository.ts
│   │   │   ├── operating-hours.repository.ts
│   │   │   ├── staff.repository.ts
│   │   │   ├── category.repository.ts
│   │   │   ├── menu-item.repository.ts
│   │   │   ├── modifier.repository.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── order-item.repository.ts
│   │   │   ├── payment.repository.ts
│   │   │   ├── refund.repository.ts
│   │   │   ├── review.repository.ts
│   │   │   ├── coupon.repository.ts
│   │   │   ├── promotion.repository.ts
│   │   │   ├── loyalty.repository.ts
│   │   │   ├── delivery.repository.ts
│   │   │   ├── delivery-partner.repository.ts
│   │   │   ├── notification.repository.ts
│   │   │   ├── support.repository.ts
│   │   │   └── audit-log.repository.ts
│   │   │
│   │   ├── routes/                  # Express route definitions — maps endpoints to controllers
│   │   │   ├── index.ts             # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── address.routes.ts
│   │   │   ├── restaurant.routes.ts
│   │   │   ├── branch.routes.ts
│   │   │   ├── operating-hours.routes.ts
│   │   │   ├── staff.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── menu-item.routes.ts
│   │   │   ├── modifier.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── refund.routes.ts
│   │   │   ├── review.routes.ts
│   │   │   ├── coupon.routes.ts
│   │   │   ├── promotion.routes.ts
│   │   │   ├── loyalty.routes.ts
│   │   │   ├── delivery.routes.ts
│   │   │   ├── fleet.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── support.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── analytics.routes.ts
│   │   │
│   │   ├── middlewares/             # Express middleware functions
│   │   │   ├── auth.middleware.ts           # JWT token verification
│   │   │   ├── rbac.middleware.ts           # Role-based access control
│   │   │   ├── rate-limiter.middleware.ts   # Redis-backed rate limiting
│   │   │   ├── validation.middleware.ts     # Zod schema validation runner
│   │   │   ├── upload.middleware.ts         # Multer file upload configuration
│   │   │   ├── error-handler.middleware.ts  # Global error handling
│   │   │   ├── cors.middleware.ts           # CORS configuration
│   │   │   ├── logger.middleware.ts         # Request/response logging
│   │   │   └── not-found.middleware.ts      # 404 handler
│   │   │
│   │   ├── validations/             # Zod schemas for request validation
│   │   │   ├── auth.validation.ts
│   │   │   ├── user.validation.ts
│   │   │   ├── address.validation.ts
│   │   │   ├── restaurant.validation.ts
│   │   │   ├── branch.validation.ts
│   │   │   ├── menu.validation.ts
│   │   │   ├── order.validation.ts
│   │   │   ├── payment.validation.ts
│   │   │   ├── review.validation.ts
│   │   │   ├── coupon.validation.ts
│   │   │   └── common.validation.ts
│   │   │
│   │   ├── prisma/                  # Prisma ORM configuration
│   │   │   ├── schema.prisma                # Database schema definition
│   │   │   ├── migrations/                  # Database migration files
│   │   │   ├── seed.ts                      # Database seeding script
│   │   │   └── client.ts                    # Prisma client singleton
│   │   │
│   │   ├── sockets/                 # Socket.IO event handlers and namespace management
│   │   │   ├── index.ts                     # Socket.IO server initialization
│   │   │   ├── order.socket.ts              # Order-related real-time events
│   │   │   ├── delivery.socket.ts           # Delivery tracking events
│   │   │   ├── notification.socket.ts       # Real-time notification delivery
│   │   │   └── chat.socket.ts               # Support chat events (future)
│   │   │
│   │   ├── events/                  # Application event emitter and handler registry
│   │   │   ├── emitter.ts                   # Centralized event emitter instance
│   │   │   ├── order.events.ts              # Order lifecycle event handlers
│   │   │   ├── payment.events.ts            # Payment status change handlers
│   │   │   ├── delivery.events.ts           # Delivery assignment event handlers
│   │   │   └── notification.events.ts       # Notification trigger handlers
│   │   │
│   │   ├── queues/                  # BullMQ queue definitions
│   │   │   ├── email.queue.ts
│   │   │   ├── sms.queue.ts
│   │   │   ├── push-notification.queue.ts
│   │   │   ├── refund.queue.ts
│   │   │   ├── payout.queue.ts
│   │   │   └── order-cancellation.queue.ts
│   │   │
│   │   ├── jobs/                    # BullMQ job processors (workers)
│   │   │   ├── email.job.ts
│   │   │   ├── sms.job.ts
│   │   │   ├── push-notification.job.ts
│   │   │   ├── refund.job.ts
│   │   │   ├── payout.job.ts
│   │   │   └── order-cancellation.job.ts
│   │   │
│   │   ├── config/                  # Application configuration and environment handling
│   │   │   ├── index.ts                     # Central config export
│   │   │   ├── database.config.ts           # Prisma/MySQL configuration
│   │   │   ├── redis.config.ts              # Redis connection configuration
│   │   │   ├── jwt.config.ts                # JWT secret, expiry settings
│   │   │   ├── cors.config.ts               # CORS allowed origins
│   │   │   ├── storage.config.ts            # Cloud storage (S3/Cloudinary) settings
│   │   │   ├── payment.config.ts            # Payment gateway keys
│   │   │   ├── maps.config.ts               # Google Maps API configuration
│   │   │   ├── email.config.ts              # SMTP/SendGrid configuration
│   │   │   ├── sms.config.ts                # Twilio/MSG91 configuration
│   │   │   └── queue.config.ts              # BullMQ queue connection settings
│   │   │
│   │   ├── utils/                   # Shared utility functions
│   │   │   ├── api-response.ts              # Standardized API response formatter
│   │   │   ├── api-error.ts                 # Custom error classes with HTTP status codes
│   │   │   ├── async-handler.ts             # Express async wrapper to catch errors
│   │   │   ├── token.ts                     # JWT generation and verification helpers
│   │   │   ├── hash.ts                      # bcrypt password hashing utilities
│   │   │   ├── otp.ts                       # OTP generation and validation
│   │   │   ├── pagination.ts                # Cursor/offset pagination helpers
│   │   │   ├── file-upload.ts               # File upload processing utilities
│   │   │   ├── order-number.ts              # Unique order number generator
│   │   │   ├── geo.ts                       # Geolocation distance calculations
│   │   │   └── date.ts                      # Date formatting and timezone utilities
│   │   │
│   │   ├── constants/               # Application-wide constant values
│   │   │   ├── roles.ts                     # User role definitions
│   │   │   ├── order-status.ts              # Order status enum values
│   │   │   ├── payment-status.ts            # Payment status enum values
│   │   │   ├── delivery-status.ts           # Delivery status enum values
│   │   │   ├── error-codes.ts               # Application error code registry
│   │   │   ├── http-status.ts               # HTTP status code constants
│   │   │   └── queue-names.ts               # BullMQ queue name constants
│   │   │
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── express.d.ts                 # Express request augmentation (req.user)
│   │   │   ├── auth.types.ts                # Auth-related types
│   │   │   ├── order.types.ts               # Order-related types
│   │   │   ├── payment.types.ts             # Payment-related types
│   │   │   ├── socket.types.ts              # Socket.IO event types
│   │   │   └── common.types.ts              # Shared utility types
│   │   │
│   │   ├── interfaces/              # TypeScript interfaces for contracts
│   │   │   ├── repository.interface.ts      # Base repository interface
│   │   │   ├── service.interface.ts         # Base service interface
│   │   │   ├── pagination.interface.ts      # Pagination request/response interfaces
│   │   │   └── api-response.interface.ts    # API response envelope interface
│   │   │
│   │   ├── helpers/                 # Domain-specific helper functions
│   │   │   ├── tax-calculator.ts            # Tax computation logic
│   │   │   ├── delivery-fee-calculator.ts   # Delivery fee calculation based on distance
│   │   │   ├── discount-calculator.ts       # Coupon and promotion discount calculation
│   │   │   ├── loyalty-calculator.ts        # Loyalty points earning/redemption logic
│   │   │   └── driver-assignment.ts         # Nearest available driver selection algorithm
│   │   │
│   │   ├── storage/                 # Cloud storage integration
│   │   │   ├── s3.storage.ts                # AWS S3 upload/delete operations
│   │   │   ├── cloudinary.storage.ts        # Cloudinary upload/delete operations
│   │   │   └── local.storage.ts             # Local filesystem storage (dev only)
│   │   │
│   │   ├── docs/                    # API documentation
│   │   │   ├── swagger.ts                   # Swagger/OpenAPI configuration
│   │   │   └── schemas/                     # OpenAPI schema definitions
│   │   │
│   │   ├── tests/                   # Test suites
│   │   │   ├── unit/                        # Unit tests for services, helpers
│   │   │   ├── integration/                 # Integration tests for API endpoints
│   │   │   ├── e2e/                         # End-to-end test scenarios
│   │   │   ├── fixtures/                    # Test data fixtures
│   │   │   └── setup.ts                     # Test environment setup
│   │   │
│   │   ├── app.ts                   # Express app setup — middleware, routes, error handling
│   │   └── server.ts               # Server entry point — starts HTTP server, Socket.IO, Redis, DB
│   │
│   ├── .env                         # Environment variables (git-ignored)
│   ├── .env.example                 # Environment variable template
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── jest.config.ts               # Jest test configuration
│   ├── nodemon.json                 # Nodemon development config
│   ├── Dockerfile                   # Docker container definition
│   ├── docker-compose.yml           # Multi-service Docker orchestration
│   └── package.json                 # Dependencies and scripts
│
├── .github/                         # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml                   # CI pipeline (lint, test, build)
│   │   └── cd.yml                   # CD pipeline (deploy to staging/production)
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier code formatting rules
├── LICENSE
└── README.md                        # This file
```

### Folder Responsibilities Summary

| Folder | Responsibility |
|---|---|
| `controllers/` | Handle HTTP request/response cycle. Parse params, query, body. Delegate to services. Never contain business logic. |
| `services/` | Core business logic. Orchestrate multiple repositories, apply business rules, emit events, call external services. |
| `repositories/` | Data access layer. Execute Prisma ORM queries. Abstract database operations behind clean methods. |
| `routes/` | Define Express routes. Map HTTP methods + paths to controller methods. Apply middleware chains. |
| `middlewares/` | Cross-cutting concerns — authentication, authorization, rate limiting, validation, error handling, logging. |
| `validations/` | Zod schemas that define and enforce request payload structure. Used by the validation middleware. |
| `prisma/` | Database schema definition, migration files, seeding scripts, and Prisma client singleton. |
| `sockets/` | Socket.IO event handlers organized by domain (orders, delivery, notifications). |
| `events/` | Internal event emitter pattern for decoupled communication between modules (e.g., order placed → notify restaurant). |
| `queues/` | BullMQ queue definitions for asynchronous background jobs. |
| `jobs/` | BullMQ worker processors that consume and execute queued jobs. |
| `config/` | Centralized configuration loaded from environment variables. No hardcoded values. |
| `utils/` | Generic reusable utilities — API response formatters, error classes, token helpers, pagination. |
| `constants/` | Immutable values — role names, status enums, error codes, queue names. |
| `types/` | TypeScript type definitions and declaration files for type augmentation. |
| `interfaces/` | TypeScript interfaces defining contracts for repositories, services, and API responses. |
| `helpers/` | Domain-specific calculation and decision logic — tax, delivery fees, discounts, driver assignment. |
| `storage/` | Cloud storage provider integrations for file upload and retrieval. |
| `docs/` | Swagger/OpenAPI documentation configuration and schema definitions. |
| `tests/` | Unit, integration, and E2E test suites with fixtures and setup scripts. |

---

## 5. Database Modules

The database is organized into **25 modules** covering all aspects of the food ordering ecosystem. Each module corresponds to one or more database tables and is accessed through its dedicated repository.

### 5.1 Users

**Tables:** `users`

Stores all user accounts on the platform — customers, restaurant owners, restaurant staff, delivery partners, and administrators. Contains core identity fields (name, email, mobile), authentication fields (password hash), and account status flags (verified, active, soft-deleted).

### 5.2 Roles & User Roles

**Tables:** `roles`, `user_roles`

Implements a many-to-many relationship between users and roles. A single user can hold multiple roles (e.g., a restaurant owner who is also a customer). The `roles` table defines available roles (`CUSTOMER`, `RESTAURANT_OWNER`, `RESTAURANT_STAFF`, `DELIVERY_PARTNER`, `ADMIN`). The `user_roles` junction table maps users to their assigned roles.

### 5.3 User Addresses

**Tables:** `user_addresses`

Stores saved delivery addresses for customers. Each address includes a label (Home, Work, Other), full address fields, geographic coordinates (latitude/longitude) for distance calculations, and a default flag. Supports soft deletion.

### 5.4 Restaurants

**Tables:** `restaurants`

Represents restaurant entities on the platform. Each restaurant is owned by a user (owner_id). Contains branding information (name, description, logo, cover image) and activation status. A restaurant can have multiple branches.

### 5.5 Restaurant Branches

**Tables:** `restaurant_branches`

Individual physical locations of a restaurant. Each branch has its own address, GSTIN, FSSAI license number, geographic coordinates, delivery radius, and a verification status workflow (`PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED`). Branches operate independently with their own menus, hours, and staff.

### 5.6 Operating Hours

**Tables:** `operating_hours`

Defines the weekly schedule for each restaurant branch. Each record specifies a day of the week, opening time, closing time, and whether the branch is closed on that day. Used to determine if a branch is currently accepting orders.

### 5.7 Restaurant Staff

**Tables:** `restaurant_staff`

Maps users to restaurant branches they work at. Enables branch-level access control so staff members can manage orders, menus, and operations only for their assigned branch. Supports soft deletion for staff removal.

### 5.8 Menu Categories

**Tables:** `categories`

Organizes menu items into logical groups within a branch (e.g., Starters, Main Course, Beverages, Desserts). Each category belongs to a specific branch and has a display_order field for custom sequencing in the UI. Supports soft deletion.

### 5.9 Menu Items

**Tables:** `menu_items`

Individual food items available for ordering. Each item belongs to a category and includes name, description, price, vegetarian flag, image URL, availability toggle, and bestseller flag. Supports soft deletion and is indexed by name for search.

### 5.10 Dietary Tags

**Tables:** `dietary_tags`, `menu_item_tags`

A tagging system for dietary and allergen information. The `dietary_tags` table stores tag names (Vegan, Gluten-Free, Nut-Free, Dairy-Free, Spicy, etc.). The `menu_item_tags` junction table creates a many-to-many relationship between menu items and dietary tags.

### 5.11 Modifier Groups & Options

**Tables:** `modifier_groups`, `modifier_options`

Enables item customization and add-ons. A `modifier_group` belongs to a menu item and defines a customization category (e.g., "Choose Size", "Extra Toppings", "Spice Level"). Each group specifies min/max selection counts and whether selection is required. `modifier_options` are the individual choices within a group, each with a name and extra price.

### 5.12 Coupons

**Tables:** `coupons`

Platform-wide discount codes. Supports multiple coupon types: `PERCENTAGE`, `FLAT`, `FREE_DELIVERY`, and `BOGO` (Buy One Get One). Each coupon has validity dates, usage limits, minimum order amounts, maximum discount caps, and activation status.

### 5.13 Coupon Usages

**Tables:** `coupon_usages`

Tracks coupon redemption history. Records which customer used which coupon on which order. Used to enforce per-user and global usage limits.

### 5.14 Restaurant Promotions

**Tables:** `restaurant_promotions`

Restaurant-specific promotional offers created by restaurant owners. Supports `Fixed`, `Percentage`, `Free_delivery`, and `BOGO` promotion types. Each promotion has a validity period and belongs to a specific restaurant.

### 5.15 Loyalty Accounts

**Tables:** `loyalty_accounts`

Tracks the current loyalty points balance for each customer. One account per customer. Points are never hard-deleted — only incremented (earn) or decremented (redeem).

### 5.16 Loyalty Transactions

**Tables:** `loyalty_transactions`

Immutable transaction log for all loyalty point movements. Each transaction records the point change (positive for earning, negative for redemption), the transaction type (`Earn`/`Redeem`), and a reference to the associated order. Provides a complete audit trail.

### 5.17 Orders

**Tables:** `orders`

The central order entity. Contains the order number, customer reference, branch reference, delivery address reference, optional coupon reference, financial breakdown (subtotal, tax, delivery fee, discount, total), order lifecycle status (`PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED` / `CANCELLED`), payment status (`PENDING` → `PAID` / `FAILED` / `REFUNDED`), and timestamps. Heavily indexed for performant queries.

### 5.18 Order Items

**Tables:** `order_items`

Individual line items within an order. Each record snapshots the menu item name and price at the time of ordering (to preserve historical accuracy even if the menu item changes later). Includes quantity and optional special instructions.

### 5.19 Order Item Modifiers

**Tables:** `order_item_modifiers`

Records the modifier options selected for each order item. Snapshots modifier name and extra price for historical accuracy. Linked to order items.

### 5.20 Order Status History

**Tables:** `order_status_history`

Immutable audit trail of every order status change. Records the old status, new status, the user who made the change, and the timestamp. Essential for dispute resolution and operational analytics.

### 5.21 Delivery Partners

**Tables:** `delivery_partners`

Stores delivery partner profiles linked to user accounts. Contains vehicle information (type and number), government ID for verification, and a status workflow (`PENDING_VERIFICATION` → `ACTIVE` / `INACTIVE` / `ON_DELIVERY` / `SUSPENDED`).

### 5.22 Deliveries & Delivery Assignments

**Tables:** `deliveries`, `delivery_assignments`

The `deliveries` table is the main delivery record for an order, tracking the currently assigned partner and overall delivery status. The `delivery_assignments` table maintains the full assignment history — if a driver rejects or times out, the system assigns the next available driver, and every attempt is recorded with response status and timestamps.

### 5.23 Payments & Payment Methods

**Tables:** `payments`, `payment_methods`

The `payments` table records each payment transaction against an order, including payment method, gateway details, transaction ID, amount, status, and timestamp. The `payment_methods` table stores saved/tokenized payment instruments for returning customers (cards, UPI IDs, wallets).

### 5.24 Refunds

**Tables:** `refunds`

Tracks refund requests and their lifecycle. Each refund is linked to a payment and a requesting user. Supports `FULL` and `PARTIAL` refund types with a multi-step status workflow (`REQUESTED` → `APPROVED` → `PROCESSING` → `COMPLETED` / `REJECTED` / `FAILED`). Stores the gateway refund ID for reconciliation.

### 5.25 Reviews & Review Images

**Tables:** `reviews`, `review_images`

Customer reviews after order delivery. Each review is tied to a specific order (one review per order), the reviewing user, the branch, and the delivery partner. Captures granular ratings for food, delivery, and packaging (1–5 scale) plus free-text feedback. Review images are stored separately and can be hard-deleted.

### 5.26 Support Tickets & Attachments

**Tables:** `support_tickets`, `ticket_attachments`

Customer support system. Tickets are linked to an order and a customer, optionally assigned to an admin. Categorized by issue type (`delivery`, `payment`, `order`, `product`) with a status workflow (`open` → `in_progress` → `resolved` → `closed`). File attachments (screenshots, receipts) are stored separately and can be hard-deleted.

### 5.27 Notifications

**Tables:** `notifications`

In-app notification records. Each notification targets a specific user with a title, message, type classification (`info`, `alert`, `order_update`), delivery status (`pending` → `sent` / `failed`), and read tracking. Supports soft deletion.

---

## 6. Complete API Route Documentation

All routes are prefixed with `/api/v1`. Authentication is required unless marked as **Public**.

---

### 6.1 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user account (customer, restaurant owner, delivery partner) |
| `POST` | `/api/v1/auth/login` | Authenticate user with email/mobile and password |
| `POST` | `/api/v1/auth/login/otp/request` | Request OTP for passwordless login |
| `POST` | `/api/v1/auth/login/otp/verify` | Verify OTP and issue tokens |
| `POST` | `/api/v1/auth/logout` | Invalidate refresh token and end session |
| `POST` | `/api/v1/auth/refresh-token` | Generate new access token using refresh token |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset link/OTP to email/mobile |
| `POST` | `/api/v1/auth/reset-password` | Reset password using reset token |
| `POST` | `/api/v1/auth/verify-email` | Verify email address using verification token |
| `POST` | `/api/v1/auth/verify-otp` | Verify mobile number OTP after registration |
| `POST` | `/api/v1/auth/change-password` | Change password (requires current password) |
| `POST` | `/api/v1/auth/resend-otp` | Resend OTP for verification |

---

### 6.2 Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/profile` | Get authenticated user's profile |
| `PATCH` | `/api/v1/users/profile` | Update profile (name, email, photo) |
| `PATCH` | `/api/v1/users/profile/photo` | Upload/update profile photo |
| `DELETE` | `/api/v1/users/profile/photo` | Remove profile photo |
| `DELETE` | `/api/v1/users/account` | Soft delete user account |
| `GET` | `/api/v1/users/roles` | Get current user's assigned roles |

---

### 6.3 Addresses

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/addresses` | List all saved addresses for authenticated user |
| `POST` | `/api/v1/addresses` | Add a new delivery address |
| `GET` | `/api/v1/addresses/:id` | Get address details by ID |
| `PUT` | `/api/v1/addresses/:id` | Update an existing address |
| `DELETE` | `/api/v1/addresses/:id` | Soft delete an address |
| `PATCH` | `/api/v1/addresses/:id/default` | Set address as default |
| `GET` | `/api/v1/addresses/geocode` | Geocode an address string to coordinates |
| `GET` | `/api/v1/addresses/reverse-geocode` | Convert coordinates to address |

---

### 6.4 Restaurants

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/restaurants` | List all active restaurants (public, with filters & search) |
| `GET` | `/api/v1/restaurants/nearby` | List nearby restaurants by coordinates and radius |
| `GET` | `/api/v1/restaurants/:id` | Get restaurant details by ID (public) |
| `POST` | `/api/v1/restaurants` | Create a new restaurant (restaurant owner) |
| `PUT` | `/api/v1/restaurants/:id` | Update restaurant details (owner) |
| `PATCH` | `/api/v1/restaurants/:id/logo` | Upload/update restaurant logo |
| `PATCH` | `/api/v1/restaurants/:id/cover` | Upload/update restaurant cover image |
| `PATCH` | `/api/v1/restaurants/:id/status` | Activate/deactivate restaurant |
| `DELETE` | `/api/v1/restaurants/:id` | Soft delete restaurant (owner) |
| `GET` | `/api/v1/restaurants/:id/reviews` | Get all reviews for a restaurant |
| `GET` | `/api/v1/restaurants/:id/promotions` | Get active promotions for a restaurant |
| `GET` | `/api/v1/restaurants/owner/my-restaurants` | List restaurants owned by authenticated user |

---

### 6.5 Restaurant Branches

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/restaurants/:restaurantId/branches` | List all branches of a restaurant |
| `POST` | `/api/v1/restaurants/:restaurantId/branches` | Create a new branch (owner) |
| `GET` | `/api/v1/branches/:id` | Get branch details by ID |
| `PUT` | `/api/v1/branches/:id` | Update branch details |
| `PATCH` | `/api/v1/branches/:id/status` | Activate/deactivate branch |
| `DELETE` | `/api/v1/branches/:id` | Soft delete branch |
| `GET` | `/api/v1/branches/:id/menu` | Get full menu for a branch (categories + items + modifiers) |
| `GET` | `/api/v1/branches/:id/orders` | Get all orders for a branch (restaurant staff) |
| `GET` | `/api/v1/branches/:id/analytics` | Get branch-level analytics (owner/staff) |
| `GET` | `/api/v1/branches/nearby` | Find branches near a set of coordinates |

---

### 6.6 Operating Hours

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/branches/:branchId/operating-hours` | Get operating hours for a branch |
| `POST` | `/api/v1/branches/:branchId/operating-hours` | Set operating hours (bulk create/update) |
| `PUT` | `/api/v1/operating-hours/:id` | Update a specific operating hours record |
| `DELETE` | `/api/v1/operating-hours/:id` | Delete an operating hours record |
| `GET` | `/api/v1/branches/:branchId/is-open` | Check if branch is currently open |

---

### 6.7 Restaurant Staff

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/branches/:branchId/staff` | List all staff for a branch |
| `POST` | `/api/v1/branches/:branchId/staff` | Add a staff member to a branch |
| `DELETE` | `/api/v1/branches/:branchId/staff/:userId` | Remove a staff member from a branch |
| `GET` | `/api/v1/staff/my-branches` | List branches the authenticated staff user is assigned to |

---

### 6.8 Menu Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/branches/:branchId/categories` | List all categories for a branch |
| `POST` | `/api/v1/branches/:branchId/categories` | Create a new category |
| `GET` | `/api/v1/categories/:id` | Get category details |
| `PUT` | `/api/v1/categories/:id` | Update category name or display order |
| `DELETE` | `/api/v1/categories/:id` | Soft delete a category |
| `PATCH` | `/api/v1/categories/reorder` | Reorder categories (bulk update display_order) |

---

### 6.9 Menu Items

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/categories/:categoryId/items` | List all items in a category |
| `POST` | `/api/v1/categories/:categoryId/items` | Create a new menu item |
| `GET` | `/api/v1/menu-items/:id` | Get menu item details with modifiers and tags |
| `PUT` | `/api/v1/menu-items/:id` | Update menu item details |
| `PATCH` | `/api/v1/menu-items/:id/image` | Upload/update menu item image |
| `PATCH` | `/api/v1/menu-items/:id/availability` | Toggle item availability |
| `PATCH` | `/api/v1/menu-items/:id/bestseller` | Toggle bestseller flag |
| `DELETE` | `/api/v1/menu-items/:id` | Soft delete a menu item |
| `GET` | `/api/v1/menu-items/search` | Search menu items by name across branches |
| `POST` | `/api/v1/menu-items/:id/tags` | Add dietary tags to a menu item |
| `DELETE` | `/api/v1/menu-items/:id/tags/:tagId` | Remove a dietary tag from a menu item |

---

### 6.10 Dietary Tags

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dietary-tags` | List all available dietary tags |
| `POST` | `/api/v1/dietary-tags` | Create a new dietary tag (admin) |
| `PUT` | `/api/v1/dietary-tags/:id` | Update a dietary tag (admin) |
| `DELETE` | `/api/v1/dietary-tags/:id` | Delete a dietary tag (admin) |

---

### 6.11 Modifier Groups & Options

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/menu-items/:menuItemId/modifier-groups` | List all modifier groups for a menu item |
| `POST` | `/api/v1/menu-items/:menuItemId/modifier-groups` | Create a new modifier group |
| `PUT` | `/api/v1/modifier-groups/:id` | Update modifier group settings |
| `DELETE` | `/api/v1/modifier-groups/:id` | Soft delete a modifier group |
| `GET` | `/api/v1/modifier-groups/:groupId/options` | List all options in a modifier group |
| `POST` | `/api/v1/modifier-groups/:groupId/options` | Add a modifier option |
| `PUT` | `/api/v1/modifier-options/:id` | Update a modifier option |
| `DELETE` | `/api/v1/modifier-options/:id` | Soft delete a modifier option |

---

### 6.12 Cart

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/cart` | Get current user's cart |
| `POST` | `/api/v1/cart/items` | Add an item to cart (with modifiers) |
| `PUT` | `/api/v1/cart/items/:itemId` | Update cart item quantity or modifiers |
| `DELETE` | `/api/v1/cart/items/:itemId` | Remove an item from cart |
| `DELETE` | `/api/v1/cart` | Clear entire cart |
| `POST` | `/api/v1/cart/validate` | Validate cart items (availability, pricing) before checkout |
| `GET` | `/api/v1/cart/summary` | Get cart summary with price breakdown (subtotal, tax, delivery fee, discounts) |

---

### 6.13 Orders

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/orders` | Place a new order from cart |
| `GET` | `/api/v1/orders` | List orders for authenticated user (with filters and pagination) |
| `GET` | `/api/v1/orders/:id` | Get order details by ID |
| `GET` | `/api/v1/orders/:id/track` | Get real-time order tracking info (status + driver location) |
| `GET` | `/api/v1/orders/:id/status-history` | Get order status change history |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status (restaurant staff / delivery partner / admin) |
| `POST` | `/api/v1/orders/:id/cancel` | Cancel an order (customer — before preparation; admin — anytime) |
| `POST` | `/api/v1/orders/:id/reorder` | Re-order the same items as a previous order |
| `GET` | `/api/v1/orders/:id/invoice` | Generate/download order invoice |
| `GET` | `/api/v1/orders/branch/:branchId` | List orders for a branch (restaurant staff) |
| `GET` | `/api/v1/orders/branch/:branchId/active` | List active (in-progress) orders for a branch |
| `PATCH` | `/api/v1/orders/:id/schedule` | Schedule an order for a future time |

---

### 6.14 Payments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/initiate` | Initiate payment for an order (creates gateway order) |
| `POST` | `/api/v1/payments/verify` | Verify payment after gateway callback |
| `POST` | `/api/v1/payments/webhook` | Payment gateway webhook handler (public, signature-verified) |
| `GET` | `/api/v1/payments/order/:orderId` | Get payment details for an order |
| `GET` | `/api/v1/payments/:id` | Get payment details by payment ID |
| `GET` | `/api/v1/payment-methods` | List saved payment methods for authenticated user |
| `POST` | `/api/v1/payment-methods` | Save a new payment method |
| `DELETE` | `/api/v1/payment-methods/:id` | Remove a saved payment method |
| `PATCH` | `/api/v1/payment-methods/:id/default` | Set a payment method as default |

---

### 6.15 Refunds

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/refunds` | Request a refund for a payment |
| `GET` | `/api/v1/refunds` | List refunds for authenticated user |
| `GET` | `/api/v1/refunds/:id` | Get refund details by ID |
| `PATCH` | `/api/v1/refunds/:id/approve` | Approve a refund request (admin) |
| `PATCH` | `/api/v1/refunds/:id/reject` | Reject a refund request (admin) |
| `POST` | `/api/v1/refunds/:id/process` | Process an approved refund through payment gateway (admin) |
| `GET` | `/api/v1/refunds/admin/all` | List all refund requests with filters (admin) |

---

### 6.16 Reviews

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/reviews` | Create a review for a delivered order |
| `GET` | `/api/v1/reviews/order/:orderId` | Get review for a specific order |
| `GET` | `/api/v1/reviews/branch/:branchId` | List all reviews for a branch (with pagination) |
| `GET` | `/api/v1/reviews/delivery-partner/:partnerId` | List reviews for a delivery partner |
| `GET` | `/api/v1/reviews/my-reviews` | List authenticated user's reviews |
| `PUT` | `/api/v1/reviews/:id` | Update a review (within 48 hours) |
| `DELETE` | `/api/v1/reviews/:id` | Soft delete a review |
| `POST` | `/api/v1/reviews/:id/images` | Upload images for a review |
| `DELETE` | `/api/v1/reviews/:id/images/:imageId` | Remove an image from a review |
| `GET` | `/api/v1/reviews/branch/:branchId/summary` | Get aggregated rating summary for a branch |

---

### 6.17 Coupons

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/coupons` | List all active coupons available to the user |
| `GET` | `/api/v1/coupons/:id` | Get coupon details by ID |
| `POST` | `/api/v1/coupons/validate` | Validate a coupon code against an order |
| `POST` | `/api/v1/coupons` | Create a new coupon (admin) |
| `PUT` | `/api/v1/coupons/:id` | Update coupon details (admin) |
| `PATCH` | `/api/v1/coupons/:id/status` | Activate/deactivate a coupon (admin) |
| `DELETE` | `/api/v1/coupons/:id` | Soft delete a coupon (admin) |
| `GET` | `/api/v1/coupons/:id/usage-stats` | Get coupon usage statistics (admin) |
| `GET` | `/api/v1/coupons/admin/all` | List all coupons with filters (admin) |

---

### 6.18 Restaurant Promotions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/restaurants/:restaurantId/promotions` | List active promotions for a restaurant |
| `POST` | `/api/v1/restaurants/:restaurantId/promotions` | Create a new promotion (restaurant owner) |
| `PUT` | `/api/v1/promotions/:id` | Update promotion details |
| `DELETE` | `/api/v1/promotions/:id` | Soft delete a promotion |
| `GET` | `/api/v1/promotions/active` | List all active promotions across restaurants (public) |

---

### 6.19 Loyalty

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/loyalty/balance` | Get loyalty points balance for authenticated user |
| `GET` | `/api/v1/loyalty/transactions` | List loyalty transaction history |
| `POST` | `/api/v1/loyalty/redeem` | Redeem loyalty points on an order |
| `GET` | `/api/v1/loyalty/earn-estimate` | Estimate loyalty points for an order amount |
| `GET` | `/api/v1/loyalty/admin/accounts` | List all loyalty accounts (admin) |
| `GET` | `/api/v1/loyalty/admin/accounts/:userId` | Get loyalty details for a user (admin) |

---

### 6.20 Delivery Partners

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/delivery-partners/register` | Register as a delivery partner |
| `GET` | `/api/v1/delivery-partners/profile` | Get delivery partner profile |
| `PUT` | `/api/v1/delivery-partners/profile` | Update delivery partner profile |
| `PATCH` | `/api/v1/delivery-partners/availability` | Toggle online/offline availability |
| `PATCH` | `/api/v1/delivery-partners/location` | Update current GPS location |
| `GET` | `/api/v1/delivery-partners/earnings` | Get earnings summary |
| `GET` | `/api/v1/delivery-partners/earnings/history` | Get detailed earnings history |
| `GET` | `/api/v1/delivery-partners/deliveries` | List delivery history |
| `GET` | `/api/v1/delivery-partners/deliveries/active` | Get current active delivery |
| `GET` | `/api/v1/delivery-partners/ratings` | Get average rating and review count |

---

### 6.21 Delivery Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/deliveries/:id` | Get delivery details by ID |
| `GET` | `/api/v1/deliveries/order/:orderId` | Get delivery details for an order |
| `PATCH` | `/api/v1/deliveries/:id/accept` | Accept a delivery assignment |
| `PATCH` | `/api/v1/deliveries/:id/reject` | Reject a delivery assignment |
| `PATCH` | `/api/v1/deliveries/:id/pickup` | Confirm order pickup from restaurant |
| `PATCH` | `/api/v1/deliveries/:id/deliver` | Confirm order delivery to customer |
| `GET` | `/api/v1/deliveries/:id/assignments` | Get assignment history for a delivery |

---

### 6.22 Fleet Management (Admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/fleet/partners` | List all delivery partners with filters (admin) |
| `GET` | `/api/v1/fleet/partners/:id` | Get detailed delivery partner info (admin) |
| `PATCH` | `/api/v1/fleet/partners/:id/verify` | Verify/approve a delivery partner (admin) |
| `PATCH` | `/api/v1/fleet/partners/:id/suspend` | Suspend a delivery partner (admin) |
| `PATCH` | `/api/v1/fleet/partners/:id/reactivate` | Reactivate a suspended partner (admin) |
| `GET` | `/api/v1/fleet/partners/online` | List all currently online delivery partners (admin) |
| `GET` | `/api/v1/fleet/partners/:id/deliveries` | Get delivery history for a partner (admin) |
| `GET` | `/api/v1/fleet/analytics` | Get fleet performance analytics (admin) |

---

### 6.23 Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/notifications` | List notifications for authenticated user (paginated) |
| `GET` | `/api/v1/notifications/unread-count` | Get count of unread notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark a notification as read |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all notifications as read |
| `DELETE` | `/api/v1/notifications/:id` | Soft delete a notification |
| `POST` | `/api/v1/notifications/push/subscribe` | Register device for push notifications |
| `DELETE` | `/api/v1/notifications/push/unsubscribe` | Unregister device from push notifications |
| `POST` | `/api/v1/notifications/admin/broadcast` | Send notification to all users or a segment (admin) |

---

### 6.24 Support Tickets

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/support/tickets` | Create a support ticket |
| `GET` | `/api/v1/support/tickets` | List support tickets for authenticated user |
| `GET` | `/api/v1/support/tickets/:id` | Get ticket details |
| `PATCH` | `/api/v1/support/tickets/:id` | Update ticket description or issue type |
| `POST` | `/api/v1/support/tickets/:id/attachments` | Upload attachment to a ticket |
| `DELETE` | `/api/v1/support/tickets/:id/attachments/:attachmentId` | Remove an attachment |
| `GET` | `/api/v1/support/admin/tickets` | List all tickets with filters (admin) |
| `PATCH` | `/api/v1/support/admin/tickets/:id/assign` | Assign ticket to an admin (admin) |
| `PATCH` | `/api/v1/support/admin/tickets/:id/status` | Update ticket status (admin) |
| `PATCH` | `/api/v1/support/admin/tickets/:id/resolve` | Resolve a ticket (admin) |

---

### 6.25 Admin — Platform Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Get platform dashboard KPIs |
| `GET` | `/api/v1/admin/users` | List all users with filters and search |
| `GET` | `/api/v1/admin/users/:id` | Get detailed user information |
| `PATCH` | `/api/v1/admin/users/:id/status` | Activate/deactivate a user account |
| `PATCH` | `/api/v1/admin/users/:id/roles` | Assign or revoke roles for a user |
| `GET` | `/api/v1/admin/restaurants` | List all restaurants with verification status |
| `PATCH` | `/api/v1/admin/restaurants/:id/verify` | Approve/reject restaurant verification |
| `GET` | `/api/v1/admin/branches` | List all branches with verification status |
| `PATCH` | `/api/v1/admin/branches/:id/verify` | Approve/reject/suspend a branch |
| `GET` | `/api/v1/admin/orders` | List all orders platform-wide with filters |
| `GET` | `/api/v1/admin/payments` | List all payments platform-wide |
| `GET` | `/api/v1/admin/refunds` | List all refund requests |
| `GET` | `/api/v1/admin/audit-logs` | View audit logs for critical operations |
| `GET` | `/api/v1/admin/system/health` | System health check endpoint |
| `POST` | `/api/v1/admin/payouts/process` | Process pending delivery partner payouts |
| `GET` | `/api/v1/admin/payouts` | List all payouts with status |

---

### 6.26 Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/platform/overview` | Platform-wide overview (total orders, revenue, users, etc.) |
| `GET` | `/api/v1/analytics/platform/revenue` | Revenue analytics with date range and grouping |
| `GET` | `/api/v1/analytics/platform/orders` | Order volume analytics (daily, weekly, monthly) |
| `GET` | `/api/v1/analytics/platform/users` | User growth and retention analytics |
| `GET` | `/api/v1/analytics/platform/top-restaurants` | Top performing restaurants |
| `GET` | `/api/v1/analytics/platform/top-items` | Most ordered menu items |
| `GET` | `/api/v1/analytics/restaurant/:restaurantId/overview` | Restaurant-level performance overview |
| `GET` | `/api/v1/analytics/restaurant/:restaurantId/revenue` | Restaurant revenue breakdown |
| `GET` | `/api/v1/analytics/restaurant/:restaurantId/orders` | Restaurant order analytics |
| `GET` | `/api/v1/analytics/restaurant/:restaurantId/popular-items` | Popular items for a restaurant |
| `GET` | `/api/v1/analytics/branch/:branchId/overview` | Branch-level performance overview |
| `GET` | `/api/v1/analytics/branch/:branchId/peak-hours` | Peak ordering hours analysis |
| `GET` | `/api/v1/analytics/delivery/overview` | Delivery performance metrics |
| `GET` | `/api/v1/analytics/delivery/partner/:partnerId` | Individual partner performance |
| `GET` | `/api/v1/analytics/customers/segments` | Customer segmentation analytics |
| `GET` | `/api/v1/analytics/customers/lifetime-value` | Customer lifetime value analysis |

---

## 7. Controller List

All controllers follow a consistent pattern: parse request → validate → delegate to service → return formatted response.

| # | Controller Name | Module | Description |
|---|---|---|---|
| 1 | `AuthController` | Authentication | Registration, login, logout, password reset, OTP, token refresh |
| 2 | `UserController` | Users | Profile management, account settings, role retrieval |
| 3 | `AddressController` | Addresses | CRUD operations for user delivery addresses |
| 4 | `RestaurantController` | Restaurants | Restaurant registration, updates, branding, listing |
| 5 | `BranchController` | Branches | Branch CRUD, status management, menu/order retrieval |
| 6 | `OperatingHoursController` | Operating Hours | Branch schedule management |
| 7 | `StaffController` | Restaurant Staff | Staff assignment and removal for branches |
| 8 | `CategoryController` | Menu Categories | Category CRUD and reordering |
| 9 | `MenuItemController` | Menu Items | Item CRUD, images, availability, dietary tags |
| 10 | `ModifierController` | Modifiers | Modifier group and option management |
| 11 | `DietaryTagController` | Dietary Tags | Tag management (admin) |
| 12 | `CartController` | Cart | Cart item management, validation, summary |
| 13 | `OrderController` | Orders | Order placement, status updates, tracking, history |
| 14 | `PaymentController` | Payments | Payment initiation, verification, webhook handling |
| 15 | `RefundController` | Refunds | Refund requests, approval, processing |
| 16 | `ReviewController` | Reviews | Review creation, images, listing, rating summaries |
| 17 | `CouponController` | Coupons | Coupon CRUD, validation, usage statistics |
| 18 | `PromotionController` | Promotions | Restaurant promotion management |
| 19 | `LoyaltyController` | Loyalty | Points balance, transactions, redemption |
| 20 | `DeliveryPartnerController` | Delivery Partners | Partner registration, profile, earnings, availability |
| 21 | `DeliveryController` | Deliveries | Delivery lifecycle — accept, pickup, deliver |
| 22 | `FleetController` | Fleet Management | Fleet oversight, partner verification (admin) |
| 23 | `NotificationController` | Notifications | Notification listing, read status, push subscription |
| 24 | `SupportController` | Support | Ticket creation, attachments, admin management |
| 25 | `AdminController` | Administration | Platform management, user/restaurant/branch oversight |
| 26 | `AnalyticsController` | Analytics | Platform, restaurant, branch, delivery, customer analytics |
| 27 | `PaymentMethodController` | Payment Methods | Saved payment instrument management |
| 28 | `WebhookController` | Webhooks | External webhook handlers (payment gateways) |

---

## 8. Service Layer Design

Services encapsulate all business logic. Controllers never access repositories or external services directly — they always go through the service layer.

### 8.1 AuthService

**Responsibility:** Handles all authentication workflows — user registration with password hashing (bcrypt), login credential verification, JWT access/refresh token generation and validation, OTP generation and verification (via Redis), password reset flow, email verification, and session management via refresh token rotation.

### 8.2 UserService

**Responsibility:** Manages user profile operations — fetching user data with role information, profile updates (name, email, photo), profile photo upload/deletion via StorageService, account deactivation (soft delete), and role retrieval.

### 8.3 AddressService

**Responsibility:** Manages customer delivery addresses — CRUD operations, setting default address, and coordinating with Google Maps APIs for geocoding (address → coordinates) and reverse geocoding (coordinates → address).

### 8.4 RestaurantService

**Responsibility:** Handles restaurant lifecycle — creation by verified restaurant owners, updates, logo/cover image management via StorageService, activation/deactivation, nearby restaurant discovery using geolocation calculations, and ownership verification for authorization.

### 8.5 BranchService

**Responsibility:** Manages restaurant branch operations — creation under a restaurant, GSTIN/FSSAI details, geographic configuration (coordinates, delivery radius), verification status workflow, and branch-level queries including menu aggregation and order retrieval.

### 8.6 OperatingHoursService

**Responsibility:** Manages branch operating schedules — bulk create/update of weekly hours, individual record updates, and real-time "is the branch open now?" checks considering the current day and time.

### 8.7 StaffService

**Responsibility:** Handles restaurant staff assignment — adding users as staff to specific branches, removing staff access, listing staff per branch, and retrieving branches a staff member is assigned to.

### 8.8 CategoryService

**Responsibility:** Manages menu categories within a branch — CRUD operations, display order management, bulk reordering, and cascading soft deletion of child items.

### 8.9 MenuItemService

**Responsibility:** Manages individual menu items — CRUD with category association, image upload/management, availability toggling, bestseller flagging, dietary tag association/dissociation, full-text search across branches, and composite retrieval with modifiers and tags.

### 8.10 ModifierService

**Responsibility:** Handles menu item customization options — modifier group CRUD with selection constraints (min/max, required), modifier option CRUD with pricing, and validation of modifier selections against group rules during order placement.

### 8.11 CartService

**Responsibility:** Manages shopping carts using Redis for fast access — adding items with modifier selections, updating quantities, removing items, clearing carts, pre-checkout validation (item availability, price consistency, modifier validity), and cart summary generation with tax, delivery fee, and discount calculations.

### 8.12 OrderService

**Responsibility:** Orchestrates the complete order lifecycle — cart-to-order conversion with price recalculation, order number generation, coupon validation and application, order status transitions with authorization checks (who can update to which status), order cancellation with refund initiation, order history with pagination and filters, re-ordering, invoice generation, and coordination with PaymentService and DeliveryService.

### 8.13 PaymentService

**Responsibility:** Manages payment processing — creating payment gateway orders (Razorpay/Stripe), verifying payment signatures and amounts from gateway callbacks, processing webhook events, updating payment and order statuses, and coordinating with RefundService for failed/cancelled payments.

### 8.14 RefundService

**Responsibility:** Handles refund lifecycle — creating refund requests from customers, admin review and approval/rejection workflow, initiating refund processing through payment gateway, tracking refund status, and updating related payment and order records.

### 8.15 ReviewService

**Responsibility:** Manages customer reviews — creation with granular ratings (food, delivery, packaging), image upload, review editing within time windows, soft deletion, aggregated rating summary calculation per branch and per delivery partner, and review listing with pagination.

### 8.16 CouponService

**Responsibility:** Manages platform coupons — CRUD operations (admin), coupon code validation against order parameters (minimum amount, validity period, usage limits, per-user limits), discount calculation based on coupon type, and usage tracking/statistics.

### 8.17 PromotionService

**Responsibility:** Handles restaurant-specific promotions — creation by restaurant owners, validation against order context, discount application, and active promotion listing.

### 8.18 LoyaltyService

**Responsibility:** Manages the loyalty points program — account creation for new customers, points earning calculation based on order amount, points redemption during checkout, transaction history retrieval, and balance management.

### 8.19 DeliveryService

**Responsibility:** Manages delivery fulfillment — creating delivery records for confirmed orders, finding and assigning nearest available delivery partners, handling accept/reject responses with automatic re-assignment on rejection/timeout, tracking delivery status transitions (assigned → accepted → picked_up → delivered), and coordinating with TrackingService for real-time location.

### 8.20 FleetService

**Responsibility:** Admin-level fleet management — delivery partner listing with filters, verification/approval workflows, suspension and reactivation, performance metrics per partner, and fleet-wide analytics (active drivers, average delivery time, etc.).

### 8.21 NotificationService

**Responsibility:** Manages in-app and push notifications — creating notification records, dispatching via Socket.IO for real-time delivery, enqueuing push notifications (FCM) via BullMQ, read status tracking, unread count computation, bulk broadcast for admin announcements, and device token management.

### 8.22 SocketService

**Responsibility:** Manages Socket.IO server initialization and event orchestration — authenticating socket connections via JWT, managing rooms (per order, per user, per branch, per delivery partner), broadcasting order status updates, driver location updates, new order notifications, and handling connection/disconnection lifecycle.

### 8.23 TrackingService

**Responsibility:** Manages real-time delivery tracking — receiving GPS location updates from delivery partners, storing latest locations in Redis for fast access, calculating ETAs using Google Distance Matrix API, broadcasting location updates to customers via Socket.IO, and providing location history for analytics.

### 8.24 StorageService

**Responsibility:** Abstracts cloud file storage — provides a unified interface for uploading, deleting, and generating URLs for files across different providers (AWS S3, Cloudinary, Google Cloud Storage). Handles image resizing/compression, file type validation, and storage path organization.

### 8.25 EmailService

**Responsibility:** Manages email delivery — composing and sending transactional emails (registration verification, password reset, order confirmation, delivery confirmation, refund status) via SendGrid/AWS SES through BullMQ queues. Handles email templates and variable substitution.

### 8.26 SmsService

**Responsibility:** Manages SMS delivery — sending OTPs, order confirmations, and delivery updates via Twilio/MSG91 through BullMQ queues. Handles message templates and delivery receipts.

### 8.27 SupportService

**Responsibility:** Manages customer support — ticket creation and categorization, file attachment handling, admin assignment, status workflow management (open → in_progress → resolved → closed), and integration with NotificationService for status update alerts.

### 8.28 AdminService

**Responsibility:** Handles platform administration — dashboard KPI aggregation, user management operations, restaurant/branch verification workflows, global order and payment oversight, audit log retrieval, system health checks, and payout processing coordination.

### 8.29 AnalyticsService

**Responsibility:** Generates business analytics and reports — platform-wide metrics (revenue, orders, users, growth), restaurant-level performance, branch-level insights (peak hours, popular items), delivery metrics (average time, partner performance), customer analytics (segments, lifetime value), and time-series data with configurable grouping (daily, weekly, monthly).

---

## 9. Repository Layer

Repositories provide a clean abstraction over Prisma ORM queries. Each repository is responsible for data access operations for its respective database table(s). Services never call `prisma.xyz.findMany()` directly — they always go through a repository.

| # | Repository | Tables Accessed | Purpose |
|---|---|---|---|
| 1 | `UserRepository` | `users`, `user_roles` | User CRUD, find by email/mobile, role assignment, soft delete |
| 2 | `RoleRepository` | `roles` | Role lookup by name/ID |
| 3 | `AddressRepository` | `user_addresses` | Address CRUD for users, default address management |
| 4 | `RestaurantRepository` | `restaurants` | Restaurant CRUD, search, nearby queries with geo-filtering |
| 5 | `BranchRepository` | `restaurant_branches` | Branch CRUD, verification status updates, geo-radius queries |
| 6 | `OperatingHoursRepository` | `operating_hours` | Schedule CRUD, current-day/time open status check |
| 7 | `StaffRepository` | `restaurant_staff` | Staff-branch assignment queries, active staff listing |
| 8 | `CategoryRepository` | `categories` | Category CRUD within a branch, display order updates |
| 9 | `MenuItemRepository` | `menu_items`, `menu_item_tags` | Item CRUD, tag associations, search, availability updates |
| 10 | `ModifierRepository` | `modifier_groups`, `modifier_options` | Modifier group/option CRUD, item-modifier relationships |
| 11 | `OrderRepository` | `orders`, `order_status_history` | Order CRUD, status transitions, history, complex queries with joins |
| 12 | `OrderItemRepository` | `order_items`, `order_item_modifiers` | Order line items and their modifier snapshots |
| 13 | `PaymentRepository` | `payments`, `payment_methods` | Payment record CRUD, gateway ID lookups, saved methods |
| 14 | `RefundRepository` | `refunds` | Refund CRUD, status updates, payment-refund associations |
| 15 | `ReviewRepository` | `reviews`, `review_images` | Review CRUD, image management, aggregated rating queries |
| 16 | `CouponRepository` | `coupons`, `coupon_usages` | Coupon CRUD, usage tracking, validation queries |
| 17 | `PromotionRepository` | `restaurant_promotions` | Promotion CRUD, active promotion queries |
| 18 | `LoyaltyRepository` | `loyalty_accounts`, `loyalty_transactions` | Account balance, transaction logging, history queries |
| 19 | `DeliveryRepository` | `deliveries`, `delivery_assignments` | Delivery record CRUD, assignment history |
| 20 | `DeliveryPartnerRepository` | `delivery_partners` | Partner CRUD, status updates, availability queries, geo-proximity |
| 21 | `NotificationRepository` | `notifications` | Notification CRUD, unread queries, bulk status updates |
| 22 | `SupportRepository` | `support_tickets`, `ticket_attachments` | Ticket CRUD, assignment, attachment management |
| 23 | `AuditLogRepository` | `audit_logs` (future) | Audit log creation and filtered retrieval |
| 24 | `DietaryTagRepository` | `dietary_tags`, `menu_item_tags` | Tag CRUD and tag-item associations |

---

## 10. Prisma ORM Structure

### 10.1 Why Prisma?

Prisma is chosen as the ORM for this project for the following reasons:

- **Type Safety** — Auto-generated TypeScript client from the schema ensures compile-time query correctness
- **Schema-First Design** — Database schema is defined in a human-readable `.prisma` file that serves as the single source of truth
- **Auto-Generated Migrations** — `prisma migrate dev` generates SQL migration files from schema changes, enabling version-controlled database evolution
- **Powerful Query API** — Supports relations, filtering, pagination, aggregation, and transactions out of the box
- **Introspection** — Can introspect an existing database to generate the schema (useful for migrations from legacy systems)
- **Prisma Studio** — Built-in GUI for browsing and editing database records during development

### 10.2 Prisma Folder Structure

```
server/src/prisma/
├── schema.prisma            # Main schema file with all models, enums, and relations
├── client.ts                # Prisma client singleton (prevents multiple instances in dev)
├── migrations/              # Auto-generated SQL migration files
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240115000000_add_modifiers/
│   │   └── migration.sql
│   ├── 20240201000000_add_delivery/
│   │   └── migration.sql
│   └── migration_lock.toml
└── seed.ts                  # Database seeding script for development/staging
```

### 10.3 Prisma Client Singleton

The Prisma client is instantiated as a singleton to prevent multiple database connections during development (especially with hot-reload):

```
// server/src/prisma/client.ts
// Exports a single PrismaClient instance.
// In development, it is attached to the global object to survive hot-reloads.
// In production, a new instance is created per server process.
```

### 10.4 Schema Organization

The `schema.prisma` file contains:

1. **Generator** — Configures the Prisma client output location and preview features
2. **Datasource** — MySQL connection via `DATABASE_URL` environment variable
3. **Enums** — All enum definitions (OrderStatus, PaymentStatus, VehicleType, etc.)
4. **Models** — All database table definitions with:
   - Field definitions with types, constraints, and defaults
   - Relation decorators (`@relation`) for foreign key relationships
   - Index definitions (`@@index`, `@@unique`)
   - Map decorators (`@@map`) for table name mapping

### 10.5 Migration Strategy

| Environment | Strategy |
|---|---|
| **Development** | `npx prisma migrate dev` — Creates and applies migrations, updates Prisma Client, supports reset |
| **Staging** | `npx prisma migrate deploy` — Applies pending migrations without generating new ones |
| **Production** | `npx prisma migrate deploy` — Runs in CI/CD pipeline before server restart. Always backup before migration. |

**Migration Workflow:**
1. Modify `schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Review generated SQL in `migrations/` directory
4. Commit migration files to version control
5. Deploy: `npx prisma migrate deploy` runs in the CI/CD pipeline

### 10.6 Seeding Strategy

The `seed.ts` script populates the database with initial/default data:

- **Roles** — `CUSTOMER`, `RESTAURANT_OWNER`, `RESTAURANT_STAFF`, `DELIVERY_PARTNER`, `ADMIN`
- **Dietary Tags** — Vegan, Gluten-Free, Nut-Free, Dairy-Free, Spicy, Halal, Jain
- **Admin User** — Default super-admin account
- **Sample Data** (development only) — Test restaurants, branches, menus, users

Seeding is configured in `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node src/prisma/seed.ts"
  }
}
```

Run with: `npx prisma db seed`

### 10.7 Environment Variables

```env
# ─── Prisma Database URL ─────────────────────────────────
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED
#
# Aiven Cloud MySQL Example:
DATABASE_URL="mysql://avnadmin:YOUR_PASSWORD@mysql-project-name.aivencloud.com:12345/food_ordering_db?sslmode=require"
```

---

## 11. Aiven Cloud Database Setup

### 11.1 Why Aiven?

Aiven is a managed cloud database platform chosen for the following reasons:

- **Managed Service** — No manual MySQL installation, patching, or maintenance
- **High Availability** — Multi-node replication with automatic failover
- **Automated Backups** — Daily backups with point-in-time recovery (PITR)
- **SSL/TLS Encryption** — Encrypted connections by default — mandatory for production
- **Monitoring Dashboard** — Built-in metrics for queries, connections, storage, and CPU
- **Multi-Cloud Support** — Available on AWS, GCP, and Azure — reduces vendor lock-in
- **Scalability** — Easily upgrade compute and storage tiers as the platform grows
- **Developer-Friendly** — Provides connection strings compatible with Prisma, Knex, Sequelize

### 11.2 Connection Architecture

```
Express Server (Node.js)
     │
     ▼
Prisma ORM Client
     │
     ▼ (SSL/TLS Encrypted Connection)
     │
     ▼
Aiven MySQL Service
├── Primary Node (Read/Write)
├── Standby Node (Automatic Failover)
└── Backup Node (Point-in-Time Recovery)
```

### 11.3 SSL Requirements

Aiven **requires** SSL for all database connections in production. Prisma handles this via the connection string:

```env
# SSL mode in connection string
DATABASE_URL="mysql://avnadmin:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"
```

For connections requiring a CA certificate:
```env
# Download the CA certificate from the Aiven console
# Place it in the project (DO NOT commit to version control)
DATABASE_URL="mysql://avnadmin:PASSWORD@HOST:PORT/DB_NAME?sslmode=require&sslcert=/path/to/ca.pem"
```

### 11.4 Environment Variables

```env
# ─── Aiven MySQL Configuration ─────────────────────────────
DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@mysql-food-ordering.aivencloud.com:12345/food_ordering_db?sslmode=require"

# Individual connection parameters (for non-Prisma uses)
DB_HOST="mysql-food-ordering.aivencloud.com"
DB_PORT=12345
DB_USER="avnadmin"
DB_PASSWORD="YOUR_AIVEN_PASSWORD"
DB_NAME="food_ordering_db"
DB_SSL_MODE="require"
```

### 11.5 Production Considerations

| Concern | Strategy |
|---|---|
| **Connection Pooling** | Prisma manages a connection pool. Configure `connection_limit` in the DATABASE_URL (e.g., `?connection_limit=10`). For serverless, consider Prisma Accelerate or PgBouncer-equivalent for MySQL. |
| **Query Performance** | Use Prisma's `@index` decorators. Monitor slow queries via Aiven's query statistics. Add composite indexes for frequently filtered columns. |
| **Data Volume** | Start with Aiven's Hobbyist/Startup plan. Upgrade to Business/Premium for production. Monitor storage usage and upgrade proactively. |
| **Regional Latency** | Deploy the Aiven service in the same cloud region as your application servers to minimize latency. |
| **Max Connections** | Aiven plans have connection limits. Ensure `connection_limit` in Prisma does not exceed the plan's max connections across all server instances. |

### 11.6 Backup Strategy

| Backup Type | Frequency | Retention | Provided By |
|---|---|---|---|
| **Automated Daily Backups** | Every 24 hours | 2–30 days (plan dependent) | Aiven (automatic) |
| **Point-in-Time Recovery** | Continuous binlog | Up to retention period | Aiven (automatic) |
| **Manual Backups** | Before major migrations | Indefinite (stored in S3/GCS) | Team (manual mysqldump or Aiven fork) |
| **Schema Version Control** | Every migration | Indefinite (Git history) | Prisma migrations in Git |

**Disaster Recovery Plan:**
1. Aiven automatically promotes standby to primary on failure
2. For data corruption: use PITR to restore to a point before the corruption
3. For catastrophic failure: restore from the latest daily backup
4. All Prisma migrations are in version control — schema can be reproduced from scratch

---

## 12. Redis Usage

Redis serves as the in-memory data layer for multiple performance-critical and real-time features.

### 12.1 Cart Storage

**Purpose:** Store active shopping carts for fast read/write access without hitting the MySQL database on every cart operation.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `cart:{userId}` | Hash | 24 hours | Cart items with quantities and modifier selections |
| `cart:{userId}:branch` | String | 24 hours | Branch ID associated with the cart (single-branch cart enforcement) |

**Why Redis over MySQL for carts?**
- Carts are temporary, high-frequency, and transient — not suitable for relational storage
- Sub-millisecond reads/writes vs 5–20ms for MySQL queries
- Automatic TTL-based expiration eliminates abandoned cart cleanup
- Cart data is structured as a Redis Hash for atomic field updates

### 12.2 Rate Limiting

**Purpose:** Protect APIs from abuse, brute-force attacks, and DDoS using Redis-backed sliding window counters.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `ratelimit:{ip}:{endpoint}` | String (counter) | 1–15 minutes | Request count per IP per endpoint |
| `ratelimit:auth:{ip}` | String (counter) | 15 minutes | Login attempt counter (stricter limit) |
| `ratelimit:otp:{mobile}` | String (counter) | 1 hour | OTP request counter per mobile number |

**Rate Limits:**

| Endpoint Category | Limit | Window |
|---|---|---|
| General API | 100 requests | 1 minute |
| Authentication (login) | 5 attempts | 15 minutes |
| OTP Requests | 3 requests | 1 hour |
| Order Placement | 10 requests | 1 minute |
| File Uploads | 20 requests | 5 minutes |

### 12.3 OTP Storage

**Purpose:** Store one-time passwords with automatic expiration for secure verification.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `otp:{mobile}:{purpose}` | String | 5 minutes | OTP code for registration/login/password-reset |
| `otp:attempts:{mobile}` | String (counter) | 30 minutes | Failed OTP verification attempt counter |

**Why Redis?**
- OTPs are inherently temporary (5-minute lifetime)
- Redis TTL automatically removes expired OTPs without cleanup jobs
- Atomic operations prevent race conditions in OTP verification

### 12.4 Session Management

**Purpose:** Store active session metadata and manage JWT blacklisting for logout.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `session:{userId}:{deviceId}` | Hash | 7 days | Active session metadata (device info, IP, last active) |
| `token:blacklist:{jti}` | String | Access token TTL | Blacklisted JWT token IDs (for logout before expiry) |

### 12.5 Real-Time Tracking

**Purpose:** Store delivery partner GPS coordinates for real-time tracking with minimal latency.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `driver:location:{partnerId}` | Hash | 5 minutes | Latest GPS coordinates (lat, lng, heading, speed, timestamp) |
| `driver:active:{partnerId}` | String | 30 seconds | Online status heartbeat |
| `delivery:eta:{orderId}` | String | 1 minute | Cached ETA to customer address |
| `drivers:online` | Sorted Set | — | Online drivers sorted by last update timestamp |

### 12.6 Caching

**Purpose:** Cache frequently accessed, rarely changing data to reduce MySQL load.

| Key Pattern | Data Type | TTL | Description |
|---|---|---|---|
| `restaurant:{id}` | String (JSON) | 10 minutes | Restaurant details |
| `branch:{id}:menu` | String (JSON) | 5 minutes | Full branch menu (categories + items + modifiers) |
| `branch:{id}:hours` | String (JSON) | 30 minutes | Branch operating hours |
| `branch:{id}:reviews:summary` | String (JSON) | 15 minutes | Aggregated rating summary |
| `nearby:restaurants:{lat}:{lng}:{radius}` | String (JSON) | 2 minutes | Nearby restaurant results |
| `coupon:active` | String (JSON) | 5 minutes | List of active coupons |
| `dietary:tags` | String (JSON) | 1 hour | All dietary tags |

**Cache Invalidation Strategy:**
- Write-through: Update cache immediately when data is modified
- TTL-based: Let cache expire naturally for infrequently updated data
- Manual invalidation: Explicitly delete cache keys when critical data changes (e.g., menu price update)

---

## 13. Socket.IO Events

Socket.IO is used for all real-time bidirectional communication. Events are organized by namespace and domain.

### 13.1 Connection & Authentication

| Event | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Client → Server | `{ token: string }` | Client connects with JWT in handshake auth. Server verifies token and assigns to appropriate rooms. |
| `disconnect` | Client → Server | — | Client disconnects. Server cleans up room memberships. |
| `error` | Server → Client | `{ message: string, code: string }` | Authentication failure or connection error. |

### 13.2 Order Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `order:created` | Server → Restaurant | `{ orderId, orderNumber, items, total, customerName }` | New order notification to the branch dashboard |
| `order:confirmed` | Server → Customer | `{ orderId, estimatedTime }` | Restaurant confirmed and started processing the order |
| `order:preparing` | Server → Customer | `{ orderId }` | Restaurant has begun preparing the food |
| `order:ready` | Server → Customer, Delivery Partner | `{ orderId, branchAddress }` | Food is ready for pickup |
| `order:picked_up` | Server → Customer | `{ orderId, driverName, driverPhone }` | Delivery partner has picked up the order |
| `order:out_for_delivery` | Server → Customer | `{ orderId, estimatedDelivery }` | Order is en route to the customer |
| `order:delivered` | Server → Customer | `{ orderId, deliveredAt }` | Order has been successfully delivered |
| `order:cancelled` | Server → Customer, Restaurant | `{ orderId, reason, refundStatus }` | Order has been cancelled |
| `order:status_updated` | Server → All Subscribers | `{ orderId, oldStatus, newStatus, updatedBy, timestamp }` | Generic order status change broadcast |

### 13.3 Delivery & Tracking Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `delivery:assignment_new` | Server → Delivery Partner | `{ deliveryId, orderId, pickupAddress, dropAddress, estimatedDistance, estimatedEarning }` | New delivery assignment offered to the nearest partner |
| `delivery:accepted` | Server → Restaurant, Customer | `{ deliveryId, driverName, driverPhone, vehicleType, vehicleNumber }` | Delivery partner accepted the assignment |
| `delivery:rejected` | Delivery Partner → Server | `{ deliveryId, reason }` | Delivery partner rejected the assignment (triggers re-assignment) |
| `delivery:picked_up` | Server → Customer | `{ deliveryId, orderId }` | Partner picked up the order from restaurant |
| `delivery:completed` | Server → Customer, Restaurant | `{ deliveryId, orderId, deliveredAt }` | Delivery completed successfully |
| `driver:location_update` | Delivery Partner → Server | `{ lat, lng, heading, speed, timestamp }` | GPS coordinates update from delivery partner (every 5 seconds) |
| `driver:location_broadcast` | Server → Customer | `{ lat, lng, heading, speed, eta, timestamp }` | Location update broadcast to the tracking customer |
| `driver:online` | Delivery Partner → Server | `{ partnerId }` | Partner came online and is available for deliveries |
| `driver:offline` | Delivery Partner → Server | `{ partnerId }` | Partner went offline |

### 13.4 Notification Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `notification:new` | Server → User | `{ id, title, message, type, createdAt }` | New in-app notification pushed to the user |
| `notification:read` | Client → Server | `{ notificationId }` | User marked a notification as read |
| `notification:unread_count` | Server → User | `{ count }` | Updated unread notification count |

### 13.5 Admin Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `admin:new_registration` | Server → Admin | `{ type, entityId, name }` | New restaurant or delivery partner registration pending verification |
| `admin:support_ticket` | Server → Admin | `{ ticketId, issueType, customerName }` | New support ticket created |
| `admin:refund_request` | Server → Admin | `{ refundId, amount, orderId }` | New refund request for review |

### 13.6 Room Structure

| Room Name | Members | Purpose |
|---|---|---|
| `user:{userId}` | Individual user | Personal notifications, order updates |
| `order:{orderId}` | Customer, Restaurant Staff, Delivery Partner | Order-specific real-time updates |
| `branch:{branchId}` | Branch staff members | New order notifications, branch-level updates |
| `driver:{partnerId}` | Individual delivery partner | Delivery assignments, route updates |
| `admin` | All admin users | Platform-wide alerts, verification requests |

---

## 14. Background Jobs

Background jobs are processed using **BullMQ** with Redis as the message broker. Jobs are enqueued by services and processed asynchronously by worker processes.

### 14.1 Email Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `SEND_WELCOME_EMAIL` | User registration | Welcome email with verification link |
| `SEND_OTP_EMAIL` | OTP request (email) | OTP delivery via email |
| `SEND_PASSWORD_RESET_EMAIL` | Forgot password | Password reset link/token via email |
| `SEND_ORDER_CONFIRMATION_EMAIL` | Order placed + payment success | Order confirmation with details |
| `SEND_ORDER_DELIVERED_EMAIL` | Order delivered | Delivery confirmation with review prompt |
| `SEND_REFUND_STATUS_EMAIL` | Refund status change | Refund approval/rejection/completion notification |
| `SEND_RESTAURANT_VERIFICATION_EMAIL` | Branch verification decision | Approval/rejection notification to restaurant owner |

### 14.2 SMS Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `SEND_OTP_SMS` | OTP request (mobile) | OTP delivery via SMS |
| `SEND_ORDER_STATUS_SMS` | Order status change | Order status update to customer mobile |
| `SEND_DELIVERY_ASSIGNMENT_SMS` | New delivery assignment | Assignment notification to delivery partner |

### 14.3 Push Notification Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `SEND_ORDER_UPDATE_PUSH` | Order status change | Push notification with order status |
| `SEND_DELIVERY_ASSIGNMENT_PUSH` | New delivery assignment | Push to nearest delivery partner |
| `SEND_PROMOTION_PUSH` | New promotion/coupon | Promotional push to customer segments |
| `SEND_REVIEW_REMINDER_PUSH` | 1 hour after delivery | Reminder to review the order |

### 14.4 Refund Processing Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `PROCESS_REFUND` | Admin approves refund | Initiates refund through payment gateway API |
| `CHECK_REFUND_STATUS` | Scheduled (every 15 min) | Polls payment gateway for pending refund status updates |
| `NOTIFY_REFUND_COMPLETE` | Refund completed | Notifies customer via email, SMS, and push |

### 14.5 Payout Processing Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `CALCULATE_PARTNER_PAYOUT` | Scheduled (weekly) | Calculates delivery partner earnings for the payout period |
| `PROCESS_PARTNER_PAYOUT` | Admin triggers payout | Initiates bank transfer to delivery partner |
| `CALCULATE_RESTAURANT_SETTLEMENT` | Scheduled (daily/weekly) | Calculates restaurant settlement amounts |

### 14.6 Order Management Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `AUTO_CANCEL_UNPAID_ORDER` | Order placed | Automatically cancels order if payment not received within 15 minutes |
| `AUTO_CANCEL_UNCONFIRMED_ORDER` | Order paid | Automatically cancels if restaurant doesn't confirm within 10 minutes |
| `REASSIGN_DELIVERY` | Delivery assignment timeout | Re-assigns delivery to next available partner if current one doesn't respond in 60 seconds |

### 14.7 Analytics Jobs

| Job Name | Trigger | Description |
|---|---|---|
| `AGGREGATE_DAILY_ANALYTICS` | Scheduled (midnight daily) | Aggregates daily platform metrics |
| `GENERATE_WEEKLY_REPORT` | Scheduled (Monday 6 AM) | Generates weekly performance reports for restaurant owners |
| `CLEANUP_EXPIRED_SESSIONS` | Scheduled (daily) | Removes expired session data from Redis |
| `CLEANUP_EXPIRED_CARTS` | Scheduled (every 6 hours) | Removes abandoned carts older than 24 hours |

---

## 15. Security Architecture

### 15.1 JWT (JSON Web Tokens)

- **Access Token** — Short-lived (15 minutes), contains user ID, email, and roles in payload. Sent in `Authorization: Bearer <token>` header.
- **Token Structure** — Header (algorithm: HS256/RS256), Payload (sub, email, roles, iat, exp, jti), Signature
- **Storage** — Access tokens stored in memory (not localStorage). Refresh tokens stored in httpOnly cookies.
- **JTI (JWT ID)** — Each token has a unique identifier for individual token revocation

### 15.2 Refresh Tokens

- **Long-lived** (7 days) with **rotation** — each refresh generates a new refresh token and invalidates the old one
- **Stored in database** — linked to user ID and device identifier for multi-device session management
- **Sent via httpOnly, Secure, SameSite=Strict cookie** — inaccessible to JavaScript, preventing XSS token theft
- **Family-based detection** — if a previously rotated (used) refresh token is presented, all tokens in the family are revoked (token theft detection)

### 15.3 Role-Based Access Control (RBAC)

| Role | Access Level |
|---|---|
| `CUSTOMER` | Browse restaurants, manage cart, place orders, manage addresses, write reviews, use coupons, loyalty points |
| `RESTAURANT_OWNER` | Manage owned restaurants, branches, menus, staff, promotions, view branch analytics |
| `RESTAURANT_STAFF` | Manage orders and menus for assigned branches only |
| `DELIVERY_PARTNER` | Manage availability, accept/reject deliveries, update location, view earnings |
| `ADMIN` | Full platform access — user management, verifications, refunds, analytics, audit logs |

- RBAC middleware checks `req.user.roles` against the required role(s) for each endpoint
- Some endpoints support multiple roles (e.g., order status update: `RESTAURANT_STAFF`, `DELIVERY_PARTNER`, `ADMIN`)
- Resource-level authorization ensures users can only access their own data (e.g., a restaurant owner can only manage their own restaurants)

### 15.4 Rate Limiting

- **Redis-backed sliding window** rate limiter applied globally and per-endpoint
- **Tiered limits** based on endpoint sensitivity (stricter for auth, looser for reads)
- **IP-based** for unauthenticated endpoints, **user-based** for authenticated endpoints
- Returns `429 Too Many Requests` with `Retry-After` header
- See [Section 12.2](#122-rate-limiting) for specific limits

### 15.5 Password Hashing

- **bcrypt** with a salt round factor of 12
- Passwords are never stored in plain text, never logged, and never returned in API responses
- Password strength validation via Zod schemas (minimum 8 characters, requires uppercase, lowercase, digit, special character)

### 15.6 Input Validation

- **Zod schemas** validate every request body, query parameter, and URL parameter
- Validation middleware runs before the controller — invalid requests are rejected with 400 status and detailed error messages
- Type coercion and sanitization handled by Zod transformers
- Enum values validated against Prisma-generated TypeScript enums

### 15.7 SQL Injection Protection

- **Prisma ORM** uses parameterized queries for all database operations — user input is never interpolated into SQL strings
- Raw queries (if needed) use Prisma's `$queryRaw` with tagged template literals that auto-parameterize
- No string concatenation for query construction

### 15.8 Prisma-Specific Security

- Prisma client is auto-generated and type-safe — invalid field names or types cause compile-time errors
- Prisma's query engine runs as a Rust binary — no JavaScript-level SQL string manipulation
- Relation filters prevent unauthorized data access across relations when properly scoped

### 15.9 XSS Protection

- **Helmet.js** sets security headers including `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- HTML entities are escaped in all user-generated content before storage
- React's JSX auto-escapes rendered content by default on the frontend
- `dangerouslySetInnerHTML` is never used

### 15.10 CSRF Protection

- **SameSite=Strict** cookies prevent cross-origin cookie submission
- API-only backend (no server-rendered forms) — CSRF attacks have limited surface area
- CORS whitelist restricts cross-origin requests to known frontend domains
- For sensitive operations (payment, delete), additional confirmation tokens can be implemented

### 15.11 Additional Security Measures

| Measure | Implementation |
|---|---|
| **HTTPS Only** | SSL termination at Nginx. HSTS header enforced. |
| **CORS** | Strict origin whitelist configured per environment |
| **File Upload Validation** | File type checking (magic bytes + extension), size limits (5MB images, 10MB documents) |
| **Environment Variables** | Secrets loaded from `.env` files — never hardcoded, never committed to Git |
| **Dependency Auditing** | `npm audit` in CI/CD pipeline. Dependabot/Renovate for automated updates. |
| **Error Handling** | Production errors return generic messages. Stack traces only in development. |
| **Logging** | Sensitive data (passwords, tokens, card numbers) is never logged |

---

## 16. Deployment Architecture

### 16.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     LOAD BALANCER / CDN                       │   │
│  │            (Cloudflare / AWS CloudFront)                      │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                              │                                       │
│        ┌─────────────────────┼─────────────────────┐                │
│        ▼                     ▼                     ▼                │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐            │
│  │  Nginx   │         │  Nginx   │         │  Nginx   │            │
│  │ Server 1 │         │ Server 2 │         │ Server N │            │
│  │          │         │          │         │          │            │
│  │ ┌──────┐ │         │ ┌──────┐ │         │ ┌──────┐ │            │
│  │ │React │ │         │ │React │ │         │ │React │ │            │
│  │ │Static│ │         │ │Static│ │         │ │Static│ │            │
│  │ └──────┘ │         │ └──────┘ │         │ └──────┘ │            │
│  │ ┌──────┐ │         │ ┌──────┐ │         │ ┌──────┐ │            │
│  │ │Node  │ │         │ │Node  │ │         │ │Node  │ │            │
│  │ │(PM2) │ │         │ │(PM2) │ │         │ │(PM2) │ │            │
│  │ └──────┘ │         │ └──────┘ │         │ └──────┘ │            │
│  └──────────┘         └──────────┘         └──────────┘            │
│        │                     │                     │                │
│        └─────────────────────┼─────────────────────┘                │
│                              │                                       │
│        ┌─────────────────────┼─────────────────────┐                │
│        ▼                                           ▼                │
│  ┌──────────────────┐                  ┌──────────────────┐        │
│  │   Aiven MySQL    │                  │      Redis       │        │
│  │   (Managed)      │                  │   (Managed /     │        │
│  │                  │                  │    Self-hosted)   │        │
│  └──────────────────┘                  └──────────────────┘        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL SERVICES                          │   │
│  │  Razorpay  │  Google Maps  │  SendGrid  │  Twilio  │  S3     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 16.2 Frontend Deployment

| Aspect | Strategy |
|---|---|
| **Build** | `npm run build` → generates optimized static files in `dist/` |
| **Hosting** | Nginx serves static files directly OR deploy to Vercel/Netlify/AWS S3+CloudFront |
| **CDN** | Cloudflare or AWS CloudFront for global edge caching |
| **Routing** | SPA fallback configured: all routes return `index.html`, React Router handles client-side routing |
| **Environment** | Build-time environment variables injected via `.env.production` |
| **Caching** | Static assets served with long cache headers. Filename hashing for cache busting. |

### 16.3 Backend Deployment

| Aspect | Strategy |
|---|---|
| **Runtime** | Node.js 18+ LTS |
| **Process Manager** | PM2 in cluster mode — spawns one process per CPU core for load distribution |
| **Reverse Proxy** | Nginx proxies HTTP/WebSocket to Node.js processes (`proxy_pass`, `proxy_http_version 1.1` for WebSocket) |
| **Container** | Docker image with multi-stage build (build stage → production stage) |
| **Startup** | `prisma migrate deploy` runs first, then `pm2 start ecosystem.config.js` |
| **Health Check** | `/api/v1/health` endpoint returns server status, DB connectivity, Redis connectivity |

### 16.4 Database Deployment

| Aspect | Strategy |
|---|---|
| **Provider** | Aiven Cloud MySQL |
| **Region** | Same cloud region as application servers |
| **Plan** | Startup plan for staging, Business plan for production |
| **Backups** | Automated daily by Aiven, manual before migrations |
| **Migrations** | `npx prisma migrate deploy` runs in CI/CD pipeline before server restart |

### 16.5 Redis Deployment

| Aspect | Strategy |
|---|---|
| **Provider** | Aiven Redis, AWS ElastiCache, or self-hosted in Docker |
| **Persistence** | RDB snapshots + AOF for durability |
| **Memory Policy** | `allkeys-lru` eviction when memory limit is reached |
| **Replication** | Primary-replica setup for production with read replicas |

### 16.6 Environment Separation

| Environment | Purpose | Database | Redis | URL |
|---|---|---|---|---|
| **Development** | Local development | Local MySQL / Docker | Docker Redis | `localhost:3000` |
| **Staging** | Pre-production testing, QA | Aiven MySQL (staging instance) | Aiven Redis (staging) | `staging.foodfleet.com` |
| **Production** | Live platform | Aiven MySQL (production instance) | Aiven Redis (production) | `app.foodfleet.com` |

Each environment has its own:
- `.env` file with environment-specific values
- Database instance (never share a database between environments)
- Redis instance
- Payment gateway keys (sandbox for dev/staging, live for production)
- API keys for external services

---

## 17. Development Workflow

### 17.1 Git Flow

The project follows a **Git Flow** branching model adapted for continuous delivery:

```
main (production)
 │
 ├── develop (integration branch)
 │    │
 │    ├── feature/auth-module
 │    ├── feature/restaurant-module
 │    ├── feature/order-flow
 │    ├── fix/cart-total-calculation
 │    └── refactor/payment-service
 │
 ├── release/v1.0.0 (release candidate)
 │
 └── hotfix/critical-payment-bug
```

### 17.2 Branch Strategy

| Branch | Purpose | Created From | Merges Into |
|---|---|---|---|
| `main` | Production-ready code. Every commit is deployed. | — | — |
| `develop` | Integration branch. Latest development changes. | `main` | `release/*` |
| `feature/*` | New features (e.g., `feature/cart-module`) | `develop` | `develop` |
| `fix/*` | Bug fixes (e.g., `fix/order-status-update`) | `develop` | `develop` |
| `refactor/*` | Code refactoring without behavior change | `develop` | `develop` |
| `release/*` | Release preparation (version bumps, final testing) | `develop` | `main` + `develop` |
| `hotfix/*` | Critical production fixes | `main` | `main` + `develop` |

### 17.3 Branch Naming Convention

```
feature/TICKET-123-add-loyalty-module
fix/TICKET-456-cart-price-calculation
refactor/TICKET-789-payment-service-cleanup
hotfix/TICKET-100-payment-webhook-crash
```

### 17.4 Commit Message Convention

Follow **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code formatting (no logic change)
- `refactor` — Code restructuring (no behavior change)
- `perf` — Performance improvement
- `test` — Adding or updating tests
- `chore` — Build process, dependency updates
- `ci` — CI/CD configuration changes

**Examples:**
```
feat(order): add order cancellation with refund initiation
fix(cart): correct tax calculation for multi-item carts
docs(readme): add Socket.IO events documentation
refactor(payment): extract webhook verification to helper
test(auth): add integration tests for token refresh flow
```

### 17.5 PR Process

1. **Create Feature Branch** — Branch from `develop` with descriptive name
2. **Develop & Test Locally** — Write code, run unit tests, verify with Postman/Thunder Client
3. **Push & Create PR** — Push branch, create pull request targeting `develop`
4. **PR Template** — Fill out PR description template (what, why, how, testing steps, screenshots)
5. **Automated Checks** — CI pipeline runs: lint, type check, unit tests, build
6. **Code Review** — Minimum 1 approval required (2 for critical modules: auth, payment, order)
7. **Address Feedback** — Resolve review comments, push additional commits
8. **Merge** — Squash merge into `develop`; CI deploys to staging
9. **Verify on Staging** — QA testing on staging environment

### 17.6 Code Review Process

**Reviewer Checklist:**

- [ ] Code follows project architecture (controller → service → repository)
- [ ] TypeScript types are properly defined — no `any` types without justification
- [ ] Input validation schemas are present for new endpoints
- [ ] Error handling follows project conventions (ApiError, asyncHandler)
- [ ] Database queries are efficient — proper indexes, avoid N+1 queries
- [ ] Security considerations — authorization checks, input sanitization
- [ ] Unit tests cover new business logic
- [ ] API response format matches project standard
- [ ] No hardcoded values — configuration is in environment variables
- [ ] No sensitive data in logs
- [ ] Edge cases are handled (empty results, null values, concurrent access)

---

## 18. Future Enhancements

### v2.0 — Planned Features

| # | Feature | Description |
|---|---|---|
| 1 | **Multi-Language Support (i18n)** | Localize the platform for multiple languages — Hindi, Gujarati, Tamil, etc. |
| 2 | **Live Chat Support** | Real-time chat between customers and support agents via Socket.IO |
| 3 | **AI-Powered Recommendations** | Personalized menu item recommendations based on order history and preferences |
| 4 | **Subscription Plans** | Monthly meal subscription plans for regular customers |
| 5 | **Group Ordering** | Collaborative cart where multiple users contribute items to a single order |
| 6 | **Scheduled Orders** | Place orders for future delivery at a specified date and time |
| 7 | **Multi-Restaurant Orders** | Single order with items from multiple restaurants (with separate deliveries) |
| 8 | **Dynamic Pricing / Surge** | Adjust delivery fees and prices based on demand, weather, and time of day |
| 9 | **Restaurant POS Integration** | Integrate with popular POS systems (Square, Toast) for order relay |
| 10 | **Kitchen Display System (KDS)** | Dedicated display for kitchen staff showing incoming orders with timers |
| 11 | **Advanced Analytics Dashboard** | Business intelligence with charts, heatmaps, and exportable reports |
| 12 | **Referral Program** | Earn loyalty points or discounts for referring new customers |
| 13 | **Table Reservation & Dine-In Orders** | Extend beyond delivery to dine-in with QR code menu and ordering |
| 14 | **Dark Kitchen / Virtual Brands** | Support virtual restaurant brands operating from a single kitchen |
| 15 | **Voice Ordering (Alexa / Google Assistant)** | Voice-activated ordering through smart speakers |
| 16 | **Automated Tax Reporting** | Generate GST-compliant tax reports for restaurants and the platform |
| 17 | **Driver Navigation Integration** | In-app turn-by-turn navigation using Google Maps Directions API |
| 18 | **Photo-Based Menu Upload** | Upload a physical menu photo and use OCR to digitize items |
| 19 | **A/B Testing Framework** | Built-in A/B testing for UI changes, promotions, and pricing strategies |
| 20 | **Microservices Migration** | Decompose the monolith into microservices for independent scaling |

---

## 19. Team Responsibilities

### 19.1 Backend Team

| Responsibility | Details |
|---|---|
| **API Development** | Design and implement all REST API endpoints following the controller-service-repository pattern |
| **Business Logic** | Implement order flow, payment processing, delivery assignment, loyalty, and coupon logic |
| **Authentication & Security** | JWT flow, RBAC, rate limiting, input validation, password hashing |
| **Real-Time Features** | Socket.IO event handling, room management, delivery tracking |
| **Background Jobs** | BullMQ queue setup, job processors for emails, SMS, notifications, refunds |
| **Database Access** | Repository implementations, Prisma queries, query optimization |
| **External Integrations** | Payment gateway, Google Maps, email/SMS providers, cloud storage |
| **API Documentation** | Swagger/OpenAPI documentation for all endpoints |
| **Unit & Integration Testing** | Jest tests for services, Supertest tests for API endpoints |

### 19.2 Frontend Team

| Responsibility | Details |
|---|---|
| **Customer Portal** | Restaurant browsing, menu viewing, cart, checkout, order tracking, reviews, loyalty |
| **Restaurant Portal** | Dashboard, menu management, order management, staff management, analytics |
| **Delivery Partner Portal** | Delivery assignment, GPS tracking, earnings dashboard |
| **Admin Portal** | Platform dashboard, user management, verifications, analytics |
| **Component Library** | Reusable UI components — buttons, forms, modals, tables, cards |
| **State Management** | Zustand/Redux stores for cart, auth, notifications |
| **API Integration** | Axios service layer with interceptors for auth, error handling |
| **Real-Time UI** | Socket.IO client for live order status, delivery tracking, notifications |
| **Maps Integration** | Google Maps for restaurant discovery, address picker, delivery tracking |
| **Responsive Design** | Mobile-first, responsive layouts using Tailwind CSS |
| **Accessibility** | ARIA labels, keyboard navigation, screen reader support |

### 19.3 Database Team

| Responsibility | Details |
|---|---|
| **Schema Design** | Design and review Prisma schema for correctness, normalization, and performance |
| **Migration Management** | Create, review, and test database migrations |
| **Indexing Strategy** | Identify and create indexes for frequently queried columns and composite queries |
| **Seeding Scripts** | Maintain seed data for development, staging, and testing |
| **Query Optimization** | Analyze slow queries, add indexes, optimize N+1 issues |
| **Data Integrity** | Enforce foreign key constraints, unique constraints, and data validation at DB level |
| **Backup Verification** | Regularly test backup restoration procedures |
| **Performance Monitoring** | Monitor query performance via Aiven's dashboard and Prisma metrics |

### 19.4 DevOps Team

| Responsibility | Details |
|---|---|
| **CI/CD Pipeline** | GitHub Actions / GitLab CI for automated build, test, lint, and deploy |
| **Docker Configuration** | Dockerfile and docker-compose for local development and production |
| **Infrastructure Setup** | Cloud server provisioning, Nginx configuration, SSL certificates |
| **Environment Management** | Manage `.env` files, secrets, and configuration per environment |
| **Monitoring & Alerting** | Set up Sentry for error tracking, Grafana/Prometheus for metrics, PagerDuty for alerts |
| **Log Management** | Centralized log aggregation and search (ELK stack or CloudWatch) |
| **Security Hardening** | Firewall rules, SSH key management, regular security audits |
| **Performance Testing** | Load testing with k6 or Artillery, identify bottlenecks |
| **Scaling Strategy** | Horizontal scaling configuration, auto-scaling policies |
| **Disaster Recovery** | Backup verification, failover procedures, runbook documentation |

---

## 20. Project Roadmap

### Phase 1 — Foundation & Authentication (Weeks 1–2)

| Task | Details |
|---|---|
| Project scaffolding | Initialize Node.js + TypeScript + Express project structure |
| Prisma setup | Configure Prisma with Aiven MySQL, create initial schema |
| Users & Roles schema | Implement `users`, `roles`, `user_roles` tables |
| Auth module | Registration, login, logout, JWT + refresh tokens, OTP, password reset |
| RBAC middleware | Role-based access control middleware |
| Rate limiting | Redis-backed rate limiter |
| Validation layer | Zod schemas and validation middleware |
| Error handling | Global error handler, custom ApiError class |
| Logging | Winston + Morgan setup |
| **Deliverable** | Working authentication system with role management |

### Phase 2 — Restaurant Module (Weeks 3–4)

| Task | Details |
|---|---|
| Restaurant schema | `restaurants`, `restaurant_branches`, `operating_hours`, `restaurant_staff` tables |
| Restaurant CRUD | Create, update, activate/deactivate restaurants |
| Branch management | Branch CRUD, GSTIN/FSSAI, geo-coordinates, delivery radius |
| Operating hours | Weekly schedule management per branch |
| Staff management | Staff assignment and access control at branch level |
| File uploads | Logo and cover image upload to cloud storage |
| Restaurant discovery | Nearby restaurants query using coordinates and radius |
| **Deliverable** | Fully functional restaurant and branch management |

### Phase 3 — Menu Module (Weeks 5–6)

| Task | Details |
|---|---|
| Menu schema | `categories`, `menu_items`, `dietary_tags`, `menu_item_tags`, `modifier_groups`, `modifier_options` |
| Category management | Category CRUD with display ordering |
| Menu item management | Item CRUD, images, availability, bestseller, search |
| Dietary tags | Tag management and item-tag associations |
| Modifier system | Modifier group/option CRUD with selection rules |
| Menu caching | Redis caching for branch menus |
| **Deliverable** | Complete menu management with customization support |

### Phase 4 — Cart Module (Week 7)

| Task | Details |
|---|---|
| Redis cart | Cart storage in Redis with item management |
| Cart operations | Add, update, remove items with modifier selections |
| Cart validation | Pre-checkout validation (availability, pricing, modifier rules) |
| Price calculation | Subtotal, tax, delivery fee estimation |
| Single-branch enforcement | Ensure all cart items are from the same branch |
| **Deliverable** | Functional cart system with real-time pricing |

### Phase 5 — Order Module (Weeks 8–9)

| Task | Details |
|---|---|
| Order schema | `orders`, `order_items`, `order_item_modifiers`, `order_status_history` |
| Order placement | Cart-to-order conversion, price recalculation, order number generation |
| Order status workflow | Status transitions with authorization (who can update what) |
| Order history | Paginated order listing with filters |
| Order cancellation | Cancellation with reason and refund initiation |
| Re-ordering | Create new order from previous order items |
| Socket.IO order events | Real-time order status updates to all stakeholders |
| **Deliverable** | End-to-end order lifecycle with real-time updates |

### Phase 6 — Payment Module (Weeks 10–11)

| Task | Details |
|---|---|
| Payment schema | `payments`, `payment_methods`, `refunds` |
| Payment gateway integration | Razorpay/Stripe order creation, signature verification |
| Webhook handling | Asynchronous payment status processing |
| Saved payment methods | Tokenized payment instrument storage |
| Refund system | Request, review, process refund workflow |
| Coupon system | `coupons`, `coupon_usages` — CRUD, validation, discount application |
| Promotions | `restaurant_promotions` — restaurant-specific offers |
| **Deliverable** | Complete payment processing with coupons and refunds |

### Phase 7 — Delivery Module (Weeks 12–13)

| Task | Details |
|---|---|
| Delivery schema | `delivery_partners`, `deliveries`, `delivery_assignments` |
| Partner registration | Vehicle, government ID, verification workflow |
| Delivery assignment | Nearest-driver algorithm, accept/reject flow, auto-reassignment |
| Real-time tracking | GPS location updates via Socket.IO, Redis location storage |
| Delivery lifecycle | Assigned → accepted → picked_up → delivered |
| ETA calculation | Google Distance Matrix API integration |
| Earnings dashboard | Partner earnings calculation and history |
| **Deliverable** | Working delivery system with live GPS tracking |

### Phase 8 — Admin Module (Weeks 14–15)

| Task | Details |
|---|---|
| Admin dashboard | Platform KPI aggregation |
| User management | List, search, activate/deactivate, role management |
| Verification system | Restaurant/branch/delivery partner approval workflows |
| Support tickets | `support_tickets`, `ticket_attachments` — ticket CRUD, assignment, resolution |
| Notifications | `notifications` — in-app notification system with Socket.IO delivery |
| Audit logs | Critical operation logging |
| Payout management | Delivery partner and restaurant settlement processing |
| **Deliverable** | Comprehensive admin panel for platform management |

### Phase 9 — Reviews, Loyalty & Analytics (Weeks 16–17)

| Task | Details |
|---|---|
| Review system | `reviews`, `review_images` — multi-dimensional ratings, images, aggregation |
| Loyalty program | `loyalty_accounts`, `loyalty_transactions` — earn/redeem points |
| Platform analytics | Revenue, orders, users, growth metrics |
| Restaurant analytics | Per-restaurant and per-branch performance |
| Delivery analytics | Fleet performance, average delivery times |
| Customer analytics | Segmentation, lifetime value |
| Background jobs | Email, SMS, push notification workers |
| **Deliverable** | Complete analytics and engagement features |

### Phase 10 — Production Deployment (Weeks 18–19)

| Task | Details |
|---|---|
| Docker configuration | Multi-stage Dockerfile, docker-compose for production |
| Nginx setup | Reverse proxy, SSL, WebSocket upgrade, static file serving |
| CI/CD pipeline | GitHub Actions for automated testing and deployment |
| Environment setup | Staging and production environments on cloud |
| Security hardening | Firewall, SSH keys, secret management, penetration testing |
| Load testing | Simulate production traffic, identify bottlenecks |
| Monitoring setup | Sentry error tracking, application metrics, health checks |
| Documentation | Final API docs, deployment runbook, incident response guide |
| **Deliverable** | Production-ready platform deployed and monitored |

---

## Appendix

### A. Environment Variables Template

```env
# ─── Server ─────────────────────────────────────────
NODE_ENV=development
PORT=3000
API_VERSION=v1
APP_URL=http://localhost:3000

# ─── Database (Aiven MySQL) ─────────────────────────
DATABASE_URL="mysql://avnadmin:PASSWORD@mysql-foodfleet.aivencloud.com:12345/food_ordering_db?sslmode=require"

# ─── Redis ───────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ─── JWT ─────────────────────────────────────────────
JWT_ACCESS_SECRET=your-access-token-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ─── Payment Gateway (Razorpay) ─────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ─── Google Maps ─────────────────────────────────────
GOOGLE_MAPS_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxx

# ─── Email (SendGrid) ───────────────────────────────
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@foodfleet.com
EMAIL_FROM_NAME=FoodFleet

# ─── SMS (Twilio) ───────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ─── Cloud Storage (AWS S3) ─────────────────────────
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=foodfleet-uploads
AWS_S3_REGION=ap-south-1

# ─── Firebase (Push Notifications) ──────────────────
FIREBASE_PROJECT_ID=foodfleet-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@foodfleet.iam.gserviceaccount.com

# ─── CORS ────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173

# ─── Logging ─────────────────────────────────────────
LOG_LEVEL=debug

# ─── Sentry ──────────────────────────────────────────
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### B. API Response Format

All API responses follow a consistent envelope format:

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order placed successfully",
  "data": {
    "orderId": 12345,
    "orderNumber": "ORD-20240615-ABCD",
    "total": 549.00
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### C. HTTP Status Codes Used

| Code | Meaning | Used For |
|---|---|---|
| `200` | OK | Successful GET, PATCH, PUT |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, malformed request |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient role/permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g., email already registered) |
| `422` | Unprocessable Entity | Valid request but business rule violation |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unhandled server error |

---

> **Last Updated:** June 2026
>
> **Maintained By:** FoodFleet Engineering Team
>
> **License:** MIT
