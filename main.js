//############### init #############//

const express = require("express");
const app = express();
const port = process.env.ponrt || 8090;
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

//############### imports #############//
const blogRouter = require("./Routers/blogRouters");

// init
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));

//
app.use("/", blogRouter);

// my server
app.listen(port, () => console.log(`Server Running ${port}`));
