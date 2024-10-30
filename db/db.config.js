const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `Your url`
        );
        console.log(
            `Connection successful\nDB HOST: ${connectionInstance.connection.host}`
        );
    } catch (err) {
        console.error(`ERROR: ${err}`);
        process.exit(1); // Exit process with failure
    }
};

// Export the connectDB function for use in other modules
module.exports = connectDB;
