from rl_model.q_learning import QLearning
from rl_model.dqn import predict
from ml_model.automl_model import predict_automl
from ml_model.random_forest import predict_rf
from ml_model.knn import predict_knn
from ml_model.utils import update_env
from rl_model.fabric_custom_env import Fabric
import config


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
