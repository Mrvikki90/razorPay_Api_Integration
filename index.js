const express = require("express");
require("./db/config");
const User = require("./db/user");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const Jwt = require("jsonwebtoken");
const Jwtkey = "vikas";
const bodyParser = require("body-parser");
const mySql = require("mysql");
const { query } = require("express");
const RazorPay = require("razorpay");
var crypto = require("crypto");
const { Console } = require("console");

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// const connection = mySql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "mydb",
// });

// connection.connect((error) => {
//   error ? console.log(error) : console.log("connected");
// });

// connection.query("SELECT * FROM users", (result) => {
//   console.log("result", result);
// });

app.post("/orders", async (req, res) => {
  var instance = new RazorPay({
    key_id: "rzp_test_UJdxtvXlt7Q7lf",
    key_secret: "MTyuOnDmJgZ5eRGLVwOHANHz",
  });

  var options = {
    amount: req.body.amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      return res.send({ code: 500, message: "server error" });
    }
    console.log("data", order);
    return res.send({ code: 200, message: "order created", data: order });
  });
});

app.post("/verify-order", async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;
  var expectedSignature = crypto
    .createHmac("sha256", "MTyuOnDmJgZ5eRGLVwOHANHz")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
});

app.get("/payments", async (req, res) => {
  var instance = new RazorPay({
    key_id: "rzp_test_UJdxtvXlt7Q7lf",
    key_secret: "MTyuOnDmJgZ5eRGLVwOHANHz",
  });
  instance.payments
    .all()
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/getData", (req, res) => {
  const result = connection.query(
    "select * from users order by age",
    (error, result) => {
      console.log(result);
      res.send(result);
    }
  );
});

app.post("/postData", (req, res) => {
  console.log(req.body);
  const { id, name, age, subject } = req.body;
  const result = connection.query(
    `INSERT INTO users (id, name, age, subject)
    VALUES ('${id}','${name}','${age}','${subject}')`,
    (error, result) => {
      console.log(result);
      res.send(result.data);
    }
  );
});

app.put("/updateData/:id", (req, res) => {
  const id = req.params["id"];
  const { name, age, subject } = req.body;
  const result = connection.query(
    `update users set name = '${name}' , age = '${age}' , subject = '${subject}' where id = '${id}'`,
    (error, result) => {
      console.log(result);
      res.send(result);
    }
  );
});

app.delete("/deleteData/:id", (req, res) => {
  const id = req.params["id"];
  connection.query(`delete from users where id = '${id}'`, (error, result) => {
    console.log(result);
    res.send(result);
  });
});

// app.post("/login", async (req, res) => {
//   if (req.body.password && req.body.email) {
//     let user = await User.findOne(req.body);
//     if (user) {
//       Jwt.sign({ user }, Jwtkey, (error, token) => {
//         if (error) {
//           res.send({ result: "user not found" });
//         }
//         res.send({ user, auth: token });
//       });
//     } else {
//       res.send({ result: "Invalid credentials" });
//     }
//   } else {
//     res.send({ message: "Invalid credentials" });
//   }
// });

// app.post("/signup", async (req, res) => {
//   let users = new User(req.body);
//   let result = await users.save();
//   result = result.toObject();
//   if (result) {
//     res.send({ result: " data added scssecfully" });
//   } else {
//     res.send({ result: "no result found" });
//   }
// });

// app.get("/list-product", verifyToken, async (req, res) => {
//   let products = await User.find();
//   if (products.length > 0) {
//     res.send(products);
//   } else {
//     res.send({ result: "result not found" });
//   }
// });

// function verifyToken(req, res, next) {
//   let token = req.headers["authorizaton"];
//   if (token) {
//     token = token.split(" ")[1];
//     Jwt.verify(token, Jwtkey, (err, valid) => {
//       if (err) {
//         res.send("please provide valid token");
//       } else {
//         next();
//       }
//     });
//   } else {
//     res.send("please provide token with header");
//   }
// }

app.listen(8000);
