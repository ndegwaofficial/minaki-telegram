const paidUsers = new Set();

const markAsPaid = (chatId) => paidUsers.add(chatId);
const hasPaid = (chatId) => paidUsers.has(chatId);

module.exports = { markAsPaid, hasPaid };
