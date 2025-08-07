# CircuitSim Frontend

A modern, responsive circuit simulation web application built with React and Bootstrap.

## 🎨 Design Features

### Modern Dark Theme
- **Dark Color Palette**: Professional dark theme with carefully chosen colors
- **CSS Variables**: Consistent theming using CSS custom properties
- **Gradient Accents**: Beautiful gradient effects throughout the interface
- **Glass Morphism**: Subtle backdrop blur effects for modern UI elements

### Animations & Interactions
- **Smooth Transitions**: All interactive elements have smooth hover and focus states
- **Scroll Reveal**: Elements animate in as they come into view
- **Floating Elements**: Animated background elements for visual interest
- **Sine Wave Background**: Animated SVG sine waves for technical aesthetic
- **Shimmer Effects**: Subtle shimmer animations on buttons
- **Staggered Animations**: Sequential reveal animations for lists and grids

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Bootstrap Grid**: Flexible layout system
- **Touch-Friendly**: Large touch targets for mobile devices
- **Adaptive Navigation**: Collapsible navigation for smaller screens

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## 🎯 Key Components

### HomePage
- **Hero Section**: Animated landing area with call-to-action buttons
- **Features Grid**: Showcase of application capabilities
- **Stats Section**: Animated statistics with counting effects
- **About Section**: Information about the platform
- **Contact Form**: User feedback and support

### CircuitCanvas
- **Interactive Grid**: Clickable circuit design canvas
- **Component Library**: Drag-and-drop electronic components
- **Real-time Simulation**: Live circuit analysis
- **Parameter Controls**: Advanced simulation settings
- **Results Display**: Visual representation of simulation data

## 🎨 Color Scheme

### Primary Colors
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#06b6d4` (Cyan)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

### Background Colors
- **Primary**: `#0f172a` (Slate 900)
- **Secondary**: `#1e293b` (Slate 800)
- **Tertiary**: `#334155` (Slate 700)
- **Card**: `#1e293b` (Slate 800)

### Text Colors
- **Primary**: `#f8fafc` (Slate 50)
- **Secondary**: `#cbd5e1` (Slate 300)
- **Muted**: `#94a3b8` (Slate 400)

## 🔧 Customization

### Adding New Colors
```css
:root {
  --your-color: #your-hex-value;
}
```

### Modifying Animations
```css
.your-element {
  animation: yourAnimation 2s ease-in-out infinite;
}

@keyframes yourAnimation {
  0%, 100% { /* your styles */ }
  50% { /* your styles */ }
}
```

### Responsive Breakpoints
- **Mobile**: `< 576px`
- **Tablet**: `576px - 900px`
- **Desktop**: `> 900px`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎯 Performance Optimizations

- **CSS Variables**: Efficient theming system
- **Intersection Observer**: Optimized scroll animations
- **CSS Transitions**: Hardware-accelerated animations
- **Responsive Images**: Optimized for different screen sizes
- **Lazy Loading**: Components load as needed

## 🔮 Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Custom animation presets
- [ ] Advanced color schemes
- [ ] Accessibility improvements
- [ ] Performance monitoring
- [ ] PWA capabilities

## 📄 License

This project is licensed under the MIT License.
