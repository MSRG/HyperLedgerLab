import logging


def get_logger():
    logger = logging.getLogger(__name__)
    return logger


last_file = ""


def configure_logger(logger, file="", level=logging.INFO):
    global last_file
    if file:
        if logger.hasHandlers():
            if last_file:
                logger.removeHandler(get_file_handler(last_file))
            logger.removeHandler(get_stream_handler())
        last_file = file
    logger.addHandler(get_file_handler(last_file))
    logger.addHandler(get_stream_handler())
    logger.setLevel(level)


def get_stream_handler():
    formatter = logging.Formatter("%(asctime)s|%(levelname)s:%(module)s  %(message)s")
    streamHandler = logging.StreamHandler()
    streamHandler.setFormatter(formatter)
    return streamHandler


def get_file_handler(file):
    formatter = logging.Formatter("%(asctime)s|%(levelname)s:%(module)s  %(message)s")
    fileHandler = logging.FileHandler(file)
    fileHandler.setFormatter(formatter)
    return fileHandler
