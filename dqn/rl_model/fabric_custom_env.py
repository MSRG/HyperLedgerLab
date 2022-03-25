"""
environment is an abstraction to connect with existing Hyperledger Fabric instance
contains state and run the benchmarking function for every agent's action

observation space?
"""

from subprocess import TimeoutExpired
from utils.caliper_report_parser import parse_caliper_log
from utils.database import MongoConnector
from utils.logger import get_logger
from config import (
    REBUILD_LIMIT,
    TX_DURATION,
    possible_block_size,
)
import math
import numpy as np
from matplotlib import style
import subprocess

style.use("ggplot")


class Fabric:
    """
    state is defined as union between current tps and success/failure difference
    """

    def __init__(self):
        self.logger = get_logger()
        self.current_state = ()
        self.q_table = {}
        self.db = MongoConnector()
        self.target_tps = 0
        self.tx_submitted = 0

    def set_tps(self, tps):
        self.target_tps = tps
        assets = math.ceil(tps * 2)
        self.logger.info(f"=== UPDATE CALIPER CONFIG WITH VALUE {tps} {assets} ===")
        update_process = subprocess.Popen(
            ["sudo", "./scripts/k8s-update-caliper-config.sh", str(tps), str(assets)],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        _, err = update_process.communicate()
        self.logger.debug(f"error while updating tps {err}")

    def rebuild_network(self, block_size):
        self.logger.info(f"=== REBUILDING NETWORK ===")
        if block_size is 10:
            command = f"./scripts/k8s-rebuild-network.sh && ./scripts/k8s-execute-caliper.sh "
        else:
            command = f"./scripts/k8s-rebuild-network.sh && ./scripts/k8s-updateconfig.sh {block_size} && ./scripts/k8s-execute-caliper.sh "

        rebuild_process = subprocess.Popen(
            [command],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        _, err = rebuild_process.communicate()
        self.logger.debug(f"error while rebuilding network {err}")

        self.update_current_state(block_size)
        self.tx_submitted = 0

    def update_env_config(self, block_size, fixed_config=True):
        command = f"./scripts/k8s-updateconfig.sh {block_size} && ./scripts/k8s-execute-caliper.sh "
        update_process = subprocess.Popen(
            [command],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        
        try:
            # combine update and benchmark
            _, err = update_process.communicate()
            self.update_current_state(block_size, fixed_config)
            self.logger.debug(f"error during process {err}")
        except TimeoutExpired:
            update_process.kill()
            # benchmark_process.kill()
            self.logger.info(f"benchmark timeout occured")
            self.current_state = (0, 0, 0)  # signal an error

        return self.current_state

    def update_current_state(self, block_size, fixed_config=True):
        raw_states = parse_caliper_log(['Random'])
        print(f"===== THE STATE IS {raw_states} =====")
        
        try:
            # transaction per second (succ/(last commit time - first submit time))
            throughputs = np.array(
                [state["throughput"] for state in raw_states]
            )
            # successes per second
            successes = np.array(
                [state["success"] / TX_DURATION for state in raw_states]
            )
            # average latency per transaction
            latencies = np.array(
                [state["avg_latency"] for state in raw_states]
            )
            np.nan_to_num(throughputs, copy=False)
            np.nan_to_num(successes, copy=False)
            np.nan_to_num(latencies, copy=False)

            if fixed_config:
                size_idx = possible_block_size.index(block_size)
            else:
                size_idx = block_size

            self.current_state = (
                math.ceil(np.average(throughputs)),
                math.ceil(np.average(successes)),
                size_idx,
            )
            # stupid approximation of tx limit.
            self.tx_submitted += math.ceil(np.sum(successes) * TX_DURATION)
            # save to mongodb database
            self.save_state_to_db(block_size, raw_states)
        except Exception as e:
            self.logger.info(f"report parsing error {e}")
            self.current_state = (0, 0, 0)  # signal an error

        self.logger.info(
            f"update state finished for size {block_size} with results {self.current_state}"
        )

    def needs_rebuild(self):
        return (
            self.tx_submitted >= REBUILD_LIMIT or self.current_state[0] == 0
        )  # if throughput is 0, something is wrong

    def save_state_to_db(self, size, raw):
        config = {
            "target_tps": self.target_tps,
            "batch_size": size,
        }
        self.db.insertData(config, raw)
