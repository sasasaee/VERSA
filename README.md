# VERSA

**VERSA** is a collaborative story writing and sharing platform where users can read stories, write quick stories, participate in weekly writing contests, and earn ranks as they engage with the community.

## 🌟 Key Features

- **User Authentication:** Secure registration and login using JWT and bcrypt.
- **Story Sharing:** Write, publish, and read short stories from other users.
- **Weekly Contests:** Participate in themed writing contests with automated deadlines and word-count tracking.
- **Ranking System:** Users can level up their rank (e.g., from *Reader* to *Beginner*) based on their engagement, complete with popup & in-app notifications.
- **Interactive Feed:** Browse stories, search by keywords, filter by genre, and sort by newest/oldest.
- **Upvoting & Saving:** Like your favorite stories and save them for reading later.
- **Profile & Customization:** View comprehensive user profiles, inclusive of reading history, and customize your profile picture.
- **Dynamic Themes:** Toggle between beautifully crafted Light and Dark themes (Theme Lamp feature).
- **Leaderboard:** See top-performing authors and stories in the community.
- **Image Uploading:** Integrated with Cloudinary for seamless story header images and profile picture uploads.

## 💻 Tech Stack

**Frontend:**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (Custom UI with Skin variables for dynamic theming)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/) for API calls

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [JWT (JSON Web Tokens)](https://jwt.io/) for authentication
- [Cloudinary](https://cloudinary.com/) & [Multer](https://www.npmjs.com/package/multer) for media management
- `node-cron` for automated weekly contest scheduling

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd VERSA
```

### 2. Backend Setup
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` root with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend development server:
```bash
npm run dev
# The backend API should be running on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend Vite server:
```bash
npm run dev
# The frontend should be accessible at http://localhost:5173
```

## 📂 Project Structure

```
VERSA/
├── backend/               # Express API and server logic
│   ├── models/            # Mongoose schemas (User, Story, Contest, Notification, etc.)
│   ├── routes/            # API endpoints (auth, stories, contests, user, etc.)
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # Authentication and file upload middlewares
│   └── index.js           # Main application entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components (Navbar, Toast, Sidebars, Modals)
│   │   ├── pages/         # Full-page components (Dashboard, Profile, ContestPage, Leaderboard)
│   │   ├── App.jsx        # Routing configuration
│   │   └── index.css      # Tailwind base and custom theme variables
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🏆 Workflows & Automation
- **Contests:** A cron job is available in `backend/index.js` to automatically start and stop weekly contests.
- **Notifications:** In-app popups and notification entries dynamically alert users to their new rank tier.

---

*Made for storytellers, by storytellers. Happy writing!*
