const TELEGRAM_API = require('node-telegram-bot-api');
const fs = require('fs');

//Your telegram nick name
const ADMIN = 'YOUR_TELEGRAM_NICKNAME';

//Replace the value below with the Telegram token you receive from @BotFather
const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

//Create a bot that uses 'polling' to fetch new updates
const bot = new TELEGRAM_API(TOKEN, {polling: true});

//Listen new user and send message
bot.on('new_chat_members', async msg => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'ТУТ ПРИВІТАННЯ');
});

//Listen left user and send message
bot.on('left_chat_member', async msg => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Пака');
});

//Command start, send welcome message
bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Привіт я Толік(бот) і моя задача вітати нових людей в чаті та вітати з днем народження.');
});

//Buttons for settings
const buttonsOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Переглянути базу даних', callback_data: '0' }],
          [{ text: 'Добавити користувача', callback_data: '1' }],
          [{ text: 'Видалити користувача', callback_data: '2' }]
        ]
    })
};

//Command settings, send buttons for settings
bot.onText(/\/settings/, async msg => {
    const chatId = msg.chat.id;
    if (msg.from.username === ADMIN) {
        await bot.sendMessage(chatId, 'Ви авторизовані як супер користувач', buttonsOptions);  
    } else {
        await bot.sendMessage(chatId, 'Ви не маєте доступу до налаштування');
        await bot.sendMessage(chatId, 'Не сумуйте :)');
    }
});

//just shitty code
let i = 0;
//first JSON name...
let s = null;

//Buttons
bot.on('callback_query' , async msg => {
    //Yout JSON with birthday
    let listBirthday = fs.readFileSync('YOUR_JSON_FILE');

    const date = msg.data;
    const chatId = msg.message.chat.id;

    //Pars JSOM file and send user name and date
    if (date === '0') {
        JSON.parse(listBirthday, (key, value) => {
            if (typeof value === 'string') {
                if (i == 1) {
                    i = 0;
                    return bot.sendMessage(chatId, `${s} ${value}`);
                }
                if (i == 0) {
                    i = 1;
                    s = value;
                }
            }
            return value;
        });
    }
    //Add new users
    else if (date === '1') {

    }
    //Left users
    else if (date === '2') {
        
    } 
    else {
        await bot.sendMessage(chatId, 'Кнопка не робоча');
    }
});