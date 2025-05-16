# titan-qoutes

- Backend: NestJS microservice fetching random quotes from FavQs, with caching, pagination & retry logic
- Frontend: React + MUI client that displays quotes in a responsive grid
- Shared: libs/quotes-interfaces for common Quote types

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

Fetch random quotes via:

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
- tag: filter by specific tag (if not given it will provide random quotes)

On the frontend, enter your desired count in the input box— infinite-scroll or paging can be built on top of this.

---
