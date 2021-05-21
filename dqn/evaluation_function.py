"""
from the paper
evaluation function is using reward function
"""

import config
from config import (
    LATENCY_REWARD_WEIGHT, MOVE_PENALTY,
    SUCCESS_REWARD_WEIGHT,
    THROUGHPUT_REWARD_WEIGHT,
)


def throughput_reward(curr_state, next_state):
    return (next_state[0] - curr_state[0]) * THROUGHPUT_REWARD_WEIGHT


def latency_reward(curr_state, next_state):
    return (curr_state[2] - next_state[2]) * LATENCY_REWARD_WEIGHT


def success_reward(curr_state, next_state):
    return (next_state[1] - curr_state[1]) * SUCCESS_REWARD_WEIGHT


def penalty(curr_state, next_state):
    return MOVE_PENALTY


# steering give extra rewards (or penalty) on things that we want to emphasis more
def steering(curr_state, next_state):
    return 0


def total_reward(curr_state, next_state):
    return sum(
        [
            throughput_reward(curr_state, next_state),
            success_reward(curr_state, next_state),
            steering(curr_state, next_state),
            -penalty(curr_state, next_state),
        ]
    )

def objective_achieved(next_state, initial_state):
    return next_state[0] >= config.EXPECTED_THROUGHPUT 
    # TODO enable for training
    # or next_state[0] >= initial_state[0]*160/100
