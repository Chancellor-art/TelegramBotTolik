const TELEGRAM_API = require('node-telegram-bot-api');
const fs = require('fs');

//Replace the value below with the Telegram token you receive from @BotFather
const TOKEN = 'YOUR_TELEGRAM_TOKEN';

//Your telegram nick name
const ADMIN = 'YOUR_NICKNAME';

//Your json file with birthday
const birhtdayJsonFile = 'birthday.json';

//Time to send message in hours and minutes
const TIME = 8;
const MINUTES = 0;

//Create a bot that uses 'polling' to fetch new updates
const bot = new TELEGRAM_API(TOKEN, {polling: true});

let listBirthday = { usersDate: [] };

//Buttons for settings
const buttonsOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Переглянути базу даних', callback_data: '0' }],
          [{ text: 'Додати користувача', callback_data: '1' }],
          [{ text: 'Видалити користувача', callback_data: '2' }]
        ]
    })
};

//Add new user
const addNewUser = (name, time) => {
    fs.readFile(birhtdayJsonFile, 'utf8', function readFileCallback(err, data){
        if (err) {
            console.log(err);
        } else {
            listBirthday = JSON.parse(data);
            listBirthday.usersDate.push({name: `${name}`, date: `${time}`});
            fs.writeFileSync(birhtdayJsonFile, JSON.stringify(listBirthday));
            console.log(`Add new user successfully! ${name} ${time}`);
        }
    });
};

//Delete user
const deleteUser = (userPosition) => {
    fs.readFile(birhtdayJsonFile, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            listBirthday = JSON.parse(data);
            delete listBirthday.usersDate[userPosition];
            listBirthday.usersDate.splice(userPosition, 1);
            fs.writeFileSync(birhtdayJsonFile, JSON.stringify(listBirthday));
        }
    });
};

//Listen new user and send message
bot.on('new_chat_members', msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привіт! Вітаємо у нашому дружньому колективі');
});

//Listen left user and send message
bot.on('left_chat_member', msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Оуу, як сумно(');
});

//Command start, send welcome message
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привіт! я Толік-харізмат, бот, що нагадуватиме тобі про дні народження. А то ви - людішкі, постійно забуваєте)');
});

//Command settings, send buttons for settings
bot.onText(/\/settings/, msg => {
    const chatId = msg.chat.id;
    if (msg.from.username == ADMIN) {
        bot.sendMessage(chatId, 'Ви авторизовані як супер користувач', buttonsOptions);  
    } else {
        bot.sendMessage(chatId, 'Ви не маєте доступу до налаштувань, не сумуйте :)');
    }
});

//Button functionality
bot.on('callback_query', msg => {
    const date = msg.data;
    const chatId = msg.message.chat.id;

    //Pars JSOM file and send user name and date
    if (date === '0') {
        fs.readFile(birhtdayJsonFile, 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                listBirthday = JSON.parse(data);
                if (listBirthday.usersDate.length == 0) {
                    bot.sendMessage(chatId, 'База даних пуста, додайте користувача для її перегляду');
                } else {
                    bot.sendMessage(chatId, 'В базі даних такі користувачі: ');
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
        bot.sendMessage(chatId, 'Напишіть призвіще та імя для додавання користувача. Приклад: (Пупкін Вася)', {
            reply_markup: {
                force_reply: true
            }
        }).then(addApiId => {
            bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, async msg => {
                name = msg.text;

                bot.sendMessage(chatId, 'Напишіть дату народження без року. Приклад:(31.12)', {
                    reply_markup: {
                        force_reply: true
                    }
                }).then(addApiId => {
                        bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id,async msg => {
                        date = msg.text;
                        addNewUser(name, date);
                        bot.sendMessage(chatId, 'Новий користувач успішно доданий');
                    });
                });
            });
        });
    }

    //Left users with json
    else if (date === '2') {
        bot.sendMessage(chatId, 'Напишіть призвіще та імя для видалення користувача. Приклад: (Пупкін Вася)', {
            reply_markup: {
                force_reply: true
            }
        }).then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id,async msg => {
                let nameDelete = msg.text;

                fs.readFile(birhtdayJsonFile, 'utf8', function readFileCallback(err, data){
                    if (err){
                        console.log(err);
                    } else {
                        listBirthday = JSON.parse(data);

                        for (let i = 0; i < listBirthday.usersDate.length; i++) {
                            if (nameDelete == listBirthday.usersDate[i].name) {
                                deleteUser(i);
                                let name = listBirthday.usersDate[i].name;
                                let date = listBirthday.usersDate[i].date;
                                console.log(chatId, `Delete user. ${name} ${date}`);
                                break;
                            }
                        }
                    }
                });
                bot.sendMessage(chatId, 'Користувач був видалений');
            });
        });
    } else {
        bot.sendMessage(chatId, 'Кнопка не робоча');
    }
});

function happyBirthday() {
    let test = 'YOUR_ID_CHAT';
    let nowDate = new Date();
    let currentDate = `${nowDate.getDate()}.${nowDate.getMonth() + 1}`;

    fs.readFile(birhtdayJsonFile, 'utf8', function readFileCallback(error, data){
        if (error){
            console.log(error);
        } else {
            listBirthday = JSON.parse(data);
            for (let i = 0; i < listBirthday.usersDate.length; i++) {
                if (currentDate == listBirthday.usersDate[i].date) {
                    if (TIME == nowDate.getHours() & MINUTES == nowDate.getMinutes()) {
                        bot.sendMessage(test, `Сьогодні день народження ${listBirthday.usersDate[i].name} - привітай та купи смаколик!`);
                        console.log(listBirthday.usersDate[i].name);
                    }
                }
            }
        }
    });
};
  
setInterval(happyBirthday, 30000);