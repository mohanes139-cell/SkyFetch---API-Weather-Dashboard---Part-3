// 1. The Constructor Function
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    
    // Grab DOM Elements
    this.form = document.getElementById('weather-form');
    this.input = document.getElementById('city-input');
    this.currentContainer = document.getElementById('current-weather');
    this.forecastSection = document.getElementById('forecast-section');
    this.forecastContainer = document.getElementById('forecast-container');

    // Initialize the app
    this.init();
}

// 2. Prototype Methods
WeatherApp.prototype.init = function() {
    // We MUST use .bind(this) here so 'this' inside handleSearch refers to the WeatherApp, not the form.
    this.form.addEventListener('submit', this.handleSearch.bind(this));
};

WeatherApp.prototype.handleSearch = function(event) {
    event.preventDefault(); // Prevent page reload
    const city = this.input.value.trim();
    
    if (city) {
        this.fetchWeatherData(city);
        this.input.value = ''; // Clear the input field
    }
};

WeatherApp.prototype.fetchWeatherData = async function(city) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        // Fetch both the current weather and 5-day forecast simultaneously
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Could not find weather data for that city. Please check the spelling.');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Pass the fetched data to our render methods
        this.renderCurrentWeather(currentData);
        this.renderForecast(forecastData);

    } catch (error) {
        console.error("API Error:", error);
        alert(error.message); // Simple error handling for the user
    }
};

WeatherApp.prototype.renderCurrentWeather = function(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    this.currentContainer.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <div class="weather-info">
            <img src="${iconUrl}" alt="${data.weather[0].description}">
            <div class="details">
                <p class="temp">${Math.round(data.main.temp)}°C</p>
                <p class="desc" style="text-transform: capitalize;">${data.weather[0].description}</p>
                <p>Humidity: <strong>${data.main.humidity}%</strong></p>
                <p>Wind Speed: <strong>${data.wind.speed} m/s</strong></p>
            </div>
        </div>
    `;
    
    this.currentContainer.classList.remove('hidden');
};

WeatherApp.prototype.renderForecast = function(data) {
    // The 5-day forecast returns data every 3 hours (40 items). 
    // We filter the list to only grab the weather at 12:00:00 PM each day.
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    // Clear out old forecast cards before adding new ones
    this.forecastContainer.innerHTML = ''; 

    dailyData.forEach(day => {
        // Convert the Unix timestamp to a readable day of the week
        const dateObj = new Date(day.dt * 1000);
        const dayString = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h3>${dayString}</h3>
            <img src="${iconUrl}" alt="${day.weather[0].description}">
            <p class="temp">${Math.round(day.main.temp)}°C</p>
            <p class="desc">${day.weather[0].description}</p>
        `;
        
        this.forecastContainer.appendChild(card);
    });

    this.forecastSection.classList.remove('hidden');
};

// 3. Instantiate the Application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const myApiKey = '8700b9af8a32a4b2b24d5969ebe5ae49';
    new WeatherApp(myApiKey);
});