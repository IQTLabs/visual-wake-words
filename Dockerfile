FROM tensorflow/tensorflow:1.15.2-gpu-py3-jupyter

LABEL maintainer="Luke Berndt <lberndt@iqt.org>"

RUN apt-get update && apt-get install -y \
    git \
    xxd

RUN git clone https://github.com/tensorflow/models.git 

RUN pip install contextlib2 Pillow tf_slim

ENV PYTHONPATH "${PYTHONPATH}:/tf/models/research/slim"