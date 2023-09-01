const id = document.querySelector("#weatherData");
const dropDown = document.querySelector("#datalist");
const searchInput = document.querySelector("#search-input");
const cityForm = document.querySelector("form");

let timer;
let executeQuery = false;

searchInput.addEventListener("input", (e) => {
  e.preventDefault();
  executeQuery = true;
  clearTimeout(timer);

  timer = setTimeout(async () => {

    if (executeQuery) {
      const data = await fetchAPI();
      // This will update datalist
      populateDropdown(data);

      cityForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("happy")
      })
      executeQuery = false;
    }
  }, 300);
});

// fetchAPI(every 1s) --> populateDropdown(data)
// get the data from the api and extract {len,lon}
async function fetchAPI() {
  // ERROR checking for empty string
  if (searchInput.value === "" || searchInput.value.length < 1) return;

  try {
    const query = searchInput.value.toLowerCase().trim();

    const apiEndpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
    const res = await fetch(apiEndpoint, { mode: "cors" });
    const data = await res.json();

    return data;

  } catch (error) {
    console.error(error);
  }
}

// populateDropdown(data:CityDataObject) => pass {lat,lon} to getWeatherr() and fill the weather data in html

const getCoordinates = (array) => {
  const { lat, lon } = array.find(obj => obj.addresstype === "city");
  return { lat, lon };
};

const setHTML = async () => {
  id.classList.add("not-loaded");

  const { lat, lon } = getCoordinates(cities);
  console.log({ lat, lon })
  const weather = await getWeatherData({ lat, lon });
  const htmlMarkup = getHtml(weather, cityName);

  id.classList.add("loaded");

  if (htmlMarkup)
    id.innerHTML = htmlMarkup;
}

const setDropdownHtml = city => {
  const option = document.createElement("option");
  const cityName = `${city.addresstype.toString()} : ${city.display_name.toString()}`
  option.value = cityName;
  option.textContent = cityName;
  dropDown.appendChild(option);
}

function populateDropdown(cities) {
  dropDown.innerHTML = "";
  console.log(cities)
  cities.forEach(city => setDropdownHtml(city));
}

async function fetchWeatherData(lat, lon) {
  const hourlyParam = `temperature_2m,relativehumidity_2m,apparent_temperature`;
  const dailyParam = `weathercode,temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum`;
  const apiEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParam}&daily=${dailyParam}&timezone=auto`;

  try {
    const response = await fetch(apiEndpoint, { mode: "cors" });

    if (!fetchPromise.ok)
      throw new Error(`Network response : Not Okay.
      \nTry checking typos in apiEndpoint variable.`);

    return await response.json();

  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

async function getWeatherData({ lat, lon }) {
  try {
    const jsonResponse = await fetchWeatherData(lat, lon)

    const unit = {
      temp: jsonResponse.hourly_units.temperature_2m,
      humidity: jsonResponse.hourly_units.relativehumidity_2m,
      rain: jsonResponse.daily_units.rain_sum,
      snow: jsonResponse.daily_units.snowfall_sum,
    };

    const apparentTemp = jsonResponse.hourly.apparent_temperature[0] + unit.temp;
    const currentTemp = jsonResponse.hourly.temperature_2m[0] + unit.temp;
    const humidity = jsonResponse.hourly.relativehumidity_2m[0] + unit.humidity;
    const rain = jsonResponse.daily.rain_sum[0] + unit.rain;
    const snow = jsonResponse.daily.snowfall_sum[0] + unit.snow;

    return {
      currentTemp,
      apparentTemp,
      humidity,
      rain,
      snow,
    };

  } catch (err) {
    throw new Error(`Failed to Fetch weather data : ${err.message}`);
  }
}

function getHtml(weatherData, city) {
  const htmlMarkup = `
    <h1>${city}</h1>
    <div>
      <h1>Temprature </h1>
      <h1>${weatherData.currentTemp}</h1>
    </div>
    <div>
      <h1>Feels like </h1>
      <h1>${weatherData.apparentTemp}</h1>
    </div>
    <div>
      <h1>Humidity </h1>
      <h1>${weatherData.humidity}</h1>
    </div>
`;
  if (weatherData.rain !== "0mm")
    htmlMarkup += `
    <div>
      <h1>Rain </h1>
      <h1>${weatherData.rain}</h1>
    </div>
`;
  if (weatherData.snow !== "0cm")
    htmlMarkup += `
    <div>
      <h1>Snow </h1>
      <h1>${weatherData.snow}</h1>
    </div>
`;
  return htmlMarkup;
}

