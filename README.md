# ⚡ Production Fintech Real-Time Trade Ledger & Wallet Engine
 
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-indigo.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Kafka](https://img.shields.io/badge/Apache_Kafka-3.x-black.svg)](https://kafka.apache.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ_/_BullMQ-DLQ-orange.svg)](https://www.rabbitmq.com/)

A high-performance, resilient, and secure **Fintech Trading & Ledger Engine** built with TypeScript, Express, PostgreSQL, Prisma ORM, Redis, Apache Kafka, and RabbitMQ / BullMQ. Designed around **Clean Architecture**, **ACID DB Transactions**, **Event-Driven Microservices**, **Double-Entry Bookkeeping**, and **Optimistic Concurrency Control**.

---

## 🏗️ System Architecture

The application follows **Clean Layered Architecture** paired with an **Event-Driven Messaging Pipeline** to process high-throughput trades asynchronously.

```mermaid
graph TD
    Client["Client / Mobile / Web App"] --> Router["Express Router Layer"]
    Router --> Middleware["Middleware Pipeline (RateLimit, Zod Validator, Auth Guard)"]
    Middleware --> Controller["Controller Layer (Transport & Response Formatting)"]
    Controller --> Service["Service Layer (Business Logic & JWT Management)"]
    Service --> Repo["Repository Layer (Prisma ORM & Transaction Boundaries)"]
    Repo --> DB[("PostgreSQL Database")]
    Service --> Cache[("Redis Cache / Idempotency Store")]
    
    Service --> KafkaProducer["Kafka Producer (Order Ingestion)"]
    KafkaProducer --> KafkaTopic[("Apache Kafka Topic: trade-orders")]
    KafkaTopic --> MatchingWorker["Order Matching Engine Worker (Kafka Consumer)"]
    MatchingWorker --> RedisOrderBook[("Redis Sorted Sets (Live OrderBook)")]
    MatchingWorker --> SettlementWorker["Settlement & Ledger Worker"]
    SettlementWorker --> DB
    SettlementWorker -->|Failed Processing| DLQ[("RabbitMQ / BullMQ Dead Letter Queue (DLQ)")]
```

---

## 📡 Event-Driven Order Processing & Message Queue Architecture

In high-frequency trading systems, direct database writes on order placement create severe bottlenecks. We decouple order placement from order settlement using **Apache Kafka** and **RabbitMQ / BullMQ**:

```mermaid
sequenceDiagram
    autonumber
    actor Trader as Client / Trader
    participant API as API Gateway / Service
    participant Kafka as Apache Kafka Cluster
    participant Engine as Order Matching Engine Worker
    participant Redis as Redis OrderBook (Sorted Sets)
    participant DB as PostgreSQL (Double-Entry Ledger)
    participant DLQ as RabbitMQ / BullMQ DLQ

    Trader->>API: POST /api/orders (Buy 1 BTC @ 50,000 INR)
    API->>API: Validate Idempotency & User Balance
    API->>Kafka: Publish Event "order.created" (Partition Key: Symbol "BTC-INR")
    API-->>Trader: 202 Accepted (Order ID: `ord_123`, Status: PENDING)
    
    Kafka->>Engine: Consume "order.created" Event
    Engine->>Redis: Execute In-Memory Order Match (Sorted Set ZADD/ZPOPMIN)
    alt Match Found
        Engine->>Kafka: Publish Event "trade.executed"
        Engine->>DB: Execute Atomic Double-Entry Ledger (Debit Buyer, Credit Seller)
    else Match Failed / Error
        Engine->>DLQ: Route to Dead Letter Queue (DLQ) for Offline Inspection & Alerting
    end
```

---

## 🗄️ Database Schema & Entity Relationship

The database is built on **PostgreSQL** with 5 core domain entities designed for maximum precision (`Decimal(20,4)`), optimistic locking, and strict relational integrity.

```mermaid
erDiagram
    USER ||--o| WALLET : "has standard 1:1"
    USER ||--o{ ORDER : "places 1:M"
    WALLET ||--o{ LEDGER_ENTRY : "records audit logs 1:M"
    ORDER ||--o{ TRADE : "executes Buy/Sell trades"

    USER {
        string id PK
        string name
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }

    WALLET {
        string id PK
        string userId FK, UK
        decimal balance "Decimal(20,4)"
        string currency
        int version "Optimistic Locking"
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        string id PK
        string userId FK
        string symbol
        string type "LIMIT / MARKET"
        string side "BUY / SELL"
        decimal price "Decimal(20,4)"
        string status "PENDING / FILLED / CANCELLED"
        datetime createdAt
    }

    TRADE {
        string id PK
        string buyOrderId FK
        string sellOrderId FK
        decimal price "Decimal(20,4)"
        decimal quantity "Decimal(20,4)"
        datetime executedAt
    }

    LEDGER_ENTRY {
        string id PK
        string walletId FK
        decimal amount "Decimal(20,4)"
        string type "CREDIT / DEBIT"
        string description
        decimal balance "Decimal(20,4)"
        datetime createdAt
    }
```

---

## 🔄 Transactional User & Wallet Provisioning Flow

When a user registers, the system enforces **ACID Atomicity** using PostgreSQL transactions.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as Auth Controller
    participant Service as Auth Service Layer
    participant Repo as User Repository
    participant DB as PostgreSQL (ACID Tx)

    Client->>Controller: POST /api/auth/signup (name, email, password)
    Controller->>Service: Call signUp(name, email, password)
    Service->>Service: Hash Password with Argon2
    Service->>Repo: createUser({ id, name, email, password })
    Repo->>DB: BEGIN TRANSACTION
    Repo->>DB: INSERT INTO User (id, name, email, password)
    Repo->>DB: INSERT INTO Wallet (userId, balance=0, currency='INR')
    DB-->>Repo: COMMIT TRANSACTION
    Repo-->>Service: Return Created User & Wallet
    Service->>Service: Sign JWT Access Token (15m) & Refresh Token (7d)
    Service-->>Controller: Return Safe DTO (No Password Hash) + Tokens
    Controller-->>Client: 201 Created JSON Response
```

---

## 🔥 Key Technical Highlights

1. **Atomic User + Wallet Creation**: Uses Prisma nested creation / `$transaction` blocks to ensure a User is never created without an initialized Wallet.
2. **Apache Kafka Event Streaming**: Orders are published to symbol-partitioned Kafka topics to maintain strict FIFO event ordering per trading pair while scaling consumer workers horizontally.
3. **RabbitMQ / BullMQ Dead Letter Queue (DLQ)**: System resilience pattern ensuring that poison-pill messages or failed ledger writes don't crash the pipeline, routing them to a persistent DLQ for manual inspection.
4. **Double-Entry Bookkeeping**: Every balance alteration logs a `LedgerEntry` record (`CREDIT` / `DEBIT`) to provide a zero-variance audit trail.
5. **Optimistic Concurrency Control**: The `Wallet` model includes an auto-incrementing `version` field to prevent race conditions during high-frequency balance updates.
6. **Argon2 Hashing & Token Rotation**: Passwords are saved using memory-hard Argon2 hashing. Tokens use short-lived JWT Access Tokens (15m) paired with Refresh Tokens (7d).
7. **Data Transfer Object (DTO) Security**: Password hashes and sensitive metadata are stripped at the Service layer before crossing the transport boundary.
8. **Zod Validation & Global Error Middleware**: Input payloads are intercepted at the boundary using Zod schemas, returning standardized RFC-7807 error responses on failure.

---

## 📁 Folder Structure

```text
c:\Users\Om\Desktop\Advanced Backend\
├── prisma/
│   └── schema.prisma        # Database Models & ORM configuration
├── src/
│   ├── app.ts               # Express pipeline & middleware binding
│   ├── server.ts            # HTTP Listener
│   ├── config/              # Zod environment variable parser & DB client
│   ├── controllers/         # HTTP Layer controllers
│   ├── services/            # Core business logic layer
│   ├── repositories/        # Database data access layer
│   ├── middlewares/         # Zod validation & global error handlers
│   ├── errors/              # Domain-specific Custom Exception Classes
│   └── validators/          # Zod validation schemas
├── .env.example             # Environment variables template
├── docker-compose.yml       # Docker compose for PostgreSQL, Redis & Kafka
├── package.json             # Dependencies and npm scripts
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Docker & Docker Compose**: For running PostgreSQL, Redis, and Kafka locally
- **npm** or **pnpm**

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trade_ledger_db?schema=public"
JWT_SECRET="your_super_secret_access_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
```

### 3. Spin Up Infrastructure (Postgres + Redis + Kafka)
```bash
docker-compose up -d
```

### 4. Database Setup
```bash
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

---

## 🛠️ API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user & auto-provision wallet | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT pair | ❌ No |
| `POST` | `/api/auth/refresh` | Rotate access token using refresh token | ❌ No |
| `POST` | `/api/auth/logout` | Revoke session & clear cookies | 🔒 Yes |

---

## 📌 Development Roadmap
- [x] **Week 1:** Clean Architecture, Auth API, Zod Validation, Global Error Handling.
- [x] **Week 2:** PostgreSQL Schema, Atomic Wallet Creation, DTO Security.
- [ ] **Week 3 (Upcoming):** Redis Caching, Idempotency Guard (`X-Idempotency-Key`), Dockerization.
- [ ] **Week 4 (Upcoming):** Order Matching Engine, Apache Kafka Event Queue, RabbitMQ/BullMQ DLQ, WebSocket Live OrderBook, k6 Load Testing (10,000 req/sec).

---

## 👨‍💻 Author
**Aayush** - Backend Engineer 
 