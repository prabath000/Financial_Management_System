const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'adminpassword123'
        });
        console.log('Login successful!');
        console.log('Token:', response.data.token);

        const token = response.data.token;
        console.log('\nTesting protected route...');
        const summaryRes = await axios.get('http://localhost:5000/api/analytics/summary', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Protected route access successful!');
        console.log('Data:', summaryRes.data);
    } catch (err) {
        console.error('Test failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testLogin();
