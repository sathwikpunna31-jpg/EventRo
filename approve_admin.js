require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/userModel');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB");
    
    // Find the test account
    const email = "ngit-admin-test3@gmail.com";
    const user = await User.findOne({ email });
    
    if (user) {
        user.isApproved = true;
        await user.save();
        console.log(`Success! Account ${email} has been approved.`);
    } else {
        console.log(`Account ${email} not found.`);
    }
    
    mongoose.connection.close();
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
});
