"""
agent should choose from the available action, send it to environment to receive updated state and benchmarking result then calculate evaluation function result
"""
import random
from config import possible_block_interval, possible_block_size
from enum import Enum


class PossibleAction(Enum):
    INCREASE_BLOCK_SIZE = 0
    INCREASE_BLOCK_INTERVAL = 1
    DECREASE_BLOCK_SIZE = 2
    DECREASE_BLOCK_INTERVAL = 3
    INCREASE_BLOCK_SIZE_AND_INTERVAL = 4
    DECREASE_BLOCK_SIZE_AND_INTERVAL = 5
    INCREASE_BLOCK_SIZE_DECREASE_BLOCK_INTERVAL = 6
    DECREASE_BLOCK_SIZE_INCREASE_BLOCK_INTERVAL = 7


class Agent:
    def __init__(self, random_start=True):
        if random_start:
            self.block_size_choice = random.choice(possible_block_size)
            self.block_interval_choice = random.choice(possible_block_interval)
        else:
            self.block_size_choice = 10
            self.block_interval_choice = 2

    @property
    def position(self):
        return (self.block_size_choice, self.block_interval_choice)

    # get available actions based on state
    def available_actions(self):
        max_size = self.block_size_choice == possible_block_size[-1]
        min_size = self.block_size_choice == possible_block_size[0]
        min_interval = self.block_interval_choice == possible_block_interval[0]
        max_interval = self.block_interval_choice == possible_block_interval[-1]

        possible_actions = list(PossibleAction)
        
        if max_size:
            self._remove_action(possible_actions, PossibleAction.INCREASE_BLOCK_SIZE)
            self._remove_action(possible_actions, PossibleAction.INCREASE_BLOCK_SIZE_AND_INTERVAL)
            self._remove_action(possible_actions, 
                PossibleAction.INCREASE_BLOCK_SIZE_DECREASE_BLOCK_INTERVAL
            )

        if min_size:
            self._remove_action(possible_actions, PossibleAction.DECREASE_BLOCK_SIZE)
            self._remove_action(possible_actions, PossibleAction.DECREASE_BLOCK_SIZE_AND_INTERVAL)
            self._remove_action(possible_actions, 
                PossibleAction.DECREASE_BLOCK_SIZE_INCREASE_BLOCK_INTERVAL
            )

        if min_interval:
            self._remove_action(possible_actions, PossibleAction.DECREASE_BLOCK_INTERVAL)
            self._remove_action(possible_actions, PossibleAction.DECREASE_BLOCK_SIZE_AND_INTERVAL)
            self._remove_action(possible_actions, 
                PossibleAction.INCREASE_BLOCK_SIZE_DECREASE_BLOCK_INTERVAL
            )

        if max_interval:
            self._remove_action(possible_actions, PossibleAction.INCREASE_BLOCK_INTERVAL)
            self._remove_action(possible_actions, PossibleAction.INCREASE_BLOCK_SIZE_AND_INTERVAL)
            self._remove_action(possible_actions, 
                PossibleAction.DECREASE_BLOCK_SIZE_INCREASE_BLOCK_INTERVAL
            )

        return tuple(possible_actions)

    def _remove_action(self, arr, act):
        try:
            arr.remove(act)
        except ValueError:
            pass
    
    # directly move from one action to another
    def move(self, agent_pos):
        self.block_size_choice = agent_pos[0]
        self.block_interval_choice = agent_pos[1]

    # one step from one possible action to neighbour action
    def step(self, choice):
        size_idx = possible_block_size.index(self.block_size_choice)
        interval_idx = possible_block_interval.index(self.block_interval_choice)
        if choice == PossibleAction.INCREASE_BLOCK_SIZE:
            self.block_size_choice = possible_block_size[size_idx + 1]
        elif choice == PossibleAction.INCREASE_BLOCK_INTERVAL:
            self.block_interval_choice = possible_block_interval[interval_idx + 1]
        elif choice == PossibleAction.DECREASE_BLOCK_SIZE:
            self.block_size_choice = possible_block_size[size_idx - 1]
        elif choice == PossibleAction.DECREASE_BLOCK_INTERVAL:
            self.block_interval_choice = possible_block_interval[interval_idx - 1]
        elif choice == PossibleAction.INCREASE_BLOCK_SIZE_AND_INTERVAL:
            self.block_size_choice = possible_block_size[size_idx + 1]
            self.block_interval_choice = possible_block_interval[interval_idx + 1]
        elif choice == PossibleAction.INCREASE_BLOCK_SIZE_DECREASE_BLOCK_INTERVAL:
            self.block_size_choice = possible_block_size[size_idx + 1]
            self.block_interval_choice = possible_block_interval[interval_idx - 1]
        elif choice == PossibleAction.DECREASE_BLOCK_SIZE_AND_INTERVAL:
            self.block_size_choice = possible_block_size[size_idx - 1]
            self.block_interval_choice = possible_block_interval[interval_idx - 1]
        elif choice == PossibleAction.DECREASE_BLOCK_SIZE_INCREASE_BLOCK_INTERVAL:
            self.block_size_choice = possible_block_size[size_idx - 1]
            self.block_interval_choice = possible_block_interval[interval_idx + 1]
