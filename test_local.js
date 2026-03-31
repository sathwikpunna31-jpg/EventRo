const axios = require('axios');

async function testLocalBackend() {
  try {
    const payload = {
      name: "NGIT",
      collegeName: "Neil Gogte Institute of Technology",
      email: "ngit-admin-test3@gmail.com", // Fresh email
      password: "password123",
      role: "collegeAdmin"
    };

    console.log("Sending payload to: http://localhost:5000/api/users/register");
    const res = await axios.post("http://localhost:5000/api/users/register", payload);
    console.log("Success! Response data:", res.data);
  } catch (error) {
    console.error("FAILED!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }
  }
}

testLocalBackend();
