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

after configuring all the settings required, let's make a file that can run everything at once

```
run nano start-services.sh
```
paste this into the file:

```
#!/bin/bash
# Start Hadoop services
echo "Starting Hadoop services..."
hadoop/hadoop-3.4.1/sbin/start-all.sh

# Wait for Hadoop services to fully start
#sleep 10

# Start Spark services
echo "Starting Spark services..."
spark/spark-3.4.4-bin-hadoop3/start-all.sh

# Check if services are running
echo "Checking running services..."
jps
```

after this provide execute permission to the owner

```
# to check the permission
ls -l start-services.sh

# to modify the permission
chmod 755 start-services.sh
```

similary create bash file for stopping everything:

```
run nano stop-services.sh
```

paste this into the file:
```
#!/bin/bash

# Stop Hadoop services
echo "Stoppping Hadoop services..."
hadoop/hadoop-3.4.1/sbin/stop-all.sh

# Stop Spark services
echo "Stopping Spark services..."
spark/spark-3.4.4-bin-hadoop3/sbin/stop-all.sh

# Check if services are running
echo "Checking running services..."
jps
```

after this provide execute permission to the owner
```
# to check the permission
ls -l stop-services.sh

# to modify the permission
chmod 755 stop-services.sh
```
