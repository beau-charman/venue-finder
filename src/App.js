import axios from 'axios';
import debounce from 'lodash/debounce'
import get from 'lodash/get';
import moment from 'moment';
import React from 'react';
import './App.css';

const CLIENT_ID = '22PFJDV1OOI3Q1GDZFOM30GWLOZRQ55W42KUOVSSO4I4KIBX'
const CLIENT_SECRET = 'PEKIXF4YWBV0TKUGBDMNY5HARFC13ZLUBZUVFKU10TCCWIE1'
const DATE_KEY = moment(new Date()).format('YYYYMMDD');
const END_POINT = 'https://api.foursquare.com/v2/venues/explore'
const INITIAL_STATE = { loading: false, query: '', results: [] }
const DEBOUNCE_WAIT = 400;

const fetchData = debounce(async function(query, type, mutate) {
  mutate((state) => ({
    ...state, loading: true,
  }))

  try {
    const response = await axios(`${END_POINT}?${type}=${query}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${DATE_KEY}`);

    mutate((prevState) => ({
      ...prevState,
      loading: false,
      results: get(response.data.response.groups[0], 'items', []),
    }))
  } catch (error) {
    console.error(error);

    mutate((prevState) => ({
      ...prevState,
      loading: false,
      results: [],
    }))
  }
}, DEBOUNCE_WAIT)

const ResultsList = ({ query, results }) => (
  <>
    <h2 className="resultsMessage">Results for <span className="query">{query}</span></h2>
    <ul className="list">
      {results.map(result => (
        <li className="venue" key={result.venue.id}>
          <h3 className="venueName">{result.venue.name}</h3>
          <address className="venueAddress">{result.venue.location.address}</address>
          <div className="venueCategory">{result.venue.categories.map(category => category.name).join(', ')}</div>
        </li>
      ))}
    </ul>
  </>
)

const WelcomeText = () => (
  <h2 className="welcomeText">Please enter an address to find nearby venues.</h2>
)

const NoResults = ({ query }) => (
  <h2 className="noResults">No results found for {query}</h2>
)

const Loading = () => (
  <>
    <h2 className="loadingHeading">Fetching results...</h2>
    <img className="loading" alt="unicorn spinner" src="./unicorn-spinner.gif"/>
  </>
)

const App = () => {
  const [state, setState] = React.useState(INITIAL_STATE);

  const handleGeoData = (geoData) => {
    const query = `${geoData.coords.latitude},${geoData.coords.longitude}`;

    setState((prevState) => ({
      ...prevState,
      results: [],
      query,
    }));

    fetchData(query, 'll', setState);
  }

  const handleOnChange = (query) => {
    setState((prevState) => ({
      ...prevState,
      results: [],
      query,
    }))

    if (query.length >= 3) {
      fetchData(query, 'near', setState);
    }
  };

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(handleGeoData);
  }, [])


  return (
    <div className="base">
      <header className="header">
        <h1 className="title">Venue finder</h1>
        <input
          className="input"
          onChange={(event) => handleOnChange(event.target.value)}
          placeholder="address..."
          value={state.query}
        />
        {state.loading ? (
          <Loading />
        ) : state.query.length === 0 ? (
          <WelcomeText />
        ) : state.results.length === 0 ? (
          <NoResults query={state.query} />
        ) : (
          <ResultsList query={state.query} results={state.results} />
        )}
      </header>
    </div>
  );
}

export default App;
