const axios = require('axios');

async function testLiveBackend() {
  try {
    const payload = {
      name: "NGIT",
      collegeName: "Neil Gogte Institute of Technology",
      email: "ngiteventro2@gmail.com",
      password: "password123",
      role: "collegeAdmin"
    };

    console.log("Sending payload to: https://eventro-backend.onrender.com/api/users/register");
    const res = await axios.post("https://eventro-backend.onrender.com/api/users/register", payload);
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

testLiveBackend();
