# GitDone

Track habits like git commits — a GitHub-style contribution grid for your daily habits.

## Features

- **GitHub-style habit grid** — visualize streaks and consistency at a glance
- **Authentication** — sign in with Clerk to persist your data
- **Demo mode** — try it out instantly without signing in
- **Custom colors & categories** — personalize each habit
- **Real-time sync** — powered by Convex for instant updates

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Backend:** [Convex](https://convex.dev) (database + real-time queries/mutations)
- **Auth:** [Clerk](https://clerk.com)
- **Build:** Vite 7

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) application

### Installation

```bash
git clone https://github.com/bm611/gitdone.git
cd gitdone
npm install
```

### Environment Setup

Configure your Convex and Clerk credentials:

```bash
npx convex dev   # Follow prompts to link your Convex project
```

Set up Clerk by adding your publishable key to your environment (see [Convex + Clerk docs](https://docs.convex.dev/auth/clerk)).

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/       # React UI components
│   ├── HabitCard     # Individual habit with contribution grid
│   ├── HabitGrid     # GitHub-style grid visualization
│   ├── HabitForm     # Create/edit habit modal
│   ├── ConfirmDialog # Delete confirmation
│   ├── SignIn        # Landing/sign-in view
│   └── UserMenu     # Authenticated user dropdown
├── App.tsx           # Main app with auth routing
└── main.tsx          # Entry point with Convex/Clerk providers
convex/
├── schema.ts         # Database schema (habits + completions)
├── habits.ts         # Habit CRUD mutations/queries
└── completions.ts    # Daily completion toggle logic
```

## License

MIT
