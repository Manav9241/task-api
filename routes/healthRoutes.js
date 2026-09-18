const express = require("express");
const { live, ready } = require("../controllers/healthController");

const router = express.Router();

router.get("/healthz", live);
router.get("/readyz", ready);

module.exports = router;