# NEXIUS GPT2 Chat Application

A cutting-edge chat platform featuring AI-driven email and procurement agents, real-time streaming, and a polished UI built with React, TypeScript, and Tailwind CSS.

## Table of Contents

- [Features](#features)
- [Demo Credentials](#demo-credentials)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Custom Theme](#custom-theme)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-Powered Agents**: Email and procurement chatbots providing intelligent responses and workflow automation.
- **Real-Time Streaming**: Live message updates and typing indicators.
- **Dark/Light Mode**: Seamless theme switching using Tailwind's `dark` class.
- **Responsive Design**: Mobile-first layouts optimized for all devices.
- **Secure Authentication**: JWT-based login flow.
- **Profile Management**: Edit and view user profiles.
- **Reminders**: Create, view, and manage reminders.

## Demo Credentials

Use the following to log in:

```plaintext
Email: demo@example.com
Password: password
```

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (custom theme)
- **State Management**: Redux Toolkit & Zustand
- **Icons**: Lucide React
- **Networking**: Axios, Socket.IO Client
- **Utilities**: lodash.debounce, uuid

## Prerequisites

- Node.js v16+ (LTS)
- npm or Yarn

## Installation

```bash
git clone https://github.com/your-org/nexiusgpt2.git
cd nexiusgpt2
npm install
# or
# yarn install
```

## Configuration

Tailwind CSS is extended in `tailwind.config.js`:

```js
const colors = require('tailwindcss/colors');
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,css}'],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.gray,
        dark: '#1e1e1e',
        'dark-secondary': '#1f2937',
        'dark-tertiary': '#374151',
      },
    },
  },
  plugins: [],
};
```

Create a `.env.local` file for environment variables:

```dotenv
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Available Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint and Prettier
- `npm run test` — Run Vitest unit tests
- `npm run test:e2e` — Launch Cypress for end-to-end tests

## Project Structure

```plaintext
nexiusgpt2/
├── public/
│   └── index.html
├── src/
│   ├── features/
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx
│   │   │   └── ProfileForm.tsx
│   │   └── reminders/
│   │       └── RemindersPage.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       └── profileSlice.ts
│   ├── index.css
│   └── main.tsx
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Custom Theme

Colors have been extended to include a `primary` palette, `secondary`, and `dark` backgrounds. Modify `tailwind.config.js` to adjust your branding.

## Testing

- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "feat: Add YourFeature"`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. © 2025 Nexius Dev Team