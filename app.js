const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const { initiateSTKPush } = require("./mpesa");
const { isPaid, createPaymentSession } = require("./payments");

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text.toLowerCase();

  // Handle booking command
  if (userText.includes("book")) {
    // create payment session
    createPaymentSession(chatId);

    // Ask for phone number
    await sendTelegramMessage(chatId, "Please send your M-Pesa phone number to continue with payment (format: 2547XXXXXXXX)");
    return res.sendStatus(200);
  }

  // Check if user sent phone number
  if (/^2547\d{8}$/.test(userText)) {
    const phone = userText;
    const amount = 100; // Example fixed price

    await sendTelegramMessage(chatId, `Initiating M-Pesa payment of KES ${amount}...`);
    const result = await initiateSTKPush(phone, amount, chatId);

    if (result.success) {
      await sendTelegramMessage(chatId, "✔️ Payment prompt sent to your phone. Please complete it.");
    } else {
      await sendTelegramMessage(chatId, "❌ Failed to initiate payment. Try again.");
    }
    return res.sendStatus(200);
  }

  // If payment is already done
  if (await isPaid(chatId)) {
    await sendTelegramMessage(chatId, "✅ Payment confirmed. Proceeding to book your appointment...");
    // Add appointment booking logic here
    return res.sendStatus(200);
  }

  // Default
  await sendTelegramMessage(chatId, "💬 Type 'book' to book an appointment.");
  res.sendStatus(200);
});

const sendTelegramMessage = async (chatId, text) => {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
  });
};

app.listen(3000, () => console.log("Bot running on port 3000"));
