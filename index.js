const express = require("express");
// Using Node.js `require()`
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");
const foodModel = require("./models/food.model");
const trackingModel = require("./models/tracking.model");

//middleware
app.use(express.json()); // allows you to pass json from client to server
app.use(express.urlencoded({ extended: false }));
app.get("/", function (req, res) {
  res.send("Hello World  feree");
  1;
});

app.post("/api/register", (req, res) => {
  let user = req.body;
  console.log(user);

  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(user.password, salt, async (err, hpass) => {
        if (!err) {
          user.password = hpass;
          try {
            const userFromDataBase = await userModel.create(req.body);
            console.log(userFromDataBase);
            res.status(201).json({
              success: true,
              message: "Registration Successful",
              data: userFromDataBase
            });
          } catch (error) {
            res.status(500).json({ mesage: error.meaasge });
          }
        }
      });
    }
  });
});
app.post("/api/login", async (req, res) => {
  let userCred = req.body;

  try {
    const user = await userModel.findOne({ email: userCred.email });
    console.log(user);
    if (user !== null) {
      bcrypt.compare(userCred.password, user.password, (err, success) => {
        if (success == true) {
          // create a token
          jwt.sign({ email: userCred.email }, "nutrify", (err, token) => {
            if (!err) {
              res.status(200).json({
                message: "Login Successful",
                token: token
              });
            }
          });
        } else {
          res.status(403).json({ message: "Incorrect password" });
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/foods", verifyToken, async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.status(200).json({ mesage: "success", data: foods });
  } catch (error) {
    res.status(500).json({ mesage: error.meaasge });
  }
});
app.get("/api/foods/:name", verifyToken, async (req, res) => {
  try {
    const food = await foodModel.find({
      name: { $regex: req.params.name, $options: "i" }
    });

    // $regrex: req.params.name, to return all result containing the word or sentence passed

    // $options:"i"  to make it case insensituve

    if (food.length == 0) {
      return res.status(404).json({ message: "food item not found" });
    } else {
      res.status(200).json({ mesage: "success", data: food });
    }
  } catch (error) {
    res.status(500).json({ mesage: error.meaasge });
  }
});

app.post("/api/foods", verifyToken, async (req, res) => {
  console.log(req.body);
  try {
    // Create a new product based on the request body
    const foods = await foodModel.create(req.body);
    res.status(201).json({ message: "success", data: foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/tracking", verifyToken, async (req, res) => {
  try {
    const trackingData = await trackingModel.create(req.body);
    res.status(201).json({ message: "food Added" });
  } catch (error) {
    res.status(500).json({ mesage: error.meaasge });
  }
});

// endpoint to get all foods eaten by a single person
app.get("/api/tracking/:userId/:date", async (req, res) => {
  try {
    const userid = req.params.userId;
    const date = new Date(req.params.date);

    // Format the date to match the eatenDate format
    const strDate = date.toLocaleDateString();
    console.log(strDate);
    const foods = await trackingModel
      .find({ userId: userid, eatenDate: strDate })
      .populate("userId")
      .populate("foodId");
    res.status(200).json({ mesage: "success", data: foods });
  } catch (error) {
    res.status(500).json({ message: error.meaasge });
    console.log(error.meaasge);
  }
});

// middleware
function verifyToken(req, res, next) {
  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "nutrify", (err, data) => {
      if (!err) {
        next();
      } else {
        res.status(403).json({ message: "Invalid token" });
      }
    });
  } else {
    res.status(404).json({ message: "Please send a token" });
  }
}

mongoose
  .connect(
    "mongodb+srv://21izahmichael:KnbOFtvegR5ptQQj@cluster0.8raknai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("database Connected!");
  })
  .catch((e) => {
    console.log(`connected failed ${e}`);
  });
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
