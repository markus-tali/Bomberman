
let socket: WebSocket | null = null;

export function setUpWebSocket(): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket is already opened.");
    return;
  }

  socket = new WebSocket("ws://localhost:8080/ws");

  socket.onopen = () => {
    console.log("WebSocketi is opened!");
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          message: "Hi there",
        })
      );
    }
  };

  socket.onclose = function(event: CloseEvent) {
    console.log('WebSocket is closed:', event);
  };

  socket.onerror = function(event: Event) {
    console.error('WebSocketi error:', event);
  };

  socket.onmessage = function(event: MessageEvent) {
    console.log('You got a message from server:', event.data);
  };
}