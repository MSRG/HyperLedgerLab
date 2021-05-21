from pandas.core.algorithms import mode
from utils.database import MongoConnector
from rl_model.dqn import run_dqn
import time
from config import BOT_TOKEN
from utils import spaces
from utils.notification import send
import config
import pandas as pd


# replacement of telegram context
class TelegramContext:
    def __init__(self, episodes, throughput) -> None:
        self.args = [episodes, throughput]  # episodes, throughput


def upload_file(filename):
    uploaded_name = f"{time.strftime('%Y-%m-%d')}-{filename}"
    spaces.upload_file(
        config.SPACE_NAME,
        config.SPACE_REGION,
        filename,
        uploaded_name,
    )


if config.ALGORITHM == "DQN" or not config.ALGORITHM:
    try:
        model_name = "dqn_fabric"
        run_dqn(40, None, model_name=model_name)  # episodes, throughput
        # upload_file(f"{model_name}.zip")
    except Exception as e:
        # send notification to telegram chat
        send(f"error occured while running DQN {e}")
