const API_KEY = "322eb70a2be5f88b38b8e7bd8d85be18";
const LatLonURL = `http://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${API_KEY}&q=`;
const ForecastURL = `http://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}`


//Write on the input: Minneapolis
//Click the button
//We take the value from the input
//We put that value into the LatLonURL
//Make the request with the FinalURL (LatLonURL+Input)
//We get the Latitude and the Longitude

const buttonSearch = $("#search")

async function searchCity(name, lat, lon){

}

async function searchCoords() {
    const cityInput = $("#input-city").val()
    const finalURL = `${LatLonURL}+${cityInput}`
    const response = await fetch(finalURL);
    const forecast = await response.json();
    console.log(forecast);
    //forecast may be a list of length 1, or it may be empty.
    if (!forecast){
        console.log("The query returned nothing.")
        return
    }
    const lat = forecast[0].lat
    const lon = forecast[0].lon
    const name = forecast[0].name
    console.log(name, lat, lon)
    
}

$(document).ready(function(){
    buttonSearch.click(searchCoords);
});