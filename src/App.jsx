import React, {useState, useEffect} from 'react';

import './App.css';
import Infobox from './Infobox'
import Map from './Map'
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core'
import Table from './Table'
import LineGraph from './LineGraph'
import { sortData, prettyPrintState } from './util';
import 'leaflet/dist/leaflet.css'


function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases') 


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
    .catch((e) => console.log(e))
  }, [])


  useEffect(() =>{
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
              name: country.country,
              value: country.countryInfo.iso2,
            }))
          
          const sortedData = sortData(data)
          setCountries(countries)
          setTableData(sortedData)
          setMapCountries(data)
        })
        .catch(e => console.log(e))
      }

      getCountriesData()
  }, [])

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const url = countryCode === 'worldwide' ? `https://disease.sh/v3/covid-19/all` : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setCountryInfo(data)

      setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      setMapZoom(4)
    })
    .catch((e) => {
      console.log(e)
    })
  }

  return (
    <div className="app">
      <div className="app__left">

        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem key={country.name} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select >
          </FormControl>
        </div>

        <div className="app__stats">
              <Infobox isRed active={casesType === 'cases'} onClick={e => setCasesType('cases')} title="Coronavirus Cases" total={prettyPrintState(countryInfo.cases)}  cases={prettyPrintState(countryInfo.todayCases)} />
              <Infobox active={casesType === 'recovered'} onClick={e => setCasesType('recovered')} title="Recovered" total={prettyPrintState(countryInfo.recovered)} cases={prettyPrintState(countryInfo.todayRecovered)} />
              <Infobox isRed active={casesType === 'deaths'} onClick={e => setCasesType('deaths')} title="Death" total={prettyPrintState(countryInfo.deaths)} cases={prettyPrintState(countryInfo.todayDeaths)} />
        </div>

        <Map 
          center={mapCenter}
          zoom={mapZoom}
          countries={mapCountries}
          casesType={casesType}
        />      
      </div>


      <div className="app__right">
            <Card>
              <CardContent>
                <h3>Live Cases by country</h3>
                <Table countries={tableData} />
                <h3 className="secodti">Worldwide new {casesType}</h3>
                <LineGraph 
                  className="app__graph"
                  casesType={casesType}
                />
              </CardContent>
            </Card>
      </div>
    </div>
  );
}

export default App;
