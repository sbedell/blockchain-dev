/**
 * Kraken Websockets Demo
 * https://www.kraken.com/features/websocket-api
 * 
 * Resources:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
 */

// Create WebSocket connection.
// Sandbox URL: ws-sandbox.kraken.com
// Production URL: ws.kraken.com
let socket = new WebSocket("wss://ws.kraken.com");

// From Kraken: "Once the socket is open you can subscribe to a channel by sending a subscribe request message."
socket.addEventListener('open', event => {
  let subData = {
    "event": "subscribe",
    "pair": [
      "XBT/USD",
      "ETH/USD",
      "LTC/USD" 
    ],
    "subscription": {
      "name": "ticker"
    }
  };

  socket.send(JSON.stringify(subData));
});

// Listen for messages
socket.addEventListener('message', event => {
  console.log('Message from server ', event.data);
});

// Call this to close the connection...but when?
// socket.close();
