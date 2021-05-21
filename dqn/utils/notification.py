from config import BOT_TOKEN, CHAT_ID
import telegram


def send(msg, chat_id=CHAT_ID, token=BOT_TOKEN):
    bot = telegram.Bot(token)
    bot.sendMessage(chat_id=chat_id, text=msg)


def send_photo(photo, chat_id=CHAT_ID, token=BOT_TOKEN):
    bot = telegram.Bot(token)
    bot.send_photo(chat_id=chat_id, photo=photo)


# to get your chat id, first talk to @FabricOptimizerBot then go to https://api.telegram.org/bot<BOT_TOKEN>/getUpdates to find your chat
