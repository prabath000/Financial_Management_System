const http = require('http');

const postData = JSON.stringify({
    username: 'admin',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Creating admin user via API...');

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 201) {
            console.log('✅ Admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: password123');
            console.log('\n🔐 Please change this password after first login!');
            console.log('\n📱 You can now log in to the desktop app.');
        } else if (res.statusCode === 400 && data.includes('UNIQUE constraint failed')) {
            console.log('✅ Admin user already exists');
            console.log('   Username: admin');
            console.log('   (Use existing password)');
        } else {
            console.log(`Response: ${data}`);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    console.error('Make sure the desktop app is running (npm run desktop:dev)');
});

req.write(postData);
req.end();
