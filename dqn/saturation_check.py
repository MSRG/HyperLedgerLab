'''
this class is useful to check the baseline saturation level of your network (when failures starts adding up)
'''


import subprocess
from rl_model.fabric_custom_env import Fabric

def rebuild():
    rebuild_process = subprocess.Popen(
        ["./scripts/rebuild-network.sh"],
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    # synchronous call
    rebuild_process.communicate()

def benchmark():
    benchmark_process = subprocess.Popen(
        ["./scripts/execute-caliper.sh"],
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )

    # synchronous call
    benchmark_process.communicate()

def check_saturation(initial_sendrate=150, increment=50):
    env = Fabric()
    sendrate = initial_sendrate
    # default value for test network
    block_size = 10
    block_interval = 2

    env.set_tps(sendrate)
    rebuild()
    benchmark()

    env.update_current_state(block_size, block_interval)
    state = env.current_state

    # TODO: check assumption for stress test
    # if throughput is < 65% send rate or success is < 80%, stop the stress test
    while state[0] > (sendrate * 0.65):
        print(f"for tps {sendrate}, achieved state {state}")
        sendrate += increment
        env.set_tps(sendrate)
        benchmark()
        env.update_current_state(block_size, block_interval)
        state = env.current_state

        if env.needs_rebuild():
            rebuild()
    
    print(f"===== THROUGHPUT SATURATION POINT IS at {sendrate} with state {state} =====")
    
    sendrate = initial_sendrate
    env.set_tps(sendrate)
    rebuild()
    benchmark()

    env.update_current_state(block_size, block_interval)
    state = env.current_state
    
    while state[1] > (sendrate * 0.8):
        print(f"for tps {sendrate}, achieved state {state}")
        sendrate += increment
        env.set_tps(sendrate)
        benchmark()
        env.update_current_state(block_size, block_interval)
        state = env.current_state

        if env.needs_rebuild():
            rebuild()
    
    print(f"===== FAILURE SATURATION POINT IS at {sendrate} with state {state} =====")

    return sendrate

check_saturation()
