const API_KEY = "322eb70a2be5f88b38b8e7bd8d85be18";
const LatLonURL = `http://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${API_KEY}&q=`;
const ForecastURL = `http://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=${API_KEY}`

const buttonSearch = $("#search");
const todayCard = $(".today");
const cards = $(".cards");

let cityArray = JSON.parse(localStorage.getItem("Cities")) || [];

// getting list of 5 day forecasts
function get5DayForecast(list, today) {
    //Receives a list of the 40 forecasts and returns up to 5, 1 for each day.
    //Receives today's day to ignore it on the forecasts.
    let prevDay = null;
    let finalList = [];
    let curForecast = null;
    let index = 0;
    list.forEach((forecast) => {
        const dateOriginal = forecast.dt_txt; //Date like "2024-06-09 03:00:00", we want (6/9/2024)
        const dateObject = dayjs(dateOriginal);
        const day = dateObject.$D;
        const hour = dateObject.$H;
        //Get the forecast at 12PM
        if (day != today && (hour === 12 || (hour < 12 && index == 39)) && (!day || day != prevDay)) {
            prevDay = day;
            formattedForecast = {
                date: `${parseInt(dateObject.$M) + 1}/${dateObject.$D}/${dateObject.$y}`,
                temp: forecast.main.temp,
                humidity: forecast.main.humidity,
                icon: forecast.weather[0].icon,
                speed: forecast.wind.speed,
            }
            finalList.push(formattedForecast);
        }
        index++;
    });
    console.log(finalList);
    return finalList;
}

// functions creates the 5 day forecast cards
function createForecastCards(daysForecast) {
    cards.empty();
    //date, temp, humidity, icon, speed
    daysForecast.forEach((forecast) => {
        // creating divs and cards for each card
        const cardDiv = $('<div>').addClass("card me-3");
        const parentDiv = $('<div>').addClass("card-body").attr("style", "width: 175px");
        const dateHeader = $('<h3>').addClass("card-title");
        const weatherImgURL = `https://openweathermap.org/img/wn/${forecast.icon}.png`;
        const weatherImg = $('<img>').attr("src", weatherImgURL).attr("alt", "Weather Icon");
        const tempP = $('<p>').addClass("card-text");
        const windP = $('<p>').addClass("card-text");
        const humidityP = $('<p>').addClass("card-text");

        // appending to the divs to style and structure with bootstrap
        const dateheaderValue = forecast.date;
        const tempStr = `Temp: ${forecast.temp}ºF`;
        const windStr = `Wind: ${forecast.speed} MPH`;
        const humidityStr = `Humidity: ${forecast.humidity} %`
        dateHeader.text(dateheaderValue);
        tempP.text(tempStr);
        windP.text(windStr);
        humidityP.text(humidityStr);
        parentDiv.append(dateHeader, weatherImg, tempP, windP, humidityP);
        cardDiv.append(parentDiv);

        cards.append(cardDiv);
        console.log("Updated 5 day foreast.");
    });
}

function initializeHistory(){
    cityArray.forEach((city) => {
        drawCityButton(city);
    })
}

function drawCityButton(name){
    const parentEl = $('#city-buttons'); // selecting element to add it to
    const cityButton = $('<button>').addClass("btn btn-secondary w-100 mb-3").text(name); // creating a new button for the city
    cityButton.click(handleSearchHistoryClicked);
    parentEl.append(cityButton); //adding it the right element
}

//the function for creating the search history
function createCityButton(name) {
    //We check that the city isn't already in the history
    const cityAdded = cityArray.includes(name);

    if (!cityAdded) {
        drawCityButton(name);
        cityArray.push(name); // keeping track of the cityNames 
        localStorage.setItem('Cities', JSON.stringify(cityArray));
    }
}

// the function uses the coordinates and name of the city to get the weather of the city
async function searchCity(name, lat, lon) {
    const finalURL = `${ForecastURL}&lat=${lat}&lon=${lon}`
    const response = await fetch(finalURL);
    const forecast = await response.json();
    console.log(forecast);
    //For each forecast we get the date(day), icon, temperature, wind, humidity
    //First we handle the first value (current)
    const dateOriginal = forecast.list[0].dt_txt; //Date like "2024-06-09 03:00:00", we want (6/9/2024)
    const dateObject = dayjs(dateOriginal);
    const dateStr = `${parseInt(dateObject.$M) + 1}/${dateObject.$D}/${dateObject.$y}`; // adding one to the index of months start at zero

    const temp = forecast.list[0].main.temp; //Temperature
    const humidity = forecast.list[0].main.humidity;
    const icon = forecast.list[0].weather[0].icon; //Icon for the current weather
    const speed = forecast.list[0].wind.speed;

    // creating divs and cards for the today card
    const parentDiv = $('<div>').addClass("card-body mb-3");
    const cityWeatherDiv = $('<div>').addClass("d-flex flex-row");
    const cityHeader = $('<h2>').addClass("card-title");
    const weatherImgURL = `https://openweathermap.org/img/wn/${icon}.png`;
    const weatherImg = $('<img>').attr("src", weatherImgURL).attr("alt", "Weather Icon");
    const tempP = $('<p>').addClass("card-text");
    const windP = $('<p>').addClass("card-text");
    const humidityP = $('<p>').addClass("card-text");

    // appending to the divs to style and structure with bootstrap
    const cityheaderValue = `${name} (${dateStr}) `;
    const tempStr = `Temp: ${temp}ºF`;
    const windStr = `Wind: ${speed} MPH`;
    const humidityStr = `Humidity: ${humidity} %`
    cityHeader.text(cityheaderValue);
    tempP.text(tempStr);
    windP.text(windStr);
    humidityP.text(humidityStr);
    cityWeatherDiv.append(cityHeader, weatherImg);
    parentDiv.append(cityWeatherDiv, tempP, windP, humidityP);

    todayCard.empty();
    todayCard.append(parentDiv);
    console.log(`Updated today's foreast for ${name}`);

    // Generating 5 day forecast
    const daysForecast = get5DayForecast(forecast.list, dateObject.$D);
    createForecastCards(daysForecast);
}

function handleSearchHistoryClicked(event) {
    event.preventDefault();
    //searchCoords
    //searchCity and add the forecasts
    const buttonText = $(this).text();
    console.log(`Searching for city: ${buttonText} from history.`);
    searchCoords(buttonText);
}

async function handleButtonClicked() {
    //searchCoords
    //searchCity and add the forecasts
    //Add button to history
    const cityInput = $("#input-city").val();
    console.log(`Searching for city: ${cityInput} from input.`);
    const cityName = await searchCoords(cityInput);
    console.log(`Adding button history for ${cityName}`);

    // Generate search history
    createCityButton(cityName);
}

// function to use API to get code and coordinates
async function searchCoords(cityInput) {
    const finalURL = `${LatLonURL}+${cityInput}`;
    const response = await fetch(finalURL);
    const coords = await response.json();
    console.log(coords);
    //checking coords if null or not
    if (!coords) {
        console.log("The query returned nothing.")
        return
    }
    const lat = coords[0].lat
    const lon = coords[0].lon
    const name = coords[0].name
    console.log(`Coordinates for ${name} are Lat: ${lat}, Lon:${lon}`);
    await searchCity(name, lat, lon);
    return name;
}

$(document).ready(function () {
    initializeHistory();
    buttonSearch.click(handleButtonClicked);
});