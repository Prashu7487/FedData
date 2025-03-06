# Guide to install hadoop in AWS(ubuntu 22.04) instance

//by default you get connected to ubuntu user (not the root)
```
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```
```
sudo apt update
java -version
sudo apt-get install openjdk-8-jdk

## check again with java -version 
## output should look like this-
  openjdk version "1.8.0_275"
  OpenJDK Runtime Environment (build 1.8.0_275-8u275-b01-0ubuntu1~20.04-b01)
  OpenJDK 64-Bit Server VM (build 25.275-b01, mixed mode)
```

## download and install hadoop
```
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.4.1/hadoop-3.4.1.tar.gz
mkdir ~/hadoop
tar -xvzf hadoop-3.4.1.tar.gz -C ~/hadoop
```
## download and install spark
```
wget https://dlcdn.apache.org/spark/spark-3.4.4/spark-3.4.4-bin-hadoop3.tgz
mkdir ~/spark
tar -xvzf spark-3.4.1-bin-hadoop3.tgz -C ~/spark
```

Furthure configuration tuning is mentioned in README.md
