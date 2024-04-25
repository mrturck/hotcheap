from datetime import datetime, timedelta
from ryanair import Ryanair
from ryanair.types import Flight
from flask import Flask, jsonify, request
import pandas as pd
from dotenv import load_dotenv
import os
from pyowm import OWM
from pyowm.utils import config
from pyowm.utils import timestamps


load_dotenv("../.env")
owm_key = os.getenv("OPENWEATHER_KEY")
# print(owm_key)

owm = OWM(owm_key)
mgr = owm.weather_manager()

def get_three_hourly_forecast_five_days(latitude: float, longitude: float):
    """
    Fetches the 3-hourly weather forecast for the next five days using latitude and longitude.
    
    Args:
    latitude (float): The latitude of the location.
    longitude (float): The longitude of the location.
    
    Returns:
    list: A list of dictionaries containing the forecast data.
    """
    forecast_mgr = mgr.forecast_at_coords(latitude, longitude, '3h')
    forecast = forecast_mgr.forecast
    forecast_data = []
    
    for weather in forecast:
        forecast_data.append({
            "time": weather.reference_time('iso'),
            "status": weather.detailed_status,
            "temperature": weather.temperature('celsius')['temp'],
            "wind_speed": weather.wind()['speed'],
            "rain": weather.rain,
            "snow": weather.snow
        })

    max_temp = max(weather['temperature'] for weather in forecast_data)
    day_of_max_temp = max(forecast_data, key=lambda x: x['temperature'])['time']
    
    return (max_temp, day_of_max_temp, forecast_data)



app = Flask(__name__)

api = Ryanair(currency="GBP")

eu_airports = pd.read_csv(os.path.join(os.path.dirname(__file__), 'eu_airports.csv'))

# {'id': 4340,
# 'ident': 'LIMC',
# 'type': 'large_airport',
# 'name': 'Milan Malpensa International Airport',
# 'latitude_deg': 45.6306,
# 'longitude_deg': 8.72811,
# 'elevation_ft': 768.0,
# 'continent': 'EU',
# 'iso_country': 'IT',
# 'iso_region': 'IT-25',
# 'municipality': 'Ferno (VA)',
# 'scheduled_service': 'yes',
# 'gps_code': 'LIMC',
# 'iata_code': 'MXP',
# 'local_code': 'MI12',
# 'home_link': 'http://www.sea-aeroportimilano.it/en/malpensa/index.phtml',
# 'wikipedia_link': 'https://en.wikipedia.org/wiki/Malpensa_Airport',
# 'keywords': 'MIL'}

def lookup_airport_by_iata(iata_code):
    airport = eu_airports[eu_airports['iata_code'] == iata_code]
    if not airport.empty:
        return airport.to_dict(orient='records')[0]
    else:
        return None

#   [{
#     "currency": "GBP",
#     "departureTime": "2024-04-27T07:25:00",
#     "destination": "MXP",
#     "destinationFull": "Milan Malpensa, Italy",
#     "flightNumber": "FR 2757",
#     "origin": "STN",
#     "originFull": "London Stansted, United Kingdom",
#     "price": 159.99
#   }],

def fetch_flights(date: datetime, origin: str):
    flights = api.get_cheapest_flights(origin, date, date + timedelta(days=1))

    flights_data = []
    for flight in flights:
        flight_info = {
            "departureTime": flight.departureTime.isoformat(),
            "flightNumber": flight.flightNumber,
            "price": flight.price,
            "currency": flight.currency,
            "origin": flight.origin,
            "originFull": flight.originFull,
            "destination": flight.destination,
            "destinationFull": flight.destinationFull
        }
        flights_data.append(flight_info)

    return flights_data


def get_weather(flight):
    airport = lookup_airport_by_iata(flight["destination"])
    if airport is None:
        print("No airport found for", flight["destination"])
        return None
    weather = get_three_hourly_forecast_five_days(airport["latitude_deg"], airport["longitude_deg"])
    return weather

def get_airport_weathers_dict(flights):
    airport_weathers = {}
    for flight in flights:
        if flight["destination"] not in airport_weathers:
            airport_weathers[flight["destination"]] = get_weather(flight)
    return airport_weathers

@app.route('/flights', methods=['GET'])
def get_flights():
    # query params
    pwd = request.args.get('pwd', 'password')
    if pwd != os.getenv("DATASERVER_PWD"):
        return jsonify({"error": "Invalid password"}), 401

    date_str = request.args.get('date', (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d'))
    airport = request.args.get('airport', 'STN')
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    all_flights_data = fetch_flights(date, airport)
    print("got ", len(all_flights_data), "flights")
    flights_data = all_flights_data[:50]

    airport_weathers = get_airport_weathers_dict(flights_data)

    print("got ", len(airport_weathers), "airport weathers")

    for flight in flights_data:
        weather = airport_weathers[flight["destination"]]
        if weather is not None:
            flight["max_temp"] = weather[0]
            flight["day_of_max_temp"] = weather[1]
        else:
            flight["max_temp"] = None
            flight["day_of_max_temp"] = None
            # flight["forecast"] = weather[2]

    for flight in flights_data:
        if flight["max_temp"] is not None:
            score = flight["max_temp"] / flight["price"]
            flight["score"] = score
        else:
            flight["score"] = 0

    flights_data.sort(key=lambda x: x["score"], reverse=True)

    return jsonify(flights_data)


if __name__ == '__main__':
    app.run(debug=True)

    # date = datetime.today().date() + timedelta(days=1)
    # result = fetch_flights(date, "STN")

    # result = [
    #     {
    #         "currency": "GBP",
    #         "departureTime": "2024-04-27T07:25:00",
    #         "destination": "MXP",
    #         "destinationFull": "Milan Malpensa, Italy",
    #         "flightNumber": "FR 2757",
    #         "origin": "STN",
    #         "originFull": "London Stansted, United Kingdom",
    #         "price": 159.99
    #     },
    #     {'departureTime': '2024-04-27T11:55:00', 'flightNumber': 'FR 1782', 'price': 101.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'BOD', 'destinationFull': 'Bordeaux, France'},
    #     {'departureTime': '2024-04-27T15:05:00', 'flightNumber': 'RK 7870', 'price': 109.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'RAK', 'destinationFull': 'Marrakesh, Morocco'},
    #     # {'departureTime': '2024-04-26T06:20:00', 'flightNumber': 'FR 2225', 'price': 113.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'TLL', 'destinationFull': 'Tallinn, Estonia'},
    #     # {'departureTime': '2024-04-27T16:55:00', 'flightNumber': 'FR 15', 'price': 142.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'ATH', 'destinationFull': 'Athens, Greece'},
    #     {'departureTime': '2024-04-27T17:30:00', 'flightNumber': 'FR 2642', 'price': 143.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'RIX', 'destinationFull': 'Riga, Latvia'}
    #     # {'departureTime': '2024-04-27T16:55:00', 'flightNumber': 'FR 2687', 'price': 151.99, 'currency': 'GBP', 'origin': 'STN', 'originFull': 'London Stansted, United Kingdom', 'destination': 'CAG', 'destinationFull': 'Cagliari, Italy'}
    # ]


    #     for flight in result:
    #     print(flight["destination"], flight["score"], flight["max_temp"], flight["day_of_max_temp"], flight["price"])

    # print(result)


