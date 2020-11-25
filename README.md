# Visual Wake Word Model Training

It possible to run image recognition on low-power microcontrollers. This can used to create a visual sensor that looks for a specific object. Google describes using this to wake up a system in their Visual Wake Words [paper](https://blog.tensorflow.org/2019/10/visual-wake-words-with-tensorflow-lite_30.html). While this paper looks at different model parameters to use for detecting people, [instructions](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/lite/micro/examples/person_detection/training_a_model.md) are provide as part of Tensorflow for training a model to detect other types of objects.

This repository makes it easier to train a Visual Wake Word model that can detect a specified object. It combines a Docker container that loads the appropriate version of Tensorflow (TF), with Jupyter and GPu support included. The process that Google came up with uses Tensorflow Slim, which is only supported by the older 1.x versions of TF.

## Requirements 
Since you will be training a model, an Nvidia GPU is required. In order for a Docker container to access the GPU, the Nvidia Container Toolkit needs to be installed. There are directions for doing that [here](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker). You can test to make sure everything is installed correctly and working, with the following command:
````
sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
````

## Building a model

### Build a Docker container with TF, TF-Slim, and Jupyter 
In the main directory of this repository, run the following command:
````
sudo docker build -t vww-jupyter .
````
This will build a container image called **vww-jupyter** that contains TF v1.15.2 with Python 3, Jupyter Notebooks and TF Slim installed.


### Start Jupyter with GPU support enabled
In the main directory of this repository, run the following command to start the container. The **dataset**, **notebooks** and **training** directories are all mapped into the container. This lets you keep your progress if you stop the container and then start it again later. It also makes it easy to get a trained model out of the container. Ports **8888** and **6006** are also mapped from the container, allowing access to the Jupyter server, and Tensorboard.

````
sudo docker run -v $PWD/dataset:/tf/dataset -v $PWD/notebooks:/tf/notebooks -v $PWD/training:/tf/training --gpus all -p 8888:8888  -p 6006:6006 -it --name  vww-jupyter --rm vww-jupyter 
````

As the container starts up, pay attention to the output. A token will be generated and you will need to copy and paste it in when opening Jupyter notebooks in your browser.

You can then access the Jupyter notebook by going to **port 8888** of the machine where the container is running. For example, if you are running the container locally, you would type the following address into your browser: *http://localhost:8888*.

### Attach to a running container
If you wish to access the running version of the container and poke around on the command line inside it, use the following command:
````
sudo docker exec -it vww-jupyter  /bin/bash
````

### Tensorboard
If you wish to monitor the progress of a model being trained, Tensorboard provides a nice visualization of different metrics. To launch it, use the command above to attach to the running container and then run the following:
````
tensorboard --log_dir=/tf/training/
````
If you goto **port 6006** of the machine where the container is running in a browser, the Tensorboard app should pop up.

## Web App - Model Explorer
The **[web-object-detector/](web-object-detector/)** folder contains a small, react based, web app that lets you try out different VWW models in your browser using Tensorflow JS. The models for detecting cars, apples, dogs and bicycles are included. This app can be easily extended to support additional models. It is based on [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html) and the standard commands can be used to build and serve the app. Refer to the [readme](web-object-detector/README.md) for more information.


## Additional References

### Overview on how to build the Visual Wakewords dataset using the Slim Dataset factory
https://github.com/tensorflow/models/blob/master/research/slim/README.md

