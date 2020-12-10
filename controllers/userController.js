const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const sendErrorMessage = require("../helpers/sendErrorMessage.js");
const AppError = require("../helpers/appError.js");
const { generateToken } = require("../helpers/jwtAuthentication");

const filePath = path.join(__dirname, "..", "data", "users.json");
let userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const signUpUser = (req, res, next) => {
	let { email, password } = req.body;

	let newUser = new User(email, password);
	userData.push(newUser);

	fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
		if (err) {
			res.send("internal error");
			return err;
		}
		res.send("new user created");
	});
};

const loginUser = async (req, res, next) => {
	// login
	try {
		let result = await bcrypt.compare(
			req.body.password,
			req.currentUser.password
		);

		if (!result) {
			return sendErrorMessage(
				new AppError(401, "unsuccesssful", "password is incorrect"),
				req,
				res
			);
		}
		// generate a jwt token
		let jwtToken = await generateToken(
			{ email: req.currentUser.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);
		// console.log("generated token", jwtToken);
		// attach it to a cokkie
		// res.cookie("authentication", Date.now());
		res.cookie("jwt", jwtToken);
		res.status(200).json({
			status: "Successful Login",
			data: [
				{
					jwt: jwtToken,
				},
			],
		});
		// res.send("user logged in successfully");
	} catch (err) {
		return sendErrorMessage(
			new AppError(500, "unsuccesssful", "internal error"),
			req,
			res
		);
	}
};

module.exports.signUpUser = signUpUser;
module.exports.loginUser = loginUser;
