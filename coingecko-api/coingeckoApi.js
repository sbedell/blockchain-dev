/**
 * https://www.coingecko.com/en/api
 */

const coingeckoURL = "https://api.coingecko.com/api/v3/";

function makeApiCall(baseURL, params) {
  fetch(baseURL + params)
  .then(res => res.json())
  .then(response => {
    console.log("response: ", response);
  }).catch(error => {
    console.error('Error: ', error);
  }).finally(() => {
    // runs after then and catch
  });
}

makeApiCall(coingeckoURL, "/exchange_rates");