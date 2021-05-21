from rl_model.dqn_callback import SaveOnBestTrainingRewardCallback
import time
from utils.visualization import simple_baseline_plot
from gym.wrappers.time_limit import TimeLimit

from stable_baselines.bench.monitor import Monitor
from utils.logger import configure_logger, get_logger
from evaluation_function import total_reward
from stable_baselines import DQN, results_plotter
from stable_baselines.deepq.policies import MlpPolicy
from stable_baselines.common.cmd_util import make_vec_env
from rl_model.fabric_gym_env import FabricEnv
from config import MAXIMUM_STEPS_PER_EPISODE, discrete_action_space
from utils.notification import send
import matplotlib.pyplot as plt
from utils import spaces
import config

# Suppresses warnings about future deprecation. These warnings mostly appear because we are using
# and older version of tensorflow.
# TODO wait for simple baseline v3
import warnings

warnings.simplefilter(action="ignore", category=FutureWarning)
import tensorflow as tf

tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)


def run_dqn(episodes, fixed_throughput, model_name="deepq_fabric"):
    steps = MAXIMUM_STEPS_PER_EPISODE * episodes
    logger = get_logger()
    configure_logger(logger, f"logs/[DQN] log-{time.strftime('%Y-%m-%d %H:%M:%S')}.log")

    monitor_file = "monitor.csv"
    env = FabricEnv(fixed_throughput=fixed_throughput)
    env = TimeLimit(env, max_episode_steps=MAXIMUM_STEPS_PER_EPISODE)
    env = Monitor(env, monitor_file)
    env = make_vec_env(lambda: env, n_envs=1)

    callback = SaveOnBestTrainingRewardCallback(check_freq=MAXIMUM_STEPS_PER_EPISODE * 5, log_dir=".", save_path=model_name)

    model = DQN(
        MlpPolicy, env, learning_starts=3, learning_rate=0.05, exploration_fraction=0.2, tensorboard_log='./dqn_tensorboard/'
    )
    try:
        model.load(model_name, env)
        logger.info("model loaded")
    except:
        pass

    model.learn(total_timesteps=steps, callback=callback)

    result = env.env_method("get_results")

    if env.get_attr("send_result")[0]:
        send(f"result from dqn: {result}")

    model.save(model_name)

    simple_baseline_plot(".")

    logger.info(f"=== FINISHED RUNNING DQN with {result} ===")


def predict(fixed_throughput, model_name="deepq_fabric"):
    env = FabricEnv(send_result=True, fixed_throughput=fixed_throughput, agent_random_start=False)
    env = make_vec_env(lambda: env, n_envs=1)

    model = DQN(
        MlpPolicy, env, learning_starts=3, learning_rate=0.05, exploration_fraction=0.1
    )
    model.load(model_name)

    # to make a prediction, first run initial benchmark with default config
    obs = env.env_method("reset")[0]
    initial_obs = obs
    print(f"=== prediction with starting obs {obs} ===")
    done = False
    selected_actions = [env.get_attr("agent")[0].position]
    while not done:
        actions, _ = model.predict(obs)
        obs, reward, _done, _ = env.env_method("step", actions)[0]
        print(f"predicted action {discrete_action_space[actions]} resulting in {obs} and {reward} reward")
        if reward < 0 or _done:
            done = True
        else:
            selected_actions.append(discrete_action_space[actions])
    print(f"==== prediction ends {selected_actions}====")
    print(f"recap: {model_name}; {fixed_throughput}; {initial_obs}; {selected_actions}; {obs}")
