# Titan-Quotes

A full-stack application for browsing and discovering quotes with infinite scrolling and tag filtering capabilities.

- **Backend**: NestJS microservice fetching quotes from FavQs API, with Redis caching, smart pagination & retry logic
- **Frontend**: React + Material UI client that displays quotes in a responsive grid with infinite scrolling
- **Shared**: TypeScript interfaces for common Quote types in a monorepo structure

---

## Features

- 🔄 **Infinite scroll** - Load more quotes as you scroll down
- 🏷️ **Tag filtering** - Filter quotes by specific tags
- 📱 **Responsive design** - Works on mobile, tablet, and desktop
- ⚡ **Performance optimized** - Backend caching and frontend optimizations
- 🔁 **Retry logic** - Handles API rate limiting gracefully
- 🎨 **Material UI** - Modern, clean user interface

---

### Prerequisites

- Node.js ≥14
- npm (or npx)
- A free API key from FavQs

---

### 1. Install dependencies

From the repo root:

```
npm install
```

---

### 2. Configure environment variables

2.1 Backend:

Create a ".env" file at the root "apps/microservices/quotes-api"

```
FAVQS_API_URL=https://favqs.com/api
# Your FavQs API key (sign up for free)
FAVQS_API_KEY=your_api_key_here
```

2.2 Frontend:

Create a ".env" file at "apps/frontend/quotes-client"

```
VITE_QUOTE_APP_BACKEND_URL=http://localhost:3000
```

---

### 3. Running the apps

3.1 Backend:

```
npm run server
```

3.2 Frontend:

```
npm run client
```

Open your browser at the address shown (default is http://localhost:4200/ )

---

### 4. How to use

#### API Endpoints

#### Get Quotes:

```
GET /quotes/list
  ?count=<total-quotes-to-return>
  &page=<page-number>
  &pageSize=<quotes-per-page>
  &tag=<single-tag>
```

Example:

```
http://localhost:3000/api/quotes/list?count=50&page=1&pageSize=10&tag=cool
```

- count: total quotes you want overall
- page: which page of pageSize to return
- pageSize: how many quotes per “page” (max 50, validated by DTO)
- tag: Filter by specific tag (optional)

On the frontend, enter your desired count in the input box— infinite-scroll or paging can be built on top of this.

### Frontend Usage

1. Browse Random Quotes: Just open the app to see random quotes
2. Filter by Tag: Enter a tag name in the filter input and click "Get Quotes"
3. Adjust Quote Count: Change the number in the count input
4. Infinite Scroll: Just keep scrolling down to load more quotes

---
