const { verifyToken } = require("../helpers/jwtAuthentication");
const fs = require("fs");
const path = require("path");
const sendErrorMessage = require("../helpers/sendErrorMessage");
const AppError = require("../helpers/appError");
const fileName = path.join(__dirname, "..", "data", "users.json");
const users = JSON.parse(fs.readFileSync(fileName, "utf-8"));

const protectRoute = async (req, res, next) => {
	// console.log("header", req.headers.authorization);
	if (!req.headers.authorization) {
		return sendErrorMessage(
			new AppError(401, "Unsucessful", "Please login or signup"),
			req,
			res
		);
	}
	let jwtToken = req.headers.authorization.split(" ")[1];
	let decoded;
	// check for user
	try {
		decoded = await verifyToken(jwtToken, process.env.JWT_SECRET);
	} catch (err) {
		return sendErrorMessage(
			new AppError(401, "Unsuccessful", "Invalid Token"),
			req,
			res
		);
	}
	let { email: currentUser } = users.find((user) => {
		return user.email == decoded.email;
	});
	if (!currentUser) {
		return sendErrorMessage(
			new AppError(401, "Unsuccesssul", "User not registered"),
			req,
			res
		);
	}
	req.currentUser = currentUser;
	// give access
	next();
};

module.exports.protectRoute = protectRoute;
