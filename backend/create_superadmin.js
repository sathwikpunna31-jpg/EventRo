require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB");

    const email = 'superadmin@eventro.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
        console.log(`SuperAdmin account already exists: ${email}`);
        mongoose.connection.close();
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const superadmin = new User({
        name: 'Eventro Super Admin',
        email: email,
        password: hashedPassword,
        role: 'superAdmin',
        isApproved: true,
        status: 'active'
    });

    await superadmin.save();
    console.log(`Success! SuperAdmin created:`);
    console.log(`Email: ${email}`);
    console.log(`Password: password123`);

    mongoose.connection.close();
}).catch(err => {
    console.error("Error creating SuperAdmin:", err);
});
