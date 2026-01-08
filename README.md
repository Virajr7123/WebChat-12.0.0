# Chit Chat - Modern Web Chat Application

A feature-rich, real-time web chat application built with Next.js, Firebase, and WebRTC. Enjoy seamless messaging, video/audio calls, and an intuitive user interface inspired by modern chat platforms.

## 🌟 Features

### Core Messaging
- **Real-time Messaging** - Instant message delivery with Firebase Realtime Database
- **One-on-One Chats** - Direct private conversations with contacts
- **Group Chats** - Create and manage group conversations with multiple users
- **Lazy Loading** - Messages load on-demand for optimal performance
- **Message Status** - Track sent, delivered, and read status
- **Typing Indicators** - See when contacts are typing

### Voice & Video
- **HD Video Calls** - High-quality peer-to-peer video calls using WebRTC
- **Audio Calls** - Crystal-clear audio communication
- **Centered Call Interface** - Modern, professional calling UI with full screen support
- **Call Management** - Accept, decline, or end calls with synchronized state across devices
- **Picture-in-Picture** - Local video in PiP while viewing remote video full-screen

### User Management
- **User Authentication** - Secure email/password authentication with Firebase Auth
- **User Profiles** - Customizable user profiles with avatars and status messages
- **Contact Management** - Add, remove, and organize contacts
- **Online Status** - Real-time presence detection and online indicators
- **Last Seen** - Track when contacts were last active

### User Experience
- **Dark Mode** - Built-in dark theme for comfortable viewing
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Search** - Find contacts and messages quickly
- **Notifications** - Real-time toast notifications for messages and calls
- **Keyboard Shortcuts** - Quick navigation and actions
- **Context Menus** - Right-click menus for additional options
- **Smooth Animations** - Framer Motion animations for polished interactions

### Design & Styling
- **Modern UI Components** - shadcn/ui components for consistent design
- **Tailwind CSS** - Utility-first styling framework
- **Color System** - Light and dark mode support with CSS variables
- **Typography** - Inter font family for clean, readable text
- **Accessibility** - WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.8** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **shadcn/ui** - High-quality UI components

### Backend & Database
- **Firebase** - Real-time database, authentication, and hosting
  - Realtime Database for messages and user data
  - Firebase Auth for user authentication
  - Cloud Storage for file uploads (optional)

### Real-time Communication
- **WebRTC** - Peer-to-peer video and audio communication
- **Socket.io** (via Firebase) - Real-time state synchronization

### Form & Validation
- **React Hook Form** - Efficient form state management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **next-themes** - Theme management
- **date-fns** - Date formatting and manipulation
- **sonner** - Toast notifications
- **react-resizable-panels** - Resizable panel layouts
- **recharts** - Data visualization (optional)
- **cmdk** - Command palette component

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account with Realtime Database enabled
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Virajr7123/WebChat-12.0.0.git
   cd chit-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Realtime Database and Authentication (Email/Password)
   - Copy your Firebase configuration

4. **Add environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
chit-chat/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main home page
│   └── globals.css         # Global styles with theme variables
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── chat-interface.tsx  # Main chat interface
│   ├── chat-sidebar.tsx    # Chat list sidebar
│   ├── video-call-modal.tsx # Active video call UI
│   ├── incoming-call-modal.tsx # Incoming call UI
│   ├── outgoing-call-modal.tsx # Outgoing call UI
│   ├── auth-screen.tsx     # Authentication page
│   ├── message-bubble.tsx  # Message component
│   └── ...                 # Other components
├── contexts/
│   ├── auth-context.tsx    # Authentication context
│   ├── chat-context.tsx    # Chat state management
│   └── theme-context.tsx   # Theme management
├── hooks/
│   ├── use-webrtc.ts       # WebRTC hook for calls
│   └── use-mobile.tsx      # Mobile detection hook
├── lib/
│   └── firebase.ts         # Firebase configuration
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration
```

## 🎨 Design System

### Color Palette
- **Light Mode**: Clean whites and dark grays for high contrast
- **Dark Mode**: Deep blacks and light grays for eye comfort
- **Primary**: System colors for calls to action
- **Accent**: Highlight colors for interactive elements

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Inter Bold, 18px-32px
- **Body**: Inter Regular, 14px-16px
- **Code**: Monospace, 12px-14px

### Layout
- **Sidebar**: 384px (desktop), full-width (mobile)
- **Chat Area**: Flexible, responsive
- **Spacing**: 4px grid system (Tailwind scale)
- **Breakpoints**: Mobile (0px), Tablet (768px), Desktop (1024px)

## 🎮 Usage

### Starting a Conversation
1. Click "New Chat" or select a contact from the sidebar
2. Type your message in the input field
3. Press Enter to send

### Making a Call
1. Open a one-on-one chat
2. Click the phone or video icon in the header
3. The recipient can accept or decline the call
4. Use the controls to mute, screen share, or end the call

### Managing Contacts
1. Click the contacts icon to view your contact list
2. Search for users or add new contacts
3. Right-click for options to view profile or remove

### Theme Management
1. Click the theme toggle in the header
2. Switch between light and dark modes
3. Your preference is saved automatically

## 🔐 Security

- **Firebase Auth** - Secure authentication with email verification
- **Realtime Database Rules** - Data access controlled via Firebase security rules
- **HTTPS Only** - Secure communication in production
- **WebRTC Encryption** - Peer-to-peer calls are encrypted end-to-end

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your Firebase environment variables
4. Deploy with one click

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set your build command: `npm run build`
3. Set your publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Serve via Node.js or your preferred server

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🐛 Known Issues & Troubleshooting

### Calls not syncing between users
- Ensure Firebase Realtime Database is configured correctly
- Check that WebRTC peer connection is established
- Verify firewall settings allow WebRTC connections

### Messages not loading
- Check Firebase rules allow read access
- Ensure user is authenticated
- Clear browser cache and reload

### Dark mode not persisting
- Check browser localStorage is enabled
- Verify next-themes provider is in layout

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, email sawantviraj976@gmail.com or open an issue on GitHub.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Firebase](https://firebase.google.com) - Backend and authentication
- [Vercel](https://vercel.com) - Deployment and hosting
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [WebRTC](https://webrtc.org/) - Real-time communication

---

Built with ❤️ using Next.js and Firebase
