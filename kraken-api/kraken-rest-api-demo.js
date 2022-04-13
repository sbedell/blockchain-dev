/**
 * https://www.kraken.com/features/api#public-market-data
 * https://docs.kraken.com/rest
 */

// Get Asset info: 
// https://api.kraken.com/0/public/Assets
// https://api.kraken.com/0/public/AssetPairs
// "https://api.kraken.com/0/public/Ticker?pair=XBTUSD"
// https://api.kraken.com/0/public/Depth?pair=XBTUSD
// https://api.kraken.com/0/public/OHLC?pair=XBTUSD
// https://api.kraken.com/0/public/SystemStatus

const systemStatusURL = "https://api.kraken.com/0/public/SystemStatus";
const tickerBaseURL = "https://api.kraken.com/0/public/Ticker";
let btcTickerUrl = tickerBaseURL + "?pair=XBTUSD";


console.log("Fetching system status");
//makeApiCall(systemStatusURL);
makeApiCallXmlHttpReq(systemStatusURL);

console.log("fetching " + btcTickerUrl);
makeApiCall(btcTickerUrl);

function makeApiCall(baseURL, params = "") {
  fetch(baseURL + params, { method: "GET", mode: "no-cors" })
  .then(res => res.json()
  ).then(response => { 
    console.log("response: ", response);
  }).catch(error => {
    console.error('Error:', error);
  }).finally(() => {
    // runs after then and catch
  });
}

function makeApiCallXmlHttpReq(apiUrl) {
  console.log("making xml http request for ", apiUrl)
  if (window.XMLHttpRequest) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let response = JSON.parse(xmlhttp.responseText);
        console.log(response);
      }
    }

    xmlhttp.open("GET", apiUrl, true);
    xmlhttp.send();
  } else {
    console.error("Error, this device doesn't support XML HTTP Requests.");
  }
}