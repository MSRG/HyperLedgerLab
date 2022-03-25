import numpy as np
from utils.logger import get_logger
from config import MONGODB_HOST, TX_DURATION
import socket
import time
import psutil
from pymongo import MongoClient
import csv


class MongoConnector:
    def __init__(self):
        self.logger = get_logger()
        self.pcname = socket.gethostname().replace(" ", "")
        try:
            self.conn = MongoClient(MONGODB_HOST)
            self.logger.info("MongoDB Connected successfully!!!")
        except:
            self.logger.info("Could not connect to MongoDB")
        self.db = self.conn.benchmark_database
        self.collection = self.db[self.pcname]

    def insertData(self, config, result):
        data = {
            "config": config,
            "benchmark": result,
            "meta": {
                "name": self.pcname,
                "cpu": psutil.cpu_freq(),
                "cpu-cores": psutil.cpu_count(logical=False),
                "ram": psutil.virtual_memory().total,
                "time": time.strftime("%Y-%m-%d %H:%M:%S"),
            },
        }

        self.collection.insert_one(data)

    def writeData(self, collection_name, filename):
        collection = self.db[collection_name]
        with open(filename, mode="a", encoding="utf-8") as output_file:
            csv_writer = csv.DictWriter(
                output_file,
                fieldnames=[
                    "target_tps",
                    "batch_size",
                    "avg_succ",
                    "avg_fail",
                    "avg_latency",
                    "avg_max_latency",
                    "avg_min_latency",
                    "avg_throughput",
                ],
            )
            if output_file.tell() == 0:
                csv_writer.writeheader()     

            for data in collection.find():
                throughputs = np.array(
                    [float(state["Throughput (TPS)"]) for state in data["benchmark"]]
                )
                successes = np.array(
                    [float(state["Succ"]) / TX_DURATION for state in data["benchmark"]]
                )
                failures = np.array(
                    [float(state["Fail"]) / TX_DURATION for state in data["benchmark"]]
                )
                avg_latencies = np.array(
                    [float(state["Avg Latency (s)"]) for state in data["benchmark"]]
                )
                max_latencies = np.array(
                    [float(state["Max Latency (s)"]) for state in data["benchmark"]]
                )
                min_latencies = np.array(
                    [float(state["Min Latency (s)"]) for state in data["benchmark"]]
                )

                row = {
                    **data["config"],
                    "avg_succ": np.around(np.average(successes), 2),
                    "avg_fail": np.around(np.average(failures), 2),
                    "avg_latency": np.around(np.average(avg_latencies), 2),
                    "avg_max_latency": np.around(np.average(max_latencies), 2),
                    "avg_min_latency": np.around(np.average(min_latencies), 2),
                    "avg_throughput": np.around(np.average(throughputs), 2),
                }

                csv_writer.writerow(row)
