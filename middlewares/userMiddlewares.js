const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const sendErrorMessage = require("../helpers/sendErrorMessage.js");
const AppError = require("../helpers/appError.js");

const filePath = path.join(__dirname, "..", "data", "users.json");
let userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// SIGNIN
const checkRequestBody = (req, res, next) => {
	let validationArray;

	switch (req.url) {
		case "/signup":
			validationArray = ["email", "password", "confirmPass"];
			break;

		case "/login":
			validationArray = ["email", "password"];
			break;

		default:
			return sendErrorMessage(
				new AppError(404, "unsuccesssful", "Url not match"),
				req,
				res
			);
	}

	let result = validationArray.every((key) => {
		return req.body[key] && req.body[key].trim().length;
	});

	if (!result) {
		return sendErrorMessage(
			new AppError(400, "unsuccesssful", "invalid request body"),
			req,
			res
		);
	}
	next();
};

const isEmailValid = (req, res, next) => {
	next();
};

const checkConfirmPassword = (req, res, next) => {
	const { password, confirmPass } = req.body;

	if (password !== confirmPass) {
		return sendErrorMessage(
			new AppError(400, "unsuccesssful", "password not match"),
			req,
			res
		);
	}
	next();
};

const isEmailUnique = (req, res, next) => {
	let findUserEmail = userData.find((user) => {
		return user.email === req.body.email;
	});

	if (findUserEmail) {
		return sendErrorMessage(
			new AppError(401, "unsuccesssful", "User already registered"),
			req,
			res
		);
	}

	next();
};

const hashPassword = async (req, res, next) => {
	try {
		// let salt = await bcrypt.genSalt(10);
		// req.body.password = await bcrypt.hash(req.body.password, salt);
		// OR
		req.body.password = await bcrypt.hash(req.body.password, 10);
		next();
	} catch (err) {
		return sendErrorMessage(
			new AppError(500, "unsuccesssful", "Internal error"),
			req,
			res
		);
	}
};

// LOGIN
// generate a jwt token
const isUserRegistered = (req, res, next) => {
	let findUser = userData.find((user) => {
		return user.email === req.body.email;
	});

	if (!findUser) {
		return sendErrorMessage(
			new AppError(404, "unsuccesssful", "User not registered"),
			req,
			res
		);
	}

	req.currentUser = { ...findUser };
	next();
};

// EXPORTS
module.exports.checkRequestBody = checkRequestBody;
module.exports.isEmailValid = isEmailValid;
module.exports.isEmailUnique = isEmailUnique;
module.exports.checkConfirmPassword = checkConfirmPassword;
module.exports.hashPassword = hashPassword;

module.exports.isUserRegistered = isUserRegistered;
