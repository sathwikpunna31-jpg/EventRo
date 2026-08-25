require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/userModel');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB");
    
    // Find all unapproved accounts
    const users = await User.find({ isApproved: false });
    
    for (let user of users) {
        user.isApproved = true;
        await user.save();
        console.log(`Success! Account ${user.email} has been approved.`);
    }
    
    if (users.length === 0) {
        console.log(`No pending unapproved accounts found.`);
    }
    
    mongoose.connection.close();
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
});
