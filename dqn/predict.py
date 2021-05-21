from rl_model.q_learning import QLearning
from rl_model.dqn import predict
from ml_model.automl_model import predict_automl
from ml_model.random_forest import predict_rf
from ml_model.knn import predict_knn
from ml_model.utils import update_env
from rl_model.fabric_custom_env import Fabric
import config

# replacement of telegram context
class TelegramContext:
    def __init__(self, throughput) -> None:
        self.args = [throughput]  # throughput


if config.ALGORITHM == "QLEARNING" or not config.ALGORITHM:
    modelname = f"qtable-{config.SIZE}.pickle"
    qlearning = QLearning(q_table_name=modelname)

    for i in range(100, 350, 50):
        context = TelegramContext(i)
        for j in range(5):
            context = TelegramContext(i)
            print(qlearning.predict({}, context))


if config.ALGORITHM == "DQN" or not config.ALGORITHM:
    print(f"=== DQN Agent Predictions ===")
    for i in range(100, 500, 50):
        print(predict(i, model_name="2020-11-09-deepq_fabric"))
    
    print(f"=== DQN2 Agent Predictions ===")
    for i in range(100, 500, 50):
        print(predict(i, model_name="2020-11-17-deepq_fabric-2"))
    
    print(f"=== DQN3 Agent Predictions ===")
    for i in range(100, 500, 50):
        print(predict(i, model_name="2020-11-18-deepq_fabric3"))
    
    print(f"=== DQN40ep Agent Predictions ===")
    for i in range(100, 500, 50):
        print(predict(i, model_name="2020-11-19-deepq_fabric40ep"))

if config.ALGORITHM == "MACHINE_LEARNING" or not config.ALGORITHM:
    env = Fabric()

    print(f"=== KNN Predictions ===")
    for i in range(100, 500, 50):
        update_env(env, i, predict_knn, "2020-12-03-knn-learning.joblib")
    
    print(f"=== Random Forest Predictions ===")
    for i in range(100, 500, 50):
        update_env(env, i, predict_rf, "2020-12-03-rf-learning.joblib")

    print(f"=== AutoML Predictions ===")
    for i in range(100, 500, 50):
        update_env(env, i, predict_automl, "2020-12-03-automl-model-learning.joblib")

