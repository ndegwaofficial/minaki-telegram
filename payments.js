const paidUsers = new Set();

const isPaid = (chatId) => paidUsers.has(chatId);
const createPaymentSession = (chatId) => {
  // This can be expanded to manage state; for now it’s a placeholder
  console.log(`Created payment session for chatId: ${chatId}`);
};

module.exports = { isPaid, createPaymentSession };
