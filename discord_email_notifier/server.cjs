const WebSocket = require('ws');
const nodemailer = require('nodemailer');

// ==========================================
// 1. CONFIGURATION
// ==========================================
const DISCORD_BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN'; 
const TARGET_CHANNEL_ID = 'YOUR_LOCAL_SERVER_CHANNEL_ID'; // Target channel snowflake ID
const GMAIL_USER = 'your-email@gmail.com';
const GMAIL_PASS = 'your-gmail-app-password'; 
const ADMIN_TARGET_EMAIL = 'admin-email@gmail.com';

// Official Live Discord API Gateway WebSocket (v10)
const DISCORD_GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';

// ==========================================
// 2. NODEMAILER EMAIL TRANSPORT
// ==========================================
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS }
});

async function forwardMessageToAdminEmail(author, content) {
    const mailOptions = {
        from: GMAIL_USER,
        to: ADMIN_TARGET_EMAIL,
        subject: `🚨 [Pipeline Alert] Message From: ${author}`,
        text: `A public client updated the monitored Discord node:\n\nUser: ${author}\nPayload:\n"${content}"\n\n[Transmission Complete - No Return Channel Configured]`
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`📧 Diverted data from "${author}" directly to Admin Inbox.`);
    } catch (error) {
        console.error('❌ Failed to route email notification:', error);
    }
}

// ==========================================
// 3. UNIDIRECTIONAL DISCORD V10 GATEWAY
// ==========================================
function connectToDiscordGateway() {
    console.log('📡 Binding script to Discord Gateway v10 WebSocket stream...');
    const ws = new WebSocket(DISCORD_GATEWAY_URL);
    let heartbeatInterval = null;

    ws.on('open', () => {
        console.log('🔗 WebSocket stream established safely.');
    });

    ws.on('message', async (data) => {
        const payload = JSON.parse(data);
        const { op, t, d } = payload;

        switch (op) {
            // Opcode 10: Hello payload triggers heartbeat rules
            case 10:
                const { heartbeat_interval } = d;
                
                heartbeatInterval = setInterval(() => {
                    ws.send(JSON.stringify({ op: 1, d: null }));
                }, heartbeat_interval);

                // Identify payload targeting Intents: Guilds (1) + Guild Messages (512) + Message Content (32768) = 33281
                ws.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: DISCORD_BOT_TOKEN,
                        capabilities: 16383,
                        properties: { os: 'windows', browser: 'node.js', device: 'pc' },
                        presence: { status: 'online', afk: false },
                        intents: 33281 
                    }
                }));
                break;

            // Opcode 0: Process Incoming WebSocket Dispatches
            case 0:
                if (t === 'READY') {
                    console.log(`🤖 Bot Listening. Monitoring Channel ID [${TARGET_CHANNEL_ID}]...`);
                }

                if (t === 'MESSAGE_CREATE') {
                    // Lockout: Ignore bot accounts and ignore text from other channels
                    if (d.author.bot || d.channel_id !== TARGET_CHANNEL_ID) return;

                    console.log(`📥 Intercepted public string from "${d.author.username}": "${d.content}"`);

                    // Forward content out of the network immediately. 
                    // No HTTPS message create requests are ever fired back to Discord.
                    await forwardMessageToAdminEmail(d.author.username, d.content);
                }
                break;

            default:
                break;
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`❌ Stream disconnected (${code}). Re-establishing link...`);
        clearInterval(heartbeatInterval);
        setTimeout(connectToDiscordGateway, 5000);
    });

    ws.on('error', (err) => console.error('Gateway Socket Error:', err));
}

// Initialize the continuous unidirectional consumer loop
connectToDiscordGateway();
