import random
from dotenv import load_dotenv
from itertools import product
import os

load_dotenv()


"""
=== GENERAL CONFIG ===
"""

ALGORITHM = os.getenv("ALGORITHM")

# mongodb settings
MONGODB_HOST = os.getenv("MONGODB_HOST")

# env config
TEST_NETWORK_EXTENDED_DIR = os.getenv("TEST_NETWORK_EXTENDED_DIR")

# Tx duration in Hyperledger caliper
TX_DURATION = 10

# "reward vs penalty?, rather we can assign score for every agent action (changing configuration)"
MOVE_PENALTY = 1
THROUGHPUT_REWARD_WEIGHT = 1.5
SUCCESS_REWARD_WEIGHT = 1
LATENCY_REWARD_WEIGHT = 1.2

# if action picked is not possible to execute, give pinalty
INVALID_ACTION_PINALTY = 99

# if objective achieved, multiply reward by this value.
OBJECTIVE_REWARD_MULTIPLIER=5

# training config
EXPECTED_THROUGHPUT = 10
MAXIMUM_STEPS_PER_EPISODE = 20

# notification config
CHAT_ID = os.getenv("CHAT_ID")
BOT_TOKEN = os.getenv("BOT_TOKEN")

# digital ocean spaces settings
SPACE_KEY = os.getenv("SPACE_KEY")
SPACE_SECRET = os.getenv("SPACE_SECRET")
SPACE_NAME = os.getenv("SPACE_NAME")
SPACE_REGION = os.getenv("SPACE_REGION")

# rebuild transaction limit
REBUILD_LIMIT = 50000

"""
=== QLearning CONFIG ===
"""

# important! changing the values will require rebuilding of q table!
# possible value combination for multi discrete action space (see PossibleAction)
possible_block_size = [10,50,100,150,200,250,300,350,400,450,500,600,700,800,900,1000,]
possible_block_interval = list(range(1, 16, 1))

# size of environment: maximum throughput
SIZE = 300

# "epsilon for randomness - or try simulated annealing? or other probabilistic technique"
EPSILON = 0.9
EPS_DECAY = 0.999

LEARNING_RATE = 0.1
DISCOUNT = 0.95


def set_expected_throughput(fixed_throughput):
    global EXPECTED_THROUGHPUT
    if fixed_throughput:
        EXPECTED_THROUGHPUT = fixed_throughput
    else:
        EXPECTED_THROUGHPUT = random.randrange(50, SIZE, 50) or 10
    return EXPECTED_THROUGHPUT


"""
=== DQN CONFIG ===
"""

# combined discrete action space for DQN
# due to the action-prediction nature of DQN (citation needed), it is hard to have conditional action space since it will change the prediction behavior. the easiest course of action is to list all the possible combination movement of the agent as single discrete action list.
discrete_action_space = list(product(possible_block_size, possible_block_interval))

DQN_SIZE = 500


def set_dqn_expected_throughput(fixed_throughput):
    global EXPECTED_THROUGHPUT
    if fixed_throughput:
        EXPECTED_THROUGHPUT = fixed_throughput
    else:
        EXPECTED_THROUGHPUT = random.randrange(50, DQN_SIZE, 50) or 10
    return EXPECTED_THROUGHPUT
