// const city = "Mawsynram";
const id = document.querySelector("#weatherData");
/* const inputQuery = document.querySelector("form input[type=text]");
const form = document.querySelector("form");
const dataList = document.querySelector("#datalist"); */
//
const dropDown = document.querySelector("#drop-down");
const searchInput = document.querySelector("#search-input");

let timer;
let executeQuery = false;
searchInput.addEventListener("input", () => {
  executeQuery = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (executeQuery) {
      handleQuery();
      executeQuery = false;
    }
  }, 1200);
});

// handleQuery(every 1s) --> populateDropdown(data)
// get the data from the api and extract {len,lon}
async function handleQuery() {
  if (searchInput.value === "" || searchInput.value.length < 1) return;
  try {
    const query = searchInput.value.toLowerCase().trim();
    console.log("query", query);
    const apiEndpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
    const res = await fetch(apiEndpoint, { mode: "cors" });
    const data = await res.json();
    populateDropdown(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

// populateDropdown(data:CityDataObject) => pass {lat,lon} to getWeatherr() and fill the weather data in html
function populateDropdown(data) {
  dropDown.innerHTML = "";

  data.forEach((item) => {
    const { lat, lon } = item;
    const option = document.createElement("option");
    option.value = `${
      item.addresstype.toString() + item.display_name.toString()
    }`;
    option.textContent = `${
      item.addresstype.toString() + ": " + item.display_name.toString()
    }`;
    option.addEventListener("click", async () => {
      id.classList.add("not-loaded");
      const weather = await getWeatherData({ lat, lon });
      const htmlMarkup = getHtml(
        weather,
        `${item.addresstype + ": " + item.display_name}`
      );
      id.classList.add("loaded");
      console.log(htmlMarkup);
      if (htmlMarkup) id.innerHTML = htmlMarkup;
    });
    dropDown.appendChild(option);
  });
}

async function getWeatherData({ lat, lon }) {
  try {
    const hourlyParams = ['temperature_2m', 'relativehumidity_2m', 'apparent_temperature'];
    const dailyParams = ['weathercode', 'temperature_2m_max', 'temperature_2m_min', 'rain_sum', 'snowfall_sum'];
    const apiEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams.join(',')}&daily=${dailyParams.join(',')}&timezone=auto`;
    
    const fetchPromise = await fetch(apiEndpoint, { mode: "cors" });
    const jsonResponse = await fetchPromise.json();
    console.log(jsonResponse);
    if (!fetchPromise.ok) {
      throw new Error(
        "Network response : Not Okay.\nTry checking typos in apiEndpoint variable."
      );
    }

    const unit = {
      tempUnit: jsonResponse.hourly_units.temperature_2m,
      humidityUnit: jsonResponse.hourly_units.relativehumidity_2m,
      rainUnit: jsonResponse.daily_units.rain_sum,
      snowUnit: jsonResponse.daily_units.snowfall_sum,
    };

    const apparentTemp =
      jsonResponse.hourly.apparent_temperature[0] + unit.tempUnit;
    const currentTemp = jsonResponse.hourly.temperature_2m[0] + unit.tempUnit;
    const humidity =
      jsonResponse.hourly.relativehumidity_2m[0] + unit.humidityUnit;
    const rain = jsonResponse.daily.rain_sum[0] + unit.rainUnit;
    const snow = jsonResponse.daily.snowfall_sum[0] + unit.snowUnit;

    return {
      currentTemp,
      apparentTemp,
      humidity,
      rain,
      snow,
    };
  } catch (err) {
    console.error(err);
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
