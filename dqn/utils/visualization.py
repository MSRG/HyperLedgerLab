import numpy as np
from utils.notification import send_photo
from matplotlib.pyplot import legend
import time
import matplotlib.pyplot as plt
from stable_baselines.results_plotter import load_results, ts2xy


def simple_plot(results):
    fig, ax = plt.subplots()
    ax.plot(results['episode_rewards'], 'b', label='episode rewards')
    ax.plot(results['steps_per_episode'], 'r', label='steps per episode')
    ax.set(xlabel='episode', ylabel='value', title='Q Learning Result')
    ax.grid()
    legend()
    plotname = f"plots/ql-result {time.strftime('%Y-%m-%d %H:%M:%S')}.png"
    fig.savefig(plotname)
    send_photo(open(plotname, 'rb'))
    # plt.show()

def moving_average(values, window):
    """
    Smooth values by doing a moving average
    :param values: (numpy array)
    :param window: (int)
    :return: (numpy array)
    """
    weights = np.repeat(1.0, window) / window
    return np.convolve(values, weights, 'valid')

def simple_baseline_plot(log_folder, title="DQN Result"):
    """
    plot the results

    :param log_folder: (str) the save location of the results to plot
    :param title: (str) the title of the task to plot
    """
    timesteps = load_results(log_folder)

    fig, ax = plt.subplots()
    ax.plot(timesteps.r.values, 'b', label='episode rewards')
    ax.plot(timesteps.l.values, 'r', label='steps per episode')
    ax.set(xlabel='episode', ylabel='value', title=title)
    ax.grid()
    legend()
    
    plotname = f"plots/dqn-result {time.strftime('%Y-%m-%d %H:%M:%S')}.png"
    fig.savefig(plotname)
    send_photo(open(plotname, 'rb'))
    # plt.show()