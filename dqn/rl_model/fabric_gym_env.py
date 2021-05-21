from gym.spaces.discrete import Discrete
from rl_model.agent import Agent
from rl_model.fabric_custom_env import Fabric
from utils.logger import configure_logger, get_logger
import config
import time
from config import (
    INVALID_ACTION_PINALTY, MAXIMUM_STEPS_PER_EPISODE, OBJECTIVE_REWARD_MULTIPLIER,
    discrete_action_space,
    set_dqn_expected_throughput,
)
from copy import copy
from evaluation_function import objective_achieved, total_reward
import gym
from gym import spaces
import numpy as np


class FabricEnv(gym.Env):
    @property
    def agent_pos(self):
        return self.agent.position

    def __init__(self, send_result=False, fixed_throughput=None, agent_random_start=True) -> None:
        super(FabricEnv, self).__init__()

        self.logger = get_logger()
        
        self.env = Fabric()
        self.agent = Agent(random_start=agent_random_start)
        
        self.send_result = send_result
        self.fixed_throughput = fixed_throughput
        # we need to use the single discrete actions
        self.action_space = Discrete(len(discrete_action_space))
        self.observation_space = spaces.Box(low=0, high=np.inf, shape=(4,))

        
        # record and aggregrate results for informational purposes.
        self.send_result = send_result
        self.results = {
            "episode_rewards": [],
            "steps_per_episode": [],
            "expected_throughputs": [],
            "initial_states": [],
            "worst_states": [],
            "best_states": [],
            "best_configs": [],
        }

    # reset() called at the beginning of an episode, it returns an observation
    def reset(self):
        set_dqn_expected_throughput(self.fixed_throughput)
        self.env.set_tps(config.EXPECTED_THROUGHPUT)
        self.episode_step = 0

        self.env.rebuild_network(self.agent_pos[0], self.agent_pos[1])
        self.initial_state = self.env.current_state
        
        # count the episodes
        try:
            self.episode_count += 1
        except:
            self.episode_count = 0

        self.results["episode_rewards"].append(0)
        self.results["steps_per_episode"].append(0)
        self.results["expected_throughputs"].append(config.EXPECTED_THROUGHPUT)
        self.results["initial_states"].append(self.env.current_state)
        self.results["worst_states"].append(self.env.current_state)
        self.results["best_states"].append(self.env.current_state)
        self.results["best_configs"].append(
            {"block_size": self.agent_pos[0], "block_interval": self.agent_pos[1],}
        )

        initial_obs = self.env.current_state
        return np.array(initial_obs).astype(np.float32)

    # step(action) called to take an action with the environment, it returns the next observation, the immediate reward, whether the episode is over and additional information
    def step(self, action):
        self.episode_step += 1
        # TODO decide if we're going to use rebuild pinalty or not
        if self.env.needs_rebuild():
            self.logger.info(f"=== REBUILDING NETWORK BEFORE CONTINUING ===")
            self.logger.info(
                f"=== state before rebuilding: {self.env.current_state} ==="
            )
            # rebuild_pinalty = self.env.current_state
            self.env.rebuild_network(self.agent_pos[0], self.agent_pos[1])
            # rebuild_pinalty = total_reward(rebuild_pinalty, self.env.current_state) + 1
            self.logger.info(
                f"=== state after rebuilding: {self.env.current_state} ==="
            )

        self.logger.info(
            f"for position {self.agent.position}, picked action {action} -> {discrete_action_space[action]}"
        )

        self.agent.move(discrete_action_space[action])

        self.logger.info(f"previous state = {self.env.current_state}")

        prev_state = copy(self.env.current_state)

        # update environment configuration & state
        self.env.update_env_config(self.agent_pos[0], self.agent_pos[1])

        reward = total_reward(prev_state, self.env.current_state)

        self.logger.info(f"reward obtained = {reward}")

        # episode is done if max steps are exhausted or objective achieved
        done = objective_achieved(self.env.current_state, self.initial_state)
        if done:
            self.logger.info(f"=== Objective Achieved! ===")
            reward = reward*OBJECTIVE_REWARD_MULTIPLIER

        self.results["episode_rewards"][self.episode_count] += reward
        self.results["steps_per_episode"][self.episode_count] += 1
        # update best state for positive reward (0 is also considered positive due to move penalty)
        if (
            total_reward(
                self.results["best_states"][self.episode_count], self.env.current_state
            )
            >= 0
        ):
            self.results["best_states"][self.episode_count] = self.env.current_state
            self.results["best_configs"][self.episode_count] = {
                "block_size": self.agent_pos[0],
                "block_interval": self.agent_pos[1],
            }
        if (
            total_reward(
                self.results["worst_states"][self.episode_count], self.env.current_state
            )
            < 0
        ):
            self.results["worst_states"][self.episode_count] = self.env.current_state

        # no info passed for next step. should we pass results instead?
        info = {}
        return np.array(self.env.current_state).astype(np.float32), reward, done, info

    def close(self):
        pass
    
    def get_results(self):
        return self.results