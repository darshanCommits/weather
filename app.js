const id = document.querySelector("#weatherData");
const dropDown = document.querySelector("#datalist");
const searchInput = document.querySelector("#search-input");
const cityForm = document.querySelector("form");
const cityObject = {};
let timer;
let cityJson;

searchInput.addEventListener("input", e => events.processSearch(e));
cityForm.addEventListener("submit", e => events.finalize(e));

const api = {
	fetchQuery: async input => {
		if (input === "" || input.length < 1) return;

		try {
			const query = input.toLowerCase().trim();
			console.log(query);

			const apiEndpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
			const res = await fetch(apiEndpoint, { mode: "cors" });
			const data = await res.json();
			console.log(data);

			return data;
		} catch (error) {
			console.error(error);
		}
	},

	fetchWeatherData: async (lat, lon) => {
		const hourlyParam =
			"temperature_2m,relativehumidity_2m,apparent_temperature";
		const dailyParam =
			"weathercode,temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum";
		const apiEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParam}&daily=${dailyParam}&timezone=auto`;

		try {
			const response = await fetch(apiEndpoint, { mode: "cors" });

			if (!response.ok)
				throw new Error(`Network response : Not Okay.
	      \nTry checking typos in apiEndpoint variable.`);

			return await response.json();
		} catch (error) {
			throw new Error(`Failed to fetch weather data: ${error.message}`);
		}
	},
};

const ui = {
	getHtml: (weatherData, city) => {
		let htmlMarkup = `
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
	},

	setHTML: htmlMarkup => {
		id.innerHTML = htmlMarkup;
	},

	populateDropdown: cities => {
		dropDown.innerHTML = "";
		cities.forEach(city => {
			const option = ui.createDropdownOption(city);
			dropDown.appendChild(option);
		});
	},

	createDropdownOption: city => {
		const option = document.createElement("option");
		option.value = city;
		option.textContent = city;
		return option;
	},
};

const events = {
	finalize: async e => {
		e.preventDefault();
		id.classList.remove("loaded");
		id.classList.add("not-loaded");

		const input = searchInput.value;
		const cityName = input.split(",")[0];
		const { lat, lon } = cityObject[input];

		const res = await api.fetchWeatherData(lat, lon);
		const resres = processData.getWeatherData(res);
		console.log(resres);
		const markup = ui.getHtml(resres, cityName);

		id.classList.remove("not-loaded");
		id.classList.add("loaded");
		ui.setHTML(markup);
	},

	getCityList: async () => {
		const input = searchInput.value;
		cityJson = await api.fetchQuery(input);

		cityJson.forEach(x => {
			const { display_name, lat, lon } = x;
			cityObject[display_name] = { lat, lon };
		});

		const cities = Object.keys(cityObject);
		return cities;
	},

	processSearch: e => {
		e.preventDefault();
		searchInput.setAttribute("autocomplete", "off");
		clearTimeout(timer);
		timer = setTimeout(async () => {
			const cities = await events.getCityList();
			ui.populateDropdown(cities);
			searchInput.setAttribute("autocomplete", "on");
		}, 300);
	},
};

const processData = {
	getWeatherData: res => {
		try {
			const unit = {
				temp: res.hourly_units.temperature_2m,
				humidity: res.hourly_units.relativehumidity_2m,
				rain: res.daily_units.rain_sum,
				snow: res.daily_units.snowfall_sum,
			};

			const apparentTemp = res.hourly.apparent_temperature[0] + unit.temp;
			const currentTemp = res.hourly.temperature_2m[0] + unit.temp;
			const humidity = res.hourly.relativehumidity_2m[0] + unit.humidity;
			const rain = res.daily.rain_sum[0] + unit.rain;
			const snow = res.daily.snowfall_sum[0] + unit.snow;

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
	},
};
