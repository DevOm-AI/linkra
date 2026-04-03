const redis = require('redis');
const { Client } = require('pg');
const UAParser = require('ua-parser-js');
const axios = require('axios');
require('dotenv').config();

// 1. Connect to Redis and Postgres
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379/0'
});

const pgClient = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    await redisClient.connect();
    await pgClient.connect();
    console.log("🚀 Node.js Consumer: Online & Listening to 'click_stream'...");

    let lastId = '$'; // '$' means listen for NEW messages only

    while (true) {
        try {
            // Read from the Redis Stream
            // We removed redis.commandOptions to avoid version conflicts
            const streams = await redisClient.xRead(
                { key: 'click_stream', id: lastId },
                { COUNT: 1, BLOCK: 5000 }
            );

            if (streams) {
                for (const stream of streams) {
                    for (const message of stream.messages) {
                        const data = message.message;
                        
                        const ua = new UAParser(data.user_agent);
                        const browser = ua.getBrowser().name || "Unknown";
                        const device = ua.getDevice().type || "Desktop";

                        let city = "Unknown", country = "Unknown";
                        try {
                            if (data.ip && data.ip !== '127.0.0.1' && data.ip !== '::1') {
                                const geo = await axios.get(`http://ip-api.com/json/${data.ip}`);
                                city = geo.data.city || "Unknown";
                                country = geo.data.country || "Unknown";
                            }
                        } catch (e) { console.log("Geo-IP lookup failed (expected on local dev)."); }

                        const query = `
                            INSERT INTO clicks (short_code, ip_address, country, city, device_type, browser, referrer)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                        `;
                        await pgClient.query(query, [
                            data.short_code, data.ip, country, city, device, browser, data.referrer
                        ]);

                        console.log(`✅ Analytics Logged: [${data.short_code}] from ${city} (${device})`);
                        
                        lastId = message.id;
                    }
                }
            }
        } catch (err) {
            console.error("❌ Stream Error:", err.message);
            // Wait a second before retrying to avoid spamming the log
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

run().catch(console.error);