const id = document.querySelector("#weatherData");
const dropDown = document.querySelector("#datalist");
const searchInput = document.querySelector("#search-input");

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
      const optionArray = [...dropDown.children]

      optionArray.forEach(city =>
        city.addEventListener("keydown", (e) => {
          e.preventDefault();
          console.log("hello");
        }))

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

   const hourlyParams = ['temperature_2m', 'relativehumidity_2m', 'apparent_temperature'];
    const dailyParams = ['weathercode', 'temperature_2m_max', 'temperature_2m_min', 'rain_sum', 'snowfall_sum'];
    const apiEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams.join(',')}&daily=${dailyParams.join(',')}&timezone=auto`;
  
  try {
    const jsonResponse = await fetchWeatherData(lat, lon)

    const jsonResponse = await fetchPromise.json();
    console.log(jsonResponse);

    const unit = {
      temp: jsonResponse.hourly_units.temperature_2m,
      humidity: jsonResponse.hourly_units.relativehumidity_2m,
      rain: jsonResponse.daily_units.rain_sum,
      snow: jsonResponse.daily_units.snowfall_sum,
    };

    const [apparentTemp, currentTemp, humidity] = [
      jsonResponse.hourly.apparent_temperature[0],
      jsonResponse.hourly.temperature_2m[0],
      jsonResponse.hourly.relativehumidity_2m[0],
    ].map((value) => value + unit.tempUnit);
    
    const [rain, snow] = [
      jsonResponse.daily.rain_sum[0],
      jsonResponse.daily.snowfall_sum[0],
    ].map((value) => value + unit.rainUnit);

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

/* form.addEventListener("submit", async (e) => {
  e.preventDefault();
  id.classList.add("not-loaded");
  const city = inputQuery.value.trim();
  // console.log(city)
  await updateWeatherData(city);
  id.classList.add("loaded");
}); */

/* async function createDropdownMenu(options, parent) {
  parent.innerHTML = ""; // Clear existing options
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    parent.appendChild(optionElement);
  });
} */

/* const getCity = (list, parent) => {
  createDropdownMenu(list, parent);
  const selectedCity = inputQuery.value;
  return selectedCity;
}; */

/* async function updateWeatherData(city) {
  const coordinates = await getCoordinates(city);
  const weatherData = await getWeatherData(coordinates);
  const htmlMarkup = getHtml(weatherData, city);
  id.innerHTML = htmlMarkup;
} */
/* async function getCoordinates(city) {
  try {
    const apiEndpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
    const fetchPromise = await fetch(apiEndpoint, { mode: "cors" });
    const searchResults = await fetchPromise.json();
    console.log(searchResults);
    // Create an array of formatted options for the dropdown
    const dropdownOptions = searchResults.map((result) => {
      return `${result.display_name} - ${result.addresstype}`;
    });

    // Call the function to create the dropdown with these options
    createDropdownMenu(dropdownOptions, dataList);
    const cityList = searchResults.map((city) => city.display_name);

    // this function will fetch the selected city
    const selectedCity = getCity(cityList, dataList);
    console.log(selectedCity);
    console.log(searchResults); 
    const { lat, lon } = searchResults.find(
      (result) => result.addresstype === "city"
    );

    // this function will fetch the Lat and Lon of the selected city
    return { lat, lon };
  } catch (err) {
    console.error(err);
  }
} 
const getLL = (array, city) => {
  const { lat, lon } = array.find((obj) => obj.addresstype === "city");
  console.log(index);
  const lat = array[index].lat;
  const lon = array[index].lon;
  return { lat, lon };
};*/
