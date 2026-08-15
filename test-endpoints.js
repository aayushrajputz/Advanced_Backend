const BASE_URL = 'http://localhost:8000/api/v1';

async function runTests() {
    try {
        console.log('1. Registering new user...');
        const signupRes = await fetch(`${BASE_URL}/auth/signUp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Aayush Test',
                email: `aayush_${Date.now()}@test.com`,
                password: 'SecurePassword123'
            })
        });
        const signupData = await signupRes.json();
        console.log('Sign Up Response:', JSON.stringify(signupData, null, 2));

        if (!signupRes.ok) throw new Error('Sign up failed');

        const email = signupData.data.user.email;

        console.log('\n2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'SecurePassword123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', JSON.stringify(loginData, null, 2));

        if (!loginRes.ok) throw new Error('Login failed');

        const token = loginData.data.accessToken;

        console.log('\n3. Depositing ₹5,000...');
        const depositRes = await fetch(`${BASE_URL}/wallet/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: 5000 })
        });
        const depositData = await depositRes.json();
        console.log('Deposit Response:', JSON.stringify(depositData, null, 2));

        console.log('\n4. Withdrawing ₹1,500...');
        const withdrawRes = await fetch(`${BASE_URL}/wallet/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: 1500 })
        });
        const withdrawData = await withdrawRes.json();
        console.log('Withdraw Response:', JSON.stringify(withdrawData, null, 2));

    } catch (error) {
        console.error('Test script failed:', error);
    }
}

runTests();
