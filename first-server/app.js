require("dotenv").config();
const express = require("express");

// import express from "express";

const app = express();
const port = 4000;
app.get("/", (req, res) => {
  res.send("Welcome to the First time start Your Server");
});

app.get("/user", (req, res) => {
  res.send("<h1>Hello There I am Mohit Jangid</h1>");
});

app.get("/instagram", (req, res) => {
  res.json({
    Author: "Mohit Jangid",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Your Server is starting at Port NO:", port);
});
