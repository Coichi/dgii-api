const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));


const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
    res.send("Hello World");
})

app.listen(port, function() {
    console.log("app running successfully on port " + port);
});