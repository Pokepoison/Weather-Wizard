document.addEventListener('DOMContentLoaded', function () {
    // search button feature
    const searchButton = document.getElementById('search-button');
    const searchValueInput = document.getElementById('search-value');
    const currentWeatherDiv = document.getElementById('today');
    const forecastDiv = document.getElementById('forecast');
    const historyList = document.getElementById('history-list');
  
    // Handle search button click
    searchButton.addEventListener('click', function () {
      const searchTerm = searchValueInput.value.trim();
      searchValueInput.value = '';
  
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    });
  
    // Handle search button enter key press
    searchButton.addEventListener('submit', function (event) {
      const keycode = event.keyCode ? event.keyCode : event.which;
      if (keycode === 13) {
        const searchTerm = searchValueInput.value.trim();
        searchValueInput.value = '';
  
        weatherFunction(searchTerm);
        weatherForecast(searchTerm);
      }
    });
  
    // Pull previous searches from local storage
    let history = JSON.parse(localStorage.getItem('history')) || [];
  
    // Sets history array search to correct length
    if (history.length > 0) {
      weatherFunction(history[history.length + 1]);
    }
  
    // Make a row for each element in history array (searchTerms)
    history.forEach(createRow);
  
    // Puts the searched cities underneath the previously searched city
    function createRow(text) {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.textContent = text;
      listItem.addEventListener('click', function () {
        weatherFunction(text);
        weatherForecast(text);
      });
      historyList.appendChild(listItem);
    }
  
    function weatherFunction(searchTerm) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=9f112416334ce37769e5c8683b218a0d`)
        .then(response => response.json())
        .then(data => {
          if (history.indexOf(searchTerm) === -1) {
            history.push(searchTerm);
            localStorage.setItem('history', JSON.stringify(history));
            createRow(searchTerm);
          }
          currentWeatherDiv.innerHTML = `
            <h3 class="card-title">${data.name} (${new Date().toLocaleDateString()})</h3>
            <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
            <div class="card-body">
              <p class="card-text">Temperature: ${data.main.temp} K</p>
              <p class="card-text">Humidity: ${data.main.humidity} %</p>
              <p class="card-text">Wind Speed: ${data.wind.speed} MPH</p>
            </div>
          `;
          fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=9f112416334ce37769e5c8683b218a0d&lat=${data.coord.lat}&lon=${data.coord.lon}`)
            .then(response => response.json())
            .then(response => {
              const uvColor = getUVColor(response.value);
              const uvIndex = `
                <p class="card-text">UV Index: 
                  <span class="btn ${uvColor}">${response.value}</span>
                </p>
              `;
              currentWeatherDiv.querySelector('.card-body').insertAdjacentHTML('beforeend', uvIndex);
            })
            .catch(error => console.error('Error fetching UV index:', error));
        })
        .catch(error => console.error('Error fetching weather data:', error));
    }
  
    function getUVColor(uvValue) {
      if (uvValue < 3) {
        return 'btn-success';
      } else if (uvValue < 7) {
        return 'btn-warning';
      } else {
        return 'btn-danger';
      }
    } 

    function weatherForecast(searchTerm) {
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=9f112416334ce37769e5c8683b218a0d&units=imperial`)
        .then(response => response.json())
        .then(data => {
          forecastDiv.innerHTML = '<h4 class="mt">5-Day Forecast:</h4>';
          forecastDiv.innerHTML += '<div class="row">';
  
          for (let i = 0; i < data.list.length; i++) {
            if (data.list[i].dt_txt.indexOf('15:00:00') !== -1) {
              const titleFive = `<h3 class="card-title">${new Date(data.list[i].dt_txt).toLocaleDateString()}</h3>`;
              const imgFive = `<img src="https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">`;
              const colFive = '<div class="col">';
              const cardFive = '<div class="card">';
              const cardBodyFive = '<div class="card-body">';
              const humidFive = `<p class="card-text">Humidity: ${data.list[i].main.humidity}%</p>`;
              const tempFive = `<p class="card-text">Temperature: ${data.list[i].main.temp} °F</p>`;
  
              const forecastCard = colFive + cardFive + cardBodyFive + titleFive + imgFive + tempFive + humidFive;
              forecastDiv.querySelector('.row').insertAdjacentHTML('beforeend', forecastCard);
            }
          }
        })
        .catch(error => console.error('Error fetching weather forecast:', error));
    }
  });