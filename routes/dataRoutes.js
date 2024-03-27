const express = require('express')
const middleware = require('../middleware/auth')
const router = express.Router()
const axios = require("axios")

router.get('/data', async (req, res) => {
    try {
        const { category, page, limit } = req.query;
        let url = 'https://api.publicapis.org/entries';

        if (category) {
            url += `?category=${category}`;
        }

        if (page && limit) {
            const response = await axios.get(url);
            const data = response.data.entries;

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);

            const newData = data.slice(startIndex, endIndex);

            res.send({ newData });
        } else {
            const response = await axios.get(url);
            const data = response.data;

            res.send({ data });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('Internal Server Error');
    }
});

/**
 * @swagger
 * /data:
 *   get:
 *     summary: Retrieve the data from database
 *     tags: 
 *       - Data Retriving
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Filter the data based on category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Filter the data based on page and limit
 *         schema: 
 *           type: number
 *       - in: query
 *         name: limit
 *         description: Filter the data based on page and limit
 *         schema: 
 *           type: number
 *     responses:
 *       '200':
 *         description: Data successfully retrieved from database 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: 
 *                     type: object
 *       '500':
 *         description: Internal server error
 */




router.get('/auth', middleware, async (req, res) => {
    try {

        res.status(200).json({ message: 'Authenticated user access only. This is a protected endpoint.' });

    } catch (error) {
        res.status(500).json('Internal Server Error')
    }
})

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Check if user is authenticated.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Access token
 *         required: true
 *         schema:
 *           type: string
 *           format: "Bearer {token}"
 *     responses:
 *       200:
 *         description: User is authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating that the user is authenticated.
 *       500:
 *         description: Internal Server Error.
 */


module.exports = router
