const http = require('http');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>User List</title></head>');
    res.write('<body>');
    res.write('<h1>Welcome to my website!</h1>');
    res.write('<form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Add User</button></form>');
    res.write('</body>');
    res.write('</html>');
    return res.end();
  };

  if (url === '/users') {
    res.write('<html>');
    res.write('<head><title>User List</title></head>');
    res.write('<body>');
    res.write('<p>List of users</p>');
    res.write('<ul><li>User 1</li><li>User 2</li><li>User 3</li></ul>');
    res.write('</body>');
    res.write('</html>');
    return res.end();
  };
  
  if (url === '/create-user' && method === 'POST') {
    const body = [];
  
    req.on('data', chunk => {
      console.log(chunk);
      body.push(chunk);
    });
  
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split('=')[1];
      console.log('username', username);
      res.statusCode = 302;
      res.setHeader('Location', '/users');
      return res.end();
    });
  };
  
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<body>No matching route found</body>');
  res.write('</html>');
  res.end();
}

const server = http.createServer(requestHandler);

server.listen(3000);