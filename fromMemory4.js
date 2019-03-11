let http  = require("http");
let url = require("url");
let path = require("path");
let fs = require("fs");

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/js",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}
class SimpleServer {
    constructor(port) {
        let app = this;
        this.port = port;
        this.methods = {
            get: {
                paths: {},
            },
            post: {
                paths: {},
            },
        }
        this.server = http.createServer();
        this.server.listen(this.port);
        this.handleGet = function(req, res) {
            let urlPath = url.parse(req.url);
            let sanitized = path.normalize(urlPath.pathname);
            let found = false;
            for (var key in app.methods["get"].paths) {
                if (key == sanitized && !found) {
                    found = true;
                    app.methods["get"].paths[key](req, res);
                }
            }
            if (!found) {
                app.static(req, res);
            }
        }
        this.handlePost = function(req, res) {
            let urlPath = url.parse(req.url);
            let sanitized = path.normalize(urlPath.pathname);
            let found = false;
            for (var key in app.methods["post"].paths) {
                if (key == sanitized && !found) {
                    found = true;
                    app.methods["post"].paths[key](req, res);
                }
            }
            if (!found) {
                app.static(req, res);
            }
        }
        this.middleware = function(req, res) {
            let method = req.method;
            if (method == "GET" || method == "get") {
                app.handleGet(req, res);
            } else if (method == "POST" || method == "post") {
                app.handlePost(req, res);
            } else {
                app.static(req, res);
            }
        }
        this.static = function(req, res) {
            let urlPath = url.parse(req.url);
            let sanitized = path.normalize(urlPath.pathname);
            let pathname = path.join(__dirname, sanitized);
            res.sendFile(pathname);
        }
        this.server.on("request", function(req, res) {
            res.status = function(status) {
                res.statusCode = status;
            }
            res.headers = function(headers) {
                for (var key in headers) {
                    res.setHeader(key, headers[key]);
                }
            }
            res.sendFile = function(pathname)  {
                fs.exists(pathname, function(exists) {
                    if (exists) {
                    let stats = fs.statSync(pathname);
                    if (stats.isDirectory()) {
                        pathname += "/index.html";
                    }
                    fs.readFile(pathname, function(err, info) {
                        if (err) {
                            res.status(500);
                            res.end("An unknown error occured");
                        } else {
                            res.status(200);
                            let extension = path.parse(pathname).ext;
                            res.headers({"Content-Type": mimeTypes[extension] || "text/plain"});
                            res.end(info);
                        }
                    })
                    } else {
                        res.status(404);
                        res.end("File not found");
                    }
                })
            }
            app.middleware(req, res);
        });
    }
    get(path, callback) {
        this.methods["get"].paths[path] = callback;
    }
    post(path, callback) {
        this.methods["post"].paths[path] = callback;
    }
}

let app = new SimpleServer(8888);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/compass.html");
});
app.get("/products", async function(req, res) {
    res.sendFile(__dirname + "/compassProducts.html");
});
app.get("/products/product", async function(req, res) {
    res.sendFile(__dirname + "/compassWatch.html");
});
app.get("/experts", async function(req, res) {
    res.sendFile(__dirname + "/compassExperts.html");
});
app.get("/history", async function(req, res) {
    res.sendFile(__dirname + "/compassHistory.html");
});
app.get("/purchase", function(req, res) {
    res.sendFile(__dirname = "/compass.html");
});