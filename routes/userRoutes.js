const express = require('express')
const User = require('../models/userModel')
const router = express.Router()
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const BlacklistToken = require('../models/blacklistModel')

router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User has already been registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ ...req.body, password: hashedPassword });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully", newUser: newUser });

    } catch (error) {
        return res.status(500).json({ message: 'Registration Failed' });
    }
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: User registration
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newUser:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     _id:
 *                       type: string
 *       '400':
 *         description: User has already been registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */



router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let tokenKey = process.env.TOKEN_KEY;
        let rTokenKey = process.env.REFRESHTOKEN_KEY;

        const token = jwt.sign({ userId: existingUser._id, name: existingUser.name }, tokenKey, { expiresIn: "10d" });

        const refreshToken = jwt.sign({ userId: existingUser._id, name: existingUser.name }, rTokenKey, { expiresIn: "20d" });

        res.status(200).json({ message: "Login successful", token, refreshToken });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: 
 *       - Login
 *     requestBody:
 *       required: true
 *       description: User able to login
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       '404':
 *         description: User not found. Please register first.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */


router.get("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token not provided" });
        }

        const blacklistedToken = await BlacklistToken.exists({ token });

        if (blacklistedToken) {
            return res.status(400).json({ message: "Token has already been invalidated" });
        }

        await BlacklistToken.create({ token });

        res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        console.error("Logout failed:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});


/**
 * @swagger
 * /logout:
 *   get:
 *     summary: "User Logout"
 *     tags: [Logout]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Access token
 *         required: true
 *         schema:
 *           type: string
 *           format: "Bearer token"
 *     responses:
 *       '200':
 *         description: "Logout successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '401':
 *         description: "Token not provided"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: "Token has already been invalidated"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: "Logout failed"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */



module.exports = router
