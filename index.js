const TELEGRAM_API = require('node-telegram-bot-api');

//replace the value below with the Telegram token you receive from @BotFather
const TOKEN = '5639936758:YOUR_TELEGRAM_BOT_TOKEN';

//Create a bot that uses 'polling' to fetch new updates
const bot = new TELEGRAM_API(TOKEN, {polling: true});

//Listen new user and send message
bot.on('new_chat_members', async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'ТУТ ПРИВІТАННЯ');
});

//Listen left user and send message
bot.on('left_chat_member', async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Пака');
});

//Command start, send welcome message
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Привіт я Толік(бот) і моя задача вітати нових людей в чаті та вітати з днем народження.');
});

//Buttons for settings
const buttonsOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Переглянути базу даних', callback_data: '1' }],
          [{ text: 'Добавити користувача', callback_data: '2' }],
          [{ text: 'Видалити користувача', callback_data: '3' }]
        ]
    })
};

//Command settings, send buttons for settings
bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.from.username === 'Chancellor_v') {
        await bot.sendMessage(chatId, 'Ви авторизовані як супер користувач', buttonsOptions);
        
    } else {
        await bot.sendMessage(chatId, 'Ви не маєте доступу до налаштування');
        await bot.sendMessage(chatId, 'Не сумуйте :)');
    }
});