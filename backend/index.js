import express, { json } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
// import models
import { userModel } from "./models/userModel.js";
import { foodModel } from "./models/foodModel.js";
import { trackingModel } from "./models/trackingModel.js";
import { verifyToken } from "./verifyToken.js";
import path from "path";
import { fileURLToPath } from 'url';
import moment from "moment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const secretKey = process.env.SECRET_KEY;
const DBurl = process.env.MONGODB_URL;
const port = process.env.PORT || 3000;
// initiating express for endpoints
const app = express();


// middleware to take care of parse and stringify and data chunking in the background with http
app.use(express.json());

app.use(cors());

// database connection
mongoose
.connect(DBurl)
.then((req, res) => {
  console.log("DB Connected Successfully");
})
.catch((err) => {
  console.log(err);
});


// const frontend = process.env.FRONTEND_URL;
// console.log("Frontend URL:", frontend);

// endpoint for registering new user
app.post(`/register`, (req, res) => {
  let user = req.body;
  
  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(user.password, salt, async (err, hashPass) => {
        if (!err) {
          user.password = hashPass;
          
          try {
            console.log("User data to be saved:", user);

            let doc = await userModel.create(user);
            res.status(201).send({ message: "User registered" });
          } catch (err) {
            console.log(err);
            res.status(500).send({ message: "some problem" });
          }
        }
      });
    }
  });
});

// endpoint for login
app.post(`/login`, async (req, res) => {
  let userCred = req.body;
  
  try {
    const user = await userModel.findOne({ email: userCred.email });
    if (user !== null) {
      bcrypt.compare(userCred.password, user.password, (err, success) => {
        if (success == true) {
          jwt.sign({ email: userCred.email }, secretKey, (err, token) => {
            if (!err) {
              res.send({
                message: "Login Successful",
                token: token,
                userid: user._id,
                name: user.name,
              });
            }
          });
          //   res.send({ message: "Login successful" });
        } else {
          res.status(401).send({ message: "Incorrect password" });
        }
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Login Problem" });
  }
});

// endpoint to fetch all foods
app.get(`/foods`, verifyToken, async (req, res) => {
  try {
    let foods = await foodModel.find();
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Occurred!" });
  }
});

// endpoint to add a food item
app.post(`/foods`, verifyToken, async (req, res) => {
  let food = req.body;
  
  try {
    let doc = await foodModel.create(food);
    res.status(201).send({ message: "Food Added to DB" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "some problem" });
  }
});

// endpoint search food by name
app.get(`/foods/:name`, verifyToken, async (req, res) => {
  try {
    // $regex makes a wider relative search returning all similar search results and 'i' makes the search case insensitive
    let foods = await foodModel.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    if (foods.length !== 0) {
      res.send(foods);
    } else {
      res.status(404).send({ message: "food not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Problem finding food" });
  }
});

// endpoint for tracking food + quantity
app.post(`/tracking`, verifyToken, async (req, res) => {
  let trackData = req.body;
  try {
    let data = await trackingModel.create(trackData);
    console.log("Tracking route data from server", data);
    res.status(201).send({ message: "food and quantity added" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Occurred" });
  }
});

// endpoint to fetch all foods eaten by a person

app.get(`/tracking/:userid/:date`, async (req, res) => {
  let userid = req.params.userid;
  let date = moment.utc(req.params.date, "YYYY-MM-DD").startOf('day'); // Convert to UTC and start of day
  console.log("Date sent to backend", date)
  try {
    let foods = await trackingModel
      .find({ userId: userid, eatenDate: date })
      .populate("userId")
      .populate("foodId");
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem in getting the food" });
  }
});
  
  app.use(express.static(path.join(__dirname, "dist")));
  // starting the server
  app.listen(port, () => {
    console.log(`Server up and running on port: ${port}`);
  });
  