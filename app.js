// const city = "Mawsynram";
const id = document.querySelector("#weatherData");
const inputQuery = document.querySelector("form input[type=text]");
const form = document.querySelector("form");
const dataList = document.querySelector("#datalist")

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  id.classList.add("not-loaded")
  const city = inputQuery.value.trim();
  // console.log(city)
  await updateWeatherData(city);
  id.classList.add("loaded");
})

async function getCoordinates(city) {
  try {
    const apiEndpoint = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
    const fetchPromise = await fetch(apiEndpoint, { mode: "cors" });
    const searchResults = await fetchPromise.json();

    if (!fetchPromise.ok)
      throw new Error("Network response : not okay.");
    if (searchResults.length === 0)
      throw new Error("No such city found!!")
    // if (searchResults.length !== 1) {
    //   createDropdownMenu(cityList)
    // }

    const lat = searchResults[0].lat;
    const lon = searchResults[0].lon;

    return { lat, lon };
  }

  catch (err) {
    console.error(err);
  }
}

function createDropdownMenu(cityList, parent) {
  cityList.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    parent.appendChild(option);
  })
}

async function getWeatherData({ lat, lon }) {
  try {
    const hourlyParam = `temperature_2m,relativehumidity_2m,apparent_temperature`;
    const dailyParam = `weathercode,temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum`;
    const apiEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParam}&daily=${dailyParam}&timezone=auto`
    const fetchPromise = await fetch(apiEndpoint, { mode: "cors" });
    const jsonResponse = await fetchPromise.json();
    //     console.log(jsonResponse)
    if (!fetchPromise.ok) {
      throw new Error("Network response : Not Okay.\nTry checking typos in apiEndpoint variable.");
    }

    const unit = {
      tempUnit: jsonResponse.hourly_units.temperature_2m,
      humidityUnit: jsonResponse.hourly_units.relativehumidity_2m,
      rainUnit: jsonResponse.daily_units.rain_sum,
      snowUnit: jsonResponse.daily_units.snowfall_sum,
    };
    //     console.log(unit)

    const apparentTemp = jsonResponse.hourly.apparent_temperature[0] + unit.tempUnit;
    const currentTemp = jsonResponse.hourly.temperature_2m[0] + unit.tempUnit;
    const humidity = jsonResponse.hourly.relativehumidity_2m[0] + unit.humidityUnit;
    const rain = jsonResponse.daily.rain_sum[0] + unit.rainUnit;
    const snow = jsonResponse.daily.snowfall_sum[0] + unit.snowUnit;

    return {
      currentTemp,
      apparentTemp,
      humidity,
      rain,
      snow,
    }
  }
  catch (err) {
    console.error(err);
  }
}

async function updateWeatherData(city) {
  const coordinates = await getCoordinates(city);
  const weatherData = await getWeatherData(coordinates);
  const htmlMarkup = getHtml(weatherData, city);

  id.innerHTML = htmlMarkup;
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
`
  if (weatherData.rain !== "0mm")
    htmlMarkup += `
    <div>
      <h1>Rain </h1>
      <h1>${weatherData.rain}</h1>
    </div>
`
  if (weatherData.snow !== "0cm")
    htmlMarkup += `
    <div>
      <h1>Snow </h1>
      <h1>${weatherData.snow}</h1>
    </div>
`
  return htmlMarkup;
}

