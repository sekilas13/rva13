const methodOverride = require("method-override");
const session = require("express-session");
const compression = require("compression");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const flash = require("express-flash");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const passport = require("passport");
const noCache = require("nocache");
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const { logger } = require("./config");
const MongoStore = require("connect-mongo")(session);

const app = express();
require("dotenv").config();

const { main, admin, vote, notFound } = require("./routes");
const Local = require("./passport/local");

const nm_dir = path.join(__dirname, "node_modules");
const pub_dir = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => logger.info("[MongoDB] connected"));

mongoose.connection.on("error", (err) => {
  logger.error(`[MongoDB] ${err}`);
  process.exit(22);
});

app.use(morgan("combined", { stream: logger.stream }));
app.use(compression());

if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

app.use(
  session({
    secret: process.env.SECRET,
    name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(pub_dir));

app.use(noCache());
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(pub_dir, "favicon.ico")));
app.use("/bs", express.static(path.join(nm_dir, "bootstrap")));
app.use("/jq", express.static(path.join(nm_dir, "jquery")));
app.use("/validator", express.static(path.join(nm_dir, "jquery-validation")));
app.use("/swal", express.static(path.join(nm_dir, "sweetalert2")));
app.use("/chart", express.static(path.join(nm_dir, "chart.js")));
app.use("/hammer", express.static(path.join(nm_dir, "hammerjs")));
app.use("/chartzoom", express.static(path.join(nm_dir, "chartjs-plugin-zoom")));

app.use(passport.initialize());
app.use(passport.session());

Local(passport);

app.use(methodOverride("_method"));

app.get("/", main);
app.use("/admin", admin);
app.use("/vote", vote);

app.use(notFound);

const server = http.createServer(app);

server.listen(PORT, () =>
  logger.info(
    ` [server.js] : Listening on port ${PORT} | http://localhost:${PORT}`
  )
);

const Sock = socketIO(server);

Sock.on("connection", (socc) => {
  logger.info("[Socket.IO] New Connection ", socc.id);

  socc.on("vote", (data) => {
    logger.info(`[Socket.IO] Upvote Candidate : ${data._id}`);
    socc.broadcast.emit("admin:upvote", data);
  });

  socc.on("new user", ({ time }) => {
    logger.info("[Socket.IO] New User");
    socc.broadcast.emit("admin:new user", { time });
  });
});
