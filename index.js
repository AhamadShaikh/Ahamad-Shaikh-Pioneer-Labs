const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
require('dotenv').config()
const userRouter = require('./routes/userRoutes')
const dataRouter = require('./routes/dataRoutes')
const swaggerJSdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

app.use(express.json())

const connectToDataBase = () => {
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log('connected');
    } catch (error) {
        console.log(error);
    }
}

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pioneer Labs Backend",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:7000"
            }
        ]
    },
    apis: ["./routes/*.js"]
}
const swaggerSpec = swaggerJSdoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.use("/", userRouter)
app.use("/", dataRouter)

const PORT = process.env.PORT || 7000

app.listen(PORT, () => {
    connectToDataBase()
    console.log(`Port is running on ${PORT}`)
})