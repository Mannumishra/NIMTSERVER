const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const ConnectDB = require("./DB/DatabseConnection")
const cors = require("cors")
const CourseCategoryRouter = require("./Routes/CourseCategory")
const CourseRouter = require("./Routes/Course")
const CourseDetailsRouter = require("./Routes/CourseDetails")

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.use("/api", CourseCategoryRouter)
app.use("/api", CourseRouter)
app.use("/api", CourseDetailsRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server Is Running At ${process.env.PORT}`)
})

ConnectDB()