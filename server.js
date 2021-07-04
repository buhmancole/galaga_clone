let http = require('http');
let path = require('path');
let fs = require('fs');
let mimeTypes = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ogg': 'audio/ogg'
}
const port = 3000;

function handleRequest(request, response) {
    console.log('request: ', request.url);
    let file = (request.url == '/' ? 'index.html' : decodeURI(request.url).substring(1));

    fs.access(file, fs.constants.R_OK, err => {
        console.log(err ? `${file} doesn't exist` : `${file} ' is there`);
        if (err) {
            response.writeHead(404);
            response.end();
        } else {
            fs.readFile(file, (error, data) => {
                if (error) {
                    response.writeHead(500);
                    response.end('Server Error');
                } else {
                    let headers = {'Content-type': mimeTypes[path.extname(file)]};
                    response.writeHead(200, headers);
                    response.end(data);
                }
            });
        }
    });
}

http.createServer(handleRequest).listen(port, () => {
    console.log('Server is listening on port ' + port);
});