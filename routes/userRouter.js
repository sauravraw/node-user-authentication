const express = require("express");
const {
	checkRequestBody,
	isEmailValid,
	checkConfirmPassword,
	isEmailUnique,
	hashPassword,
	isUserRegistered,
} = require("../middlewares/userMiddlewares.js");

const { signUpUser, loginUser } = require("../controllers/userController.js");

const router = express.Router();

router
	.route("/signup")
	.post(
		checkRequestBody,
		isEmailValid,
		isEmailUnique,
		checkConfirmPassword,
		hashPassword,
		signUpUser
	);

router.route("/login").post(checkRequestBody, isUserRegistered, loginUser);

router.route("/logout").get();

module.exports = router;
