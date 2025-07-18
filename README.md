# B2B E-Commerce React App

This is a B2B e-commerce platform built with React (Vite), Tailwind CSS, and Supabase as the backend. It features product search, cart, order tracking, and a smart chatbot assistant.

## Features
- Modern React + Vite frontend
- Supabase backend (auth, database, API)
- Product search, categories, cart, and orders
- Chatbot assistant for product discovery and help
- Responsive UI with Tailwind CSS

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd project
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```sh
cp .env.example .env
```
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public API key

### 4. Run locally
```sh
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173)

---

## Docker Usage

### Build and run with Docker
```sh
docker build -t my-ecom-app .
docker run -p 80:80 --env-file .env my-ecom-app
```
The app will be available at [http://localhost](http://localhost)

### Environment Variables
- The Docker container uses the same `.env` file for Supabase config.

---

## Supabase Setup
- You need a Supabase project (cloud or local).
- Run the SQL in `supabase/migrations/` to set up your database schema.
- Update your `.env` with the correct Supabase URL and anon key.

### Local Supabase (optional)
If you want to run Supabase locally, see [Supabase CLI docs](https://supabase.com/docs/guides/cli/local-development) or ask for a `docker-compose.yml` example.

---

## Scripts
- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

## License
MIT
