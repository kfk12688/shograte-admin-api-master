const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require("cors");

// Routes
const adminusers = require("./routes/api/adminusers");
const category = require("./routes/api/category");
const subcategory = require("./routes/api/subcategory");
const vendor = require("./routes/api/vendor");
const roles = require("./routes/api/roles");
const menus = require("./routes/api/menus");
const usermenus = require("./routes/api/usermenus");
const product = require("./routes/api/product");
const deals = require("./routes/api/deals");
const settings = require("./routes/api/settings");
const orders = require("./routes/api/orders");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const DB = require("./config/keys").mongoURI;

mongoose
  .connect(DB, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Mongodb connected successfully"))
  .catch(err => console.log("Mongodb not connected" + err));

// Routes for controllers
app.use("/api/adminusers", adminusers);
app.use("/api/category", category);
app.use("/api/subcategory", subcategory);
app.use("/api/vendor", vendor);
app.use("/api/roles", roles);
app.use("/api/menus", menus);
app.use("/api/usermenus", usermenus);
app.use("/api/products", product);
app.use("/api/deals", deals);
app.use("/api/settings", settings);
app.use("/api/orders", orders);

const port = process.env.PORT || 8081;

app.listen(port, () => console.log(`server running on port ${port}`));
