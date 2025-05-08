# StartInfo Robotics Platform

An interactive learning platform for kids aged 12-18 to learn robotics through structured courses, practical projects, and community engagement.

## Features

- 🎓 **Structured Learning Path**

  - Video lessons and PDF resources
  - Interactive quizzes and assessments
  - Progress tracking and certifications

- 🎮 **Gamified Experience**

  - Badges and achievements
  - Level progression system
  - Challenge-based learning

- 🤝 **Community Features**
  - Discussion forums
  - Collaborative projects
  - Mentor feedback system

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Prisma, SQLite
- **Authentication**: JWT
- **Real-time Features**: Socket.IO
- **UI Components**: Radix UI, Shadcn UI

## Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── courses/       # Course management
│   ├── challenges/    # Robotics challenges
│   ├── forum/         # Community forum
│   └── profile/       # User profiles
├── components/        # Reusable components
│   ├── ui/           # UI components
│   └── layout/       # Layout components
├── lib/              # Utilities and helpers
│   ├── api/          # API clients
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
├── hooks/            # Custom React hooks
└── contexts/         # React contexts
```

## Getting Started

1. **Prerequisites**

   - Node.js (v18 or higher)
   - npm (v9 or higher)

2. **Installation**

   ```bash
   # Clone the repository
   git clone [repository-url]

   # Install dependencies
   npm install

   # Set up the database
   npm run prisma:migrate

   # Start the development server
   npm run dev
   ```

3. **Database Setup**
   - The project uses SQLite with Prisma ORM
   - Run `npm run prisma:studio` to view and manage the database

## Development

- **Code Style**: ESLint and Prettier
- **Type Checking**: TypeScript
- **Testing**: Jest and React Testing Library

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
