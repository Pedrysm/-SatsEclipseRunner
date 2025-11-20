const TelegramBot = require('node-telegram-bot-api');

// Token de tu bot
const bot = new TelegramBot('8570828562:AAGTjq1vZBRtQn0JERhGLk2s_8Eo3bgpYFk', { polling: true });

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "¡Bienvenido a Sats Eclipse Runner!", {
    reply_markup: {
      inline_keyboard: [[{
        text: "🎮 Jugar ahora",
        web_app: { url: "https://pedrysm.github.io/SatsEclipseBot/" }
      }]]
    }
  });
});
