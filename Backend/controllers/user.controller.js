const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const BlacklistToken = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { fullname, email, password } = req.body;
    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
        return res.status(400).json({ error: "User already exists" });
    }
    const hashPassword = await userModel.hashPassword(password);

    try {
        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashPassword
        });

        const token = await user.generateAuthToken();
        res.status(201).json({ token, user });

    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: "Server error" });
    }
};
module.exports.loginUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email }).select('+password');//password also needed
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password); // checking password
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = await user.generateAuthToken();
        res.status(200).json({ token, user });
    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ error: "Server error" });
    }
};
module.exports.getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id); //req.user.id is set in auth middleware
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user }); //sending user details
    } catch (err) {
        console.error("Error getting user profile:", err);
        res.status(500).json({ error: "Server error" });
    }
        }
module.exports.logoutUser = async (req, res) => {
    res.clearCookie('token');
    const token = req.cookies.token||req.headers.authorization.split(' ')[1];
    await BlacklistToken.create({ token });
    res.status(200).json({ message: "Logout successful" });
}
module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const token = await user.generatePasswordResetToken();
        await user.save();
        res.status(200).json({ message: "Password reset token sent to email" });
    } catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).json({ error: "Server error" });
    }
};