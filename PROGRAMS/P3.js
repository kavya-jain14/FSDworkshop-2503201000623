// Import the built-in HTTP module
const http = require('http');

// Define the server port
const PORT = 3000;

// Create the HTTP server
const server = http.createServer((req, res) => {
    // 1. Establish the status code first
    res.statusCode = 404;

    // 2. Set the response headers and apply the status code
    res.writeHead(res.statusCode, {
        'Content-Type': 'text/plain',
        'X-Powered-By': 'Node.js'
    });

    // 3. Send both Hello World and the status code in the body
    res.end(`Hello World. Status Code: ${res.statusCode}\n`);
});

// Start the server and listen on port 3000
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
