import { CronJob } from 'cron';
import axios from 'axios';

// Define the CronJob to run every day at 10 AM UTC
const job = new CronJob('0 10 * * *', async () => {
    // Logic to check deadlines
    const deadlines = await checkDeadlines();
    if (deadlines.length > 0) {
        // Send notifications if there are deadlines
        await sendTelegramNotifications(deadlines);
    }
}, null, true, 'UTC');

// Function to check deadlines (placeholder implementation)
async function checkDeadlines() {
    // Replace this with actual logic to check deadlines from your data source
    return ["Deadline 1", "Deadline 2"]; // Example deadlines
}

// Function to send notifications via Telegram
async function sendTelegramNotifications(deadlines) {
    const telegramChatId = 'YOUR_TELEGRAM_CHAT_ID';
    const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';

    for (const deadline of deadlines) {
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramChatId,
            text: `Reminder: ${deadline}`
        });
    }
}

// Start the job
job.start();
