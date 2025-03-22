# Next.js Boilerplate with Supabase Auth

This is a boilerplate project built with Next.js and Supabase, featuring user authentication and a modern UI with Tailwind CSS.

## Features

- 🔐 User Authentication (Sign up, Sign in, Sign out)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive Design
- 🔄 Real-time Auth State Management
- ⚡ Fast Page Loads with Next.js App Router
- 🛡️ TypeScript Support

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account and project

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/getmedia59/boilerplate.git
   cd boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase project credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon/public key

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # App router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   └── Layout.tsx        # Main layout component
└── lib/                  # Utility functions and configurations
    └── supabase.ts       # Supabase client configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
