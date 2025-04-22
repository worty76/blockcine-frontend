# BookApp

BookApp is a comprehensive platform for managing and exploring books, films, and recommendations. It integrates blockchain technology, AI-powered recommendations, and a user-friendly frontend built with Next.js.

## Demo

Check out our demo video: [BookApp Demo](https://jumpshare.com/s/JdvcvD8yO76ORIZ5B9Qn)

## Features

### Backend

- **Authentication**: Secure user authentication and authorization.
- **Film Management**: CRUD operations for films.
- **AI Recommendations**: AI-powered film recommendations.
- **Blockchain Integration**: Ethereum-based ticket transactions.
- **Seeding**: Preload the database with sample data.

### Frontend

- **User Interface**: Built with Next.js and Tailwind CSS.
- **Authentication Pages**: Login and registration.
- **User Profile**: Manage user details and preferences.
- **Film Details**: View detailed information about films.
- **Recommendations**: Explore AI-powered recommendations.

## Project Structure

### Frontend

- **`src/app`**: Next.js pages for authentication, user profile, films, and recommendations.
- **`src/components`**: Reusable UI components like buttons, cards, and modals.
- **`src/services`**: Frontend services for API interactions.
- **`src/store`**: State management using Zustand.

## Installation

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn
- Docker (optional, for running the blockchain network)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/worty76/blockcine-frontend
   cd BookApp
   ```

2. Install dependencies for both backend and frontend:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. Configure environment variables:

   - Backend: Create a `.env` file in the `backend` directory.
   - Frontend: Create a `.env.local` file in the `frontend` directory.

4. Start the development servers:

   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

5. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
