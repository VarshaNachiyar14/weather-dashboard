// Variables
let city = "";
const searchCity = $("#search-city");
const searchButton = $("#search-button");
const clearButton = $("#clear-history");
const currentCity = $("#current-city");
const currentTemperature = $("#temperature");
const currentHumidity = $("#humidity");
const currentWSpeed = $("#wind-speed");
const sCity = [];

// API key
const APIKey = "d5366b3a57781db31e3630710863fd10";

// Event handlers
searchButton.on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
clearButton.on("click", clearHistory);

// Display current weather
function displayWeather(event) {
  event.preventDefault();
  const cityInput = searchCity.val().trim();
  if (cityInput !== "") {
    city = cityInput;
    currentWeather(city);
  }
}

// Fetch current weather data
function currentWeather(city) {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
  
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    const weatherIcon = response.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    const date = new Date(response.dt * 1000).toLocaleDateString();
    const tempF = ((response.main.temp - 273.15) * 1.80 + 32).toFixed(2);
    const windSpeedMPH = (response.wind.speed * 2.237).toFixed(1);
    
    $(currentCity).html(`${response.name} (${date}) <img src="${iconUrl}">`);
    $(currentTemperature).html(`${tempF}&#8457;`);
    $(currentHumidity).html(`${response.main.humidity}%`);
    $(currentWSpeed).html(`${windSpeedMPH} MPH`);
    
    forecast(response.id);
    updateSearchHistory(city);
  });
}

// Fetch 5-day forecast
function forecast(cityId) {
  const queryForecastURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${APIKey}`;
  
  $.ajax({
    url: queryForecastURL,
    method: "GET"
  }).then(function(response) {
    for (let i = 0; i < 5; i++) {
      const date = new Date(response.list[((i + 1) * 8) - 1].dt * 1000).toLocaleDateString();
      const iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      const tempF = (((response.list[((i + 1) * 8) - 1].main.temp - 273.5) * 1.80) + 32).toFixed(2);
      const humidity = response.list[((i + 1) * 8) - 1].main.humidity;
      
      $(`#fDate${i}`).html(date);
      $(`#fImg${i}`).html(`<img src="${iconUrl}">`);
      $(`#fTemp${i}`).html(`${tempF}&#8457;`); //using this unicode for degree symbol
      $(`#fHumidity${i}`).html(`${humidity}%`);
    }
  });
}

// Update search history
function updateSearchHistory(city) {
  let cities = JSON.parse(localStorage.getItem("cityname")) || [];
  if (!cities.includes(city.toUpperCase())) {
    cities.push(city.toUpperCase());
    localStorage.setItem("cityname", JSON.stringify(cities));
    addToList(city);
  }
}

// Add city to search history list
function addToList(city) {
  const listEl = $(`<li>${city.toUpperCase()}</li>`);
  listEl.attr("class", "list-group-item");
  listEl.attr("data-value", city.toUpperCase());
  $(".list-group").append(listEl);
}

// Invoke past search from history
function invokePastSearch(event) {
  const liEl = event.target;
  if (liEl.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

// Load last searched city from local storage
function loadLastCity() {
  const cities = JSON.parse(localStorage.getItem("cityname")) || [];
  if (cities.length > 0) {
    cities.forEach(city => addToList(city));
    city = cities[cities.length - 1];
    currentWeather(city);
  }
}

// Clear search history
function clearHistory(event) {
  event.preventDefault();
  localStorage.removeItem("cityname");
  $(".list-group").empty();
  city = "";
  location.reload();
}
