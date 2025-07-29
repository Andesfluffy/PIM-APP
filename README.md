# PIM App

This project is a single page application built with **Next.js** and **TypeScript**. It provides a personal information manager for notes, contacts and tasks. Authentication is handled via Firebase and data is stored in MongoDB.

## Requirements

- Node.js 18+
- A MongoDB database
- Firebase project for authentication

## Setup

1. Copy `.env.example` to `.env` and fill in the required values.

```bash
cp .env.example .env
```

At minimum you need to provide your MongoDB connection string and Firebase credentials.

2. Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Deployment

### Vercel

This repository works out of the box with Vercel. Push your code to GitHub and import the project in Vercel. Make sure to add all variables from `.env.example` to your Vercel project settings.

### Azure Static Web Apps

Two GitHub workflow files are included to deploy the SPA to Azure Static Web Apps. Configure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secrets in your repository and adjust the `app_location`, `api_location` and `output_location` values if your structure changes.

For Azure Functions the same environment variables defined in `.env` are required. See `azure-functions/` for the implementation.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build the application
- `npm start` – start the production server
- `npm run lint` – run ESLint

---

PIM App – manage your notes, tasks and contacts in one place.
