const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/userModel');
const College = require('./models/collegeModel');
const Department = require('./models/departmentModel');
const Club = require('./models/clubModel');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // Note: We won't wipe the DB to preserve user's existing NGIT stuff,
        // we will just create a brand new self-contained college environment.

        const collegeDomain = 'demo.edu';

        // Check if demo already exists
        const existingDemoContent = await College.findOne({ domain: collegeDomain });
        if (existingDemoContent) {
            console.log("Demo data already exists! Terminating to avoid duplicates.");
            process.exit(0);
        }

        // 1. Create College
        const college = await College.create({
            name: 'Demo University',
            domain: collegeDomain,
            verifiedStatus: 'verified', // use correct enum
            adminEmail: `admin@${collegeDomain}`
        });
        console.log(`Created College: ${college.name}`);

        // 2. Create College Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admin = await User.create({
            name: 'Demo Admin',
            email: `admin@${collegeDomain}`,
            password: hashedPassword,
            role: 'collegeAdmin',
            college: college._id,
            collegeName: college.name,
            isEmailVerified: true,
            isApproved: true
        });
        console.log(`Created College Admin: ${admin.email}`);

        // 3. Create Departments
        const dept1 = await Department.create({ name: 'Computer Science', sections: ['A', 'B', 'C'], college: college._id });
        const dept2 = await Department.create({ name: 'Business Administration', sections: ['A', 'B'], college: college._id });
        console.log('Created Departments');

        // 4. Create Years (Hardcoded strings instead of Models for now)
        const years = ['1st Year', '2nd Year', '3rd Year'];
        console.log('Using static Years');

        // 5. Create Students
        const studentIds = [];
        for (let i = 1; i <= 20; i++) {
            // Distribute across departments and years
            const dept = i % 2 === 0 ? dept1 : dept2;
            const yearStr = years[i % 3];
            const section = dept.sections[i % dept.sections.length];

            const student = await User.create({
                name: `Test Student ${i}`,
                email: `student${i}@${collegeDomain}`,
                password: hashedPassword,
                role: 'student',
                college: college._id,
                collegeName: college.name,
                isEmailVerified: true,
                department: dept._id,
                section: section,
                year: yearStr
            });
            studentIds.push(student._id);
        }
        console.log('Created 20 Students');

        // 6. Create Clubs and Coordinators
        // Let's take the first 2 students and promote them to coords
        await User.findByIdAndUpdate(studentIds[0], { role: 'clubCoordinator' });
        await User.findByIdAndUpdate(studentIds[1], { role: 'clubCoordinator' });

        const club1 = await Club.create({
            name: 'Hackerspace',
            description: 'The premier competitive programming club at Demo Uni.',
            email: `hackers@${collegeDomain}`,
            coordinators: [studentIds[0]],
            college: college._id
        });

        const club2 = await Club.create({
            name: 'Finance & Investing',
            description: 'Learning the ins and outs of the stock market.',
            email: `finance@${collegeDomain}`,
            coordinators: [studentIds[1]],
            college: college._id
        });
        console.log('Created Clubs & Assigned Coordinators');

        console.log('--------------------------------------------------');
        console.log('✅ SEEDING COMPLETE! You can log in with:');
        console.log(`College Admin:  admin@${collegeDomain}      | pass: password123`);
        console.log(`Coordinator 1:  student1@${collegeDomain}   | pass: password123 (Hackerspace)`);
        console.log(`Coordinator 2:  student2@${collegeDomain}   | pass: password123 (Finance)`);
        console.log(`Student (any):  student3@${collegeDomain} to student20 | pass: password123`);
        console.log('--------------------------------------------------');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error.message);
        if (error.errors) {
            console.error(JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
};

seedDatabase();
