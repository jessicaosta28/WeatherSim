# WeatherSim - Weather Dashboard

A modern, interactive weather dashboard built with HTML, CSS, and JavaScript that provides real-time weather information, forecasts, and city comparisons using the OpenWeather API.

## 🌟 Features

### Core Functionality

- **Real-time Weather Data**: Get current weather conditions for any city worldwide
- **5-Day Forecast**: Extended weather predictions with detailed information
- **Hourly Forecast**: Next 24 hours weather breakdown
- **City Comparison**: Side-by-side weather comparison between two cities
- **Interactive Map**: Visual location selection with coordinates
- **Temperature Charts**: Visual temperature trends using Chart.js

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between dark and light modes
- **Glass UI Design**: Modern glassmorphism design with backdrop blur effects
- **Search History**: Quick access to previously searched cities
- **Location Services**: Use your current location for weather data
- **Download Reports**: Generate and download weather reports as PDF
- **Smooth Animations**: Subtle UI transitions and loading states

### Technical Features

- **Unit Conversion**: Switch between Celsius and Fahrenheit
- **Weather Icons**: Dynamic weather condition icons
- **Background Themes**: Weather-appropriate background images
- **UV Index**: Real-time UV index information
- **Wind & Humidity**: Detailed weather metrics
- **Dressing Advice**: Weather-appropriate clothing recommendations

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls
- No additional software installation required

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start exploring weather data!

### API Setup

The project uses OpenWeather API. The current API key is included for demonstration purposes. For production use:

1. Sign up at [OpenWeather](https://openweathermap.org/api)
2. Get your free API key
3. Replace the API key in `script.js` line 1:
   ```javascript
   const WEATHER_API_KEY = "your-api-key-here";
   ```

## 📁 Project Structure

```
WeatherDashboard/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── style.css           # CSS styles and themes
├── images/             # Weather icons and backgrounds
│   ├── logo.jpg
│   ├── sunny_icon.jpg
│   ├── cloudy_icon.jpg
│   ├── rain_icon.jpg
│   ├── snow_icon.jpg
│   ├── storm_icon.jpg
│   ├── sunny.jpg
│   ├── cloudy.jpg
│   ├── rain.jpg
│   ├── snow.jpg
│   ├── storm.jpg
│   └── default.jpg
└── README.md           # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, and animations
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Bootstrap 5**: Responsive grid system and components
- **Chart.js**: Data visualization for temperature trends
- **Leaflet**: Interactive maps
- **jsPDF**: PDF report generation
- **OpenWeather API**: Real-time weather data

## 🎨 Design Features

### Glassmorphism UI

- Semi-transparent elements with backdrop blur
- Layered depth and visual hierarchy
- Smooth transitions and hover effects

### Responsive Layout

- Mobile-first design approach
- Flexible grid system
- Touch-friendly interface elements

### Theme System

- Dark mode (default)
- Light mode toggle
- Weather-appropriate background images
- Consistent color palette

## 📱 Usage

### Basic Weather Search

1. Enter a city name in the search box
2. Click "Search" or press Enter
3. View current weather and forecast

### Advanced Features

- **Compare Cities**: Enter two cities to compare weather conditions
- **Use Location**: Click "Use My Location" for current position weather
- **Download Report**: Generate a PDF report of current weather data
- **View History**: Access previously searched cities
- **Toggle Units**: Switch between Celsius and Fahrenheit

### Navigation

- **Home**: Main weather dashboard
- **Forecast**: 5-day weather forecast
- **Compare**: City comparison tool
- **About**: Project information

## 🔧 Customization

### Adding New Weather Icons

1. Add icon files to the `images/` directory
2. Update the `getIconFile()` function in `script.js`
3. Follow the naming convention: `[condition]_icon.jpg`

### Styling Modifications

- Edit `style.css` for visual changes
- Modify CSS custom properties for color schemes
- Update Bootstrap classes for layout changes

### API Integration

- Replace OpenWeather with other weather APIs
- Modify the `fetchWeatherData()` function
- Update data parsing logic as needed

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is created for educational and demonstration purposes. The OpenWeather API is used under their terms of service.

## 🤝 Contributing

This is a learning project showcasing modern web development techniques. Feel free to:

- Fork the repository
- Submit issues and suggestions
- Create pull requests for improvements

## 📞 Contact

- **Email**: contact@weathersim.in
- **API Provider**: OpenWeather
- **Theme**: Glass UI with Light/Dark modes

## 🎯 Learning Objectives

This project demonstrates:

- Modern JavaScript ES6+ features
- API integration and data handling
- Responsive web design principles
- CSS animations and transitions
- Chart.js data visualization
- Leaflet map integration
- PDF generation with jsPDF
- User experience design patterns

---

**Made for UI/UX practice and educational purposes.**
