# 🌮 TacoApp - Premium Taco Ordering Experience

A modern, feature-rich React Native taco ordering application built with Expo Router and TypeScript. Experience seamless taco ordering with persistent cart functionality, advanced search, and beautiful UI design.

![TacoApp Banner](https://img.shields.io/badge/TacoApp-🌮-orange?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🏠 **Enhanced Home Screen**
- **Featured Tacos**: Quick-add popular items directly from home
- **Cart Badge**: Real-time cart item counter
- **Modern Design**: Professional welcome section with branding

### 🔍 **Advanced Menu System**
- **Smart Search**: Find tacos by name or description in real-time
- **Category Filtering**: All, Meat, Seafood, Vegetarian categories
- **Results Counter**: Dynamic display of filtered items
- **Horizontal Scrolling**: Mobile-optimized category selection

### 🛒 **Persistent Shopping Cart**
- **AsyncStorage Integration**: Cart persists between app sessions
- **Quantity Controls**: +/- buttons for easy item management
- **Price Breakdown**: Individual and total price calculations
- **Modern UI**: Card-based design with shadows and rounded corners

### 🎨 **Premium UI/UX**
- **Material Design**: Consistent color scheme and typography
- **Loading States**: Smooth user experience during data loading
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/onebrownguy/tacoapp.git
cd tacoapp

# Install dependencies
npm install

# Start the development server
npm start
```

### Development Commands

```bash
# Start development server
npm start

# Run on web browser
npm run web

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

## 📱 App Structure

```
TacoApp/
├── app/                      # Main application screens
│   ├── (tabs)/              # Tab-based navigation screens
│   │   ├── index.tsx        # Enhanced home screen with featured items
│   │   ├── cart.tsx         # Redesigned cart with quantity controls
│   │   ├── explore.tsx      # Explore screen
│   │   └── contact.tsx      # Contact information
│   ├── context/             # React Context providers
│   │   └── CartContext.tsx  # Cart state management with persistence
│   ├── menu.tsx            # Advanced menu with search and filters
│   └── _layout.tsx         # Root layout with providers
├── components/              # Reusable UI components
│   ├── ui/                 # Platform-specific UI components
│   └── ...                 # Other shared components
├── constants/              # App constants and theme
├── hooks/                  # Custom React hooks
└── assets/                # Images, fonts, and other assets
```

## 🏗️ Architecture

### State Management
- **React Context API**: Centralized cart state management
- **AsyncStorage**: Persistent cart data across app sessions
- **TypeScript**: Full type safety throughout the application

### Navigation
- **Expo Router**: File-based routing system
- **Tab Navigation**: Bottom tab bar for main screens
- **Stack Navigation**: Nested navigation for detailed views

### Styling
- **StyleSheet API**: React Native's built-in styling
- **Modern Design**: Card-based layouts with shadows
- **Responsive**: Adapts to different screen sizes

## 🎯 Core Features Deep Dive

### Cart Persistence
```typescript
// Automatic cart saving and loading
const CartContext = {
  // Loads cart from AsyncStorage on app start
  // Saves cart automatically on every change
  // Handles loading states gracefully
}
```

### Search & Filtering
```typescript
// Real-time search and category filtering
const filteredItems = useMemo(() => {
  // Combines search query and category selection
  // Efficient memoization for performance
}, [searchQuery, selectedCategory]);
```

### Quantity Management
```typescript
// Smart quantity updates with auto-removal
const updateQuantity = (id: string, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(id); // Auto-remove when quantity hits 0
  }
  // Update cart with new quantity
};
```

## 🛠️ Technical Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React Native** | Mobile app framework | 0.76.7 |
| **Expo** | Development platform | ~52.0.36 |
| **TypeScript** | Type safety | ^5.3.3 |
| **Expo Router** | Navigation | ~4.0.17 |
| **AsyncStorage** | Data persistence | ^2.2.0 |
| **React Navigation** | Navigation components | ^7.0.14 |

## 📋 Menu Data Structure

```typescript
type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};
```

## 🎨 Design System

### Colors
- **Primary Blue**: `#007AFF` - Actions and highlights
- **Accent Orange**: `#FF5733` - Call-to-action buttons
- **Background**: `#F8F8F8` - App background
- **Cards**: `#FFFFFF` - Card backgrounds
- **Text Primary**: `#333333` - Main text
- **Text Secondary**: `#666666` - Supporting text

### Typography
- **Headers**: 22-28px, bold
- **Body Text**: 14-18px, regular/medium
- **Captions**: 12-14px, light

## 🔄 Recent Updates

### Version 2.0 - Major Feature Release
- ✨ Added cart persistence with AsyncStorage
- 🎨 Complete UI/UX redesign with modern cards
- ➕ Quantity controls for cart items  
- 🔍 Advanced search and filtering
- 🏠 Enhanced home screen with featured items
- ⚡ Loading states and error handling
- 🛠️ TypeScript fixes and improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the excellent React Native development platform
- **React Native Community**: For the robust ecosystem
- **Material Design**: For design inspiration
- **Claude Code**: For AI-assisted development and improvements

---

**Built with ❤️ and 🌮 by [onebrownguy](https://github.com/onebrownguy)**

*Ready to order some tacos? Download and run the app to experience the future of taco ordering!*
