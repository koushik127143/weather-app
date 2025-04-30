const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfosection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchcitysection = document.querySelector('.section-message');
const conditionsection = document.querySelector('.condition-text');
const humidityvalueTxt = document.querySelector('.humiditiy-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const WeathersummaryImg = document.querySelector('.forecast-item-img');
const currentDateElement = document.querySelector('.forecast-item-date'); // Renamed to avoid conflict
const apikey = '1621e2ec2ae428fe1efb785591fea43a';
const forecastItemcontainer = document.querySelector('.forecast-items-container');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-text');


notFoundSection.querySelector('h1').textContent = 'City Not Found';
notFoundSection.querySelector('h4').textContent = 'Please try another city name';

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateweatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateweatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endPoint, city) {
    // Modify your API URL to include country code:
const apiurl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city},IN&units=metric&appid=${apikey}`;
// The ",IN" specifies India as the country
    const response = await fetch(apiurl);
    if (!response.ok) {
        throw new Error('City not found');
    }
    return response.json();
}

function getwetherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmospher.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getcurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

// ... (keep all your existing DOM selectors)

async function updateweatherInfo(city) {
    try {
        const weatherData = await getFetchData('weather', city);
        
        // Check if response is valid (OpenWeatherMap uses 'cod' property)
        if (weatherData.cod !== 200) {
            showDisplaysection(notFoundSection);
            return;
        }

        console.log(weatherData);

        const {
            name: country,
            main: { temp, humidity },
            wind: { speed },
            weather: [{ main, id }]
        } = weatherData;

        // Update DOM elements
        countryTxt.textContent = country;
        tempTxt.textContent = `${Math.round(temp)} °C`; // Fixed: using tempTxt
        conditionsection.textContent = main;
        humidityvalueTxt.textContent = `${humidity}%`;
        windValueTxt.textContent = `${speed} m/s`;
        currentDateElement.textContent = getcurrentDate();
        WeathersummaryImg.src = `assets/weather/${getwetherIcon(id)}`;

        await updateForecastInfo(city);
        showDisplaysection(weatherInfosection);
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showDisplaysection(notFoundSection);
    }
}

async function updateForecastInfo(city) {
    try {
        const forecastData = await getFetchData('forecast', city); // Fixed typo in endpoint

        const timeTaken = '12:00:00';
        const todayDate = new Date().toISOString().split('T')[0];

        forecastItemcontainer.innerHTML = '';
        
        forecastData.list.forEach(forecastweather => {
            if (forecastweather.dt_txt.includes(timeTaken) &&
                !forecastweather.dt_txt.includes(todayDate)) {
                updateForecastItems(forecastweather);
            }
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// ... (keep all other existing functions)

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const datetaken = new Date(date);
    const dateoptions = {
        day: '2-digit',
        month: 'short',
    };
    const dateResult = datetaken.toLocaleDateString('en-US', dateoptions);
    
    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="weather/${getwetherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `; // Fixed: Added missing < in div and fixed temp display
    forecastItemcontainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaysection(section) {
    [weatherInfosection, searchcitysection, notFoundSection]
        .forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
