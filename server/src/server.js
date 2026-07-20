require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

require('./cron');

const PORT = process.env.PORT || 4001;

const startServer = async () => {
    try{
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

startServer();