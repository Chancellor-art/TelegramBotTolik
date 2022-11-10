const TELEGRAM_API = require('node-telegram-bot-api');
const fs = require('fs');

//Your telegram nick name
const ADMIN = 'YOUR_NICKNAME_TELEGRAM';

//Your json file
const jsonFile = 'birthday.json';

//Replace the value below with the Telegram token you receive from @BotFather
const TOKEN = 'YOUR_TELEGRAM_TOKEN';

//Create a bot that uses 'polling' to fetch new updates
const bot = new TELEGRAM_API(TOKEN, {polling: true});

let listBirthday = { usersDate: [] };

//Listen new user and send message
bot.on('new_chat_members', msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'ТУТ ПРИВІТАННЯ');
});

//Listen left user and send message
bot.on('left_chat_member', msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Пака');
});

//Command start, send welcome message
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привіт я Толік(бот) і моя задача вітати нових людей в чаті та вітати з днем народження.');
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
bot.onText(/\/settings/, msg => {
    const chatId = msg.chat.id;
    if (msg.from.username === ADMIN) {
        bot.sendMessage(chatId, 'Ви авторизовані як супер користувач', buttonsOptions);  
    } else {
        bot.sendMessage(chatId, 'Ви не маєте доступу до налаштування');
        bot.sendMessage(chatId, 'Не сумуйте :)');
    }
});

//Add new user
const addNewUser = (name, time) => {
    fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data){
        if (err) {
            console.log(err);
        } else {
            listBirthday = JSON.parse(data);
            listBirthday.usersDate.push({name: `${name}`, date: `${time}`});
            fs.writeFileSync(jsonFile, JSON.stringify(listBirthday));
            console.log(`Add new user successfully! ${name} ${time}`);
        }
    });
}

//Delete user
const deleteUser = (userPosition) => {
    fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            listBirthday = JSON.parse(data);
            delete listBirthday.usersDate[userPosition];
            listBirthday.usersDate.splice(userPosition, 1);
            fs.writeFileSync(jsonFile, JSON.stringify(listBirthday));
        }
    });
}

//Button functionality
bot.on('callback_query', msg => {
    const date = msg.data;
    const chatId = msg.message.chat.id;

    //Pars JSOM file and send user name and date
    if (date === '0') {
        fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                listBirthday = JSON.parse(data);
                if (listBirthday.usersDate.length == 0) {
                    bot.sendMessage(chatId, 'База даних пуста, добавте користувачів для її перегляду');
                } else {
                    bot.sendMessage(chatId, 'Базі даних такі користувачі: ');
                    for (let i = 0; i < listBirthday.usersDate.length; i++) {
                        let name = listBirthday.usersDate[i].name;
                        let date = listBirthday.usersDate[i].date;
                        bot.sendMessage(chatId, `${name} ${date}`);
                    }
                }
                console.log('Database revised');
            }
        });
    }

    //Add new users in json
    else if (date === '1') {
        let name = null;
        let date = null;
        bot.sendMessage(chatId, 'Напишіть фамалія та імя для додавання користувача. Приклад: (Пупкін Вася)', {
            reply_markup: {
                force_reply: true
            }
        }).then(addApiId => {
            bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, async msg => {
                name = msg.text;

                bot.sendMessage(chatId, 'Напишіть дату народження. Приклад:(31.12.2022)', {
                    reply_markup: {
                        force_reply: true
                    }
                }).then(addApiId => {
                        bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id,async msg => {
                        date = msg.text;
                        addNewUser(name, date);
                        bot.sendMessage(chatId, 'Новий користувач успішно добавлений');
                    });
                });
            });
        });
    }

    //Left users with json
    else if (date === '2') {
        bot.sendMessage(chatId, 'Напишіть фамалія та імя для видалення користувача. Приклад: (Пупкін Вася)', {
            reply_markup: {
                force_reply: true
            }
        }).then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id,async msg => {
                let nameDelete = msg.text;

                fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data){
                    if (err){
                        console.log(err);
                    } else {
                        listBirthday = JSON.parse(data);

                        for (let i = 0; i < listBirthday.usersDate.length; i++) {
                            if (nameDelete == listBirthday.usersDate[i].name) {
                                deleteUser(i);
                                let name = listBirthday.usersDate[i].name;
                                let date = listBirthday.usersDate[i].date;
                                console.log(chatId, `Delete user ${name} ${date}`);
                                break;
                            }
                        }
                    }
                });
                bot.sendMessage(chatId, 'Користувач був видалений');
            });
        });
    } 
    else {
        bot.sendMessage(chatId, 'Кнопка не робоча');
    }
});