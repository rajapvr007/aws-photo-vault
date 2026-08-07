const express = require("express");
const router = express.Router();

const {
  testS3,
} = require("../controllers/s3TestController");

router.get("/", testS3);

module.exports = router;