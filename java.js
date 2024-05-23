let map;
let marker;

(() => {
    const municipios = ["Montería", "Cereté", "Lorica", "Sahagún", "Montelíbano", "Planeta Rica", "Tierralta", "Puerto Escondido", "Buenavista", "Ayapel", "San Pelayo", "Puerto Libertador", "Ciénaga de Oro", "San Andrés de Sotavento", "Chimá", "Tuchín", "Valencia", "Cotorra", "Momil", "La Apartada", "Pueblo Nuevo", "San Antero", "Los Córdobas"];
    const selectMunicipios = document.getElementById("municipios");

    municipios.forEach(municipio => {
        const option = document.createElement("option");
        option.value = municipio;
        option.textContent = municipio;
        selectMunicipios.appendChild(option);
    });

    selectMunicipios.addEventListener("change", () => {
        const municipioSeleccionado = selectMunicipios.value;
        obtenerCoordenadasYClima(municipioSeleccionado);
    });
})();

function obtenerCoordenadasYClima(municipio) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${municipio},Córdoba,Colombia`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const latitude = data[0].lat;
                const longitude = data[0].lon;
                actualizarMapa(latitude, longitude);
                obtenerClima(latitude, longitude);
            } else {
                alert('No se encontraron coordenadas para el municipio seleccionado');
            }
        })
        .catch(error => {
            console.error('Error al obtener coordenadas:', error);
        });
}

function actualizarMapa(latitude, longitude) {
    if (map) {
        map.setView([latitude, longitude], 10);
        if (marker) {
            marker.setLatLng([latitude, longitude]);
        } else {
            marker = L.marker([latitude, longitude]).addTo(map).bindPopup('Municipio seleccionado').openPopup();
        }
    } else {
        map = L.map("map", {
            attributionControl: false,
            zoomControl: false,
            tap: false,
            fadeAnimation: false,
            markerZoomAnimation: false
        }).setView([latitude, longitude], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([latitude, longitude]).addTo(map).bindPopup('Municipio seleccionado').openPopup();
    }
}

function obtenerClima(latitude, longitude) {
    const apiKey = '99eda3e604dc82f134e91201e66725e8';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=es`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            mostrarClima(data);
        })
        .catch(error => {
            console.error('Error al obtener el clima:', error);
        });
}

function mostrarClima(data) {
    document.getElementById('temperaturaActual').textContent = `${data.main.temp}°C`;
    document.getElementById('sensacionTermica').textContent = `${data.main.feels_like}°C`;
    document.getElementById('temperaturaMinMax').textContent = `${data.main.temp_min}°C - ${data.main.temp_max}°C`;
    document.getElementById('presionAtmosferica').textContent = `${data.main.pressure} hPa`;
    document.getElementById('humedad').textContent = `${data.main.humidity}%`;
    document.getElementById('viento').textContent = `${data.wind.speed} m/s, ${data.wind.deg}°`;
    document.getElementById('nubosidad').textContent = `${data.clouds.all}%`;
    document.getElementById('precipitacion').textContent = `${data.rain ? data.rain['1h'] : 'N/A'} mm`;
    document.getElementById('salidaPuestaSol').textContent = `${new Date(data.sys.sunrise * 1000).toLocaleTimeString()} - ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;

    // Obtener pronósticos por hora
    obtenerPronosticoPorHora(data.coord.lat, data.coord.lon);

    // Obtener pronósticos diarios
    obtenerPronosticoDiario(data.coord.lat, data.coord.lon);
}



