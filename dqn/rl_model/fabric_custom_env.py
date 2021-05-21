"""
environment is an abstraction to connect with existing Hyperledger Fabric instance
contains state and run the benchmarking function for every agent's action

observation space?
"""

from subprocess import TimeoutExpired
from utils.caliper_report_parser import parse_caliper_report
from utils.database import MongoConnector
from utils.logger import get_logger
from config import (
    REBUILD_LIMIT,
    TEST_NETWORK_EXTENDED_DIR,
    TX_DURATION,
    possible_block_interval,
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
        update_process = subprocess.Popen(
            ["./scripts/update-caliper-config.sh", str(tps), str(assets)],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        _, err = update_process.communicate()
        self.logger.debug(f"error while updating tps {err}")

    def rebuild_network(self, block_size, block_interval):
        
        if block_size is 10 and block_interval is 2:
            command = f"./scripts/rebuild-network.sh && ./scripts/execute-caliper.sh && rm -f fabric-test-network-extended/caliper/caliper.log"
        else:
            command = f"./scripts/rebuild-network.sh && ./scripts/update-config.sh 1 mychannel {block_size} {block_interval}s && ./scripts/execute-caliper.sh && rm -f fabric-test-network-extended/caliper/caliper.log"

        # calling the scripts separately after rebuilding causes weird issues of longer latency and throughput. [???]
        rebuild_process = subprocess.Popen(
            [command],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        _, err = rebuild_process.communicate()
        self.logger.debug(f"error while rebuilding network {err}")

        self.update_current_state(block_size, block_interval)
        self.tx_submitted = 0

    def update_env_config(self, block_size, block_interval, fixed_config=True):
        command = f"./scripts/update-config.sh 1 mychannel {block_size} {block_interval}s && ./scripts/execute-caliper.sh && rm -f fabric-test-network-extended/caliper/caliper.log"
        update_process = subprocess.Popen(
            [command],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        
        try:
            # combine update and benchmark
            _, err = update_process.communicate()
            self.update_current_state(block_size, block_interval, fixed_config)
            self.logger.debug(f"error during process {err}")
        except TimeoutExpired:
            update_process.kill()
            # benchmark_process.kill()
            self.logger.info(f"benchmark timeout occured")
            self.current_state = (0, 0, 0, 0)  # signal an error

        return self.current_state

    def update_current_state(self, block_size, block_interval, fixed_config=True):
        raw_states = parse_caliper_report(
            f"{TEST_NETWORK_EXTENDED_DIR}/caliper/report.html"
        )
        try:
            # transaction per second (succ/(last commit time - first submit time))
            throughputs = np.array(
                [float(state["Throughput (TPS)"]) for state in raw_states]
            )
            # successes per second
            successes = np.array(
                [float(state["Succ"]) / TX_DURATION for state in raw_states]
            )
            # average latency per transaction
            latencies = np.array(
                [float(state["Avg Latency (s)"]) for state in raw_states]
            )
            np.nan_to_num(throughputs, copy=False)
            np.nan_to_num(successes, copy=False)
            np.nan_to_num(latencies, copy=False)

            if fixed_config:
                size_idx = possible_block_size.index(block_size)
                interval_idx = possible_block_interval.index(block_interval)
            else:
                size_idx = block_size
                interval_idx = block_interval

            self.current_state = (
                math.ceil(np.average(throughputs)),
                math.ceil(np.average(successes)),
                size_idx,
                interval_idx,
            )
            # stupid approximation of tx limit.
            self.tx_submitted += math.ceil(np.sum(successes) * TX_DURATION)
            # save to mongodb database
            self.save_state_to_db(block_size, block_interval, raw_states)
        except Exception as e:
            self.logger.info(f"report parsing error {e}")
            self.current_state = (0, 0, 0, 0)  # signal an error

        self.logger.info(
            f"update state finished for size {block_size} and interval {block_interval}s with results {self.current_state}"
        )

    def needs_rebuild(self):
        return (
            self.tx_submitted >= REBUILD_LIMIT or self.current_state[0] == 0
        )  # if throughput is 0, something is wrong

    def save_state_to_db(self, size, interval, raw):
        config = {
            "target_tps": self.target_tps,
            "batch_size": size,
            "block_interval": interval,
        }
        self.db.insertData(config, raw)
