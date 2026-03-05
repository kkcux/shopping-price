import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Basic validation
if (!firebaseConfig.apiKey) {
    console.error("Error: Firebase configuration not found. Please make sure you have a .env file with VITE_FIREBASE_* variables.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CONCURRENT_USERS = parseInt(process.argv[2]) || 50;

console.log(`Starting load test with ${CONCURRENT_USERS} concurrent users...`);

async function simulateUser(id) {
    const start = Date.now();
    try {
        // Use limit(1) to avoid fetching too much data and running up costs
        const q = query(collection(db, "test_connection"), limit(1));
        await getDocs(q);
        const duration = Date.now() - start;
        return { id, success: true, duration };
    } catch (error) {
        const duration = Date.now() - start;
        return { id, success: false, duration, error: error.message };
    }
}

async function runLoadTest() {
    const startTotal = Date.now();
    const promises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(simulateUser(i + 1));
    }

    const results = await Promise.all(promises);
    const endTotal = Date.now();

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const durations = results.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    console.log(`\nLoad Test Completed in ${(endTotal - startTotal) / 1000}s`);
    console.log(`Total Users: ${CONCURRENT_USERS}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
    console.log(`Min Response Time: ${minDuration}ms`);
    console.log(`Max Response Time: ${maxDuration}ms`);

    if (failCount > 0) {
        console.log("\nSome requests failed. Check if your Firebase quota is exceeded or if the network is unstable.");
        console.log("Sample error:", results.find(r => !r.success).error);
        process.exit(1);
    }

    process.exit(0);
}

runLoadTest();
