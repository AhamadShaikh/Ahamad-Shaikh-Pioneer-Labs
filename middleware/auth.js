const jwt = require("jsonwebtoken");
require('dotenv').config()

const middleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: 'Token not provided' });
        }
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.userId = decoded.userId;
        req.name = decoded.name;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = middleware;
