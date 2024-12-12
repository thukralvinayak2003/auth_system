const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { verifyToken } = require("../utils/auth");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", verifyToken, UserController.logout);
router.get("/profile", verifyToken, UserController.getProfile);

module.exports = router;
