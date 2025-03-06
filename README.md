# FedData Project

## Table of Contents

- [Installation & Dependencies](#installation--dependencies)
- [Hadoop Cluster Setup](#hadoop-cluster-setup)
- [Hadoop Configuration Files](#hadoop-configuration-files)
- [Spark Configuration](#spark-configuration)
- [Spark Configuration Files](#spark-configuration-files)
- [File Management](#file-management)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Reference Links](#reference-links)

## Installation & Dependencies

### Frontend

```bash
# install and integrate tailwind with react project by following docs
npm install @heroicons/react
npm install d3 chart.js react-chartjs-2
```

### Backend (Python)

```bash
pip install fastapi hdfs pyspark uvicorn pandas pyarrow fastparquet python-dotenv "uvicorn[standard]"
```

## Hadoop Cluster Setup

Ref: [this blog](https://dev.to/samujjwaal/hadoop-installation-on-windows-10-using-wsl-2ck1)

### Multi-cluster setup:

Ref: [this](https://hadoop.apache.org/docs/r3.3.0/hadoop-project-dist/hadoop-common/ClusterSetup.html) and [this blog](https://www.simplilearn.com/what-is-a-hadoop-cluster-article)


### env variables on runtime
```
# Hadoop environment variables
# ~ is replaced with $HOME, change if needed in future

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_HOME=$HOME/hadoop/hadoop-3.4.1
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export YARN_CONF_DIR=$HADOOP_HOME/etc/hadoop

# Adding vars for Spark
export PYSPARK_PYTHON=~/wslenv/bin/python
export PYSPARK_DRIVER_PYTHON=~/wslenv/bin/python

# Add Hadoop paths to PATH
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin

# Spark environment variables
export SPARK_HOME=$HOME/spark/spark-3.4.4-bin-hadoop3
export PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin

# Ensure system paths are included
export PATH=/usr/bin:/bin:$PATH
```
### Service Management

```bash
cd ~/hadoop/hadoop-3.4.1
sbin/start-all.sh
sbin/stop-all.sh
```

You can also start individual services like this:

```bash
sbin/start-dfs.sh
sbin/start-yarn.sh
```

### Web Interfaces

WARNING: links may change as per port availability

- **YARN ResourceManager**: http://localhost:8088/cluster
- **HDFS NameNode**: http://localhost:9870/dfshealth.html#tab-overview or 9868 (command `ss -tuln`)

### HDFS Operations from CLI

```bash
# make directory tmpuploads, uploads, processed, tmp, data/namenode, data/datanode
hdfs dfs -mkdir /user/prashu/tmpuploads
hdfs dfs -mkdir /user/prashu/uploads
hdfs dfs -mkdir /user/prashu/processed
hdfs dfs -ls /user/prashu/processed
hdfs dfs -put /mnt/d/projects/datasets/health.csv /user/prashu/tmpuploads/health.csv # for hadoop on wsl, change accordingly
hdfs dfs -rm -r /path/to/remove # directory or file, -r for recursive

# WARNING: Format namenode only when necessary
hdfs namenode -format
```

## Notes for HDFS setup

### HDFS Client Configuration

To ensure the HDFS client works correctly, follow these steps:

1. **Enable WebHDFS**: Ensure that WebHDFS is enabled in the Hadoop configuration (`hdfs-site.xml`).

2. **NameNode Issues**: If the NameNode is not starting, format the NameNode. Ensure that the NameNode and DataNode directories exist; otherwise, a temporary directory will be created, and you will need to format after every restart.

3. **Permissions**: The Hadoop user must have the necessary permissions to access the directories and connect Spark and all other components. (If only the user has permission to read/write, this can be a verification for the framework that no one else is reading data except the user.)

4. **File Copying**: When copying files to HDFS, ensure the exact path is specified. Otherwise, the file might be treated as a directory and may not be visible on the frontend.

5. **WARNING**: Don't do any operation of hdfs file or dir other than from what framework internally does, this may result is meta data mismatch and cause error in future.

## Hadoop Configuration Files
Hadoop’s Java configuration is driven by two types of important configuration files:
- Read-only default configuration - core-default.xml, hdfs-default.xml, yarn-default.xml and mapred-default.xml.
- Site-specific configuration - etc/hadoop/core-site.xml, etc/hadoop/hdfs-site.xml, etc/hadoop/yarn-site.xml and etc/hadoop/mapred-site.xml.
- NOTE: ubuntu is username (check by whoami)
  
### etc/hadoop/core-site.xml

```xml
<configuration>
    <!-- Default file system for HDFS -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>

    <!-- Temporary directory for Hadoop -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>file:///home/ubuntu/hadoop/hadoop-3.4.1/tmp</value>
    </property>
</configuration>
```

### etc/hadoop/hdfs-site.xml

```xml
<configuration>
    <!-- Replication factor for single-node setup -->
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>

    <property>
      <name>dfs.webhdfs.enabled</name>
      <value>true</value>
  </property>

    <!-- Directory for NameNode metadata -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///home/ubuntu/hadoop/hadoop-3.4.1/data/namenode</value>
    </property>

    <!-- Directory for DataNode blocks -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///home/ubuntu/hadoop/hadoop-3.4.1/data/datanode</value>
    </property>
</configuration>

```

### etc/hadoop/yarn-site.xml
```xml
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME </value>
   </property>
</configuration>
```

### etc/hadoop/mapred-site.xml
```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.application.classpath</name>
        <value>$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/*:$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/lib/*</value>
    </property>
</configuration>
```
Additionally, you can control the Hadoop scripts found in the bin/ directory of the distribution, by setting site-specific values via the etc/hadoop/hadoop-env.sh and etc/hadoop/yarn-env.sh (you can write all hadoop specific variables in this file only the precedence order will be variable in xyz-env.sh > hadoop-env.sh > default coded vars)

## set java path in /etc/hadoop/hadoop-env.sh
```
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
```

## Spark Configuration

### Installation

Download Spark from the official website. Choose a version compatible with the Hadoop setup (e.g., Spark 3.4.x for Hadoop 3.4.x).

```bash
wget https://dlcdn.apache.org/spark/spark-3.4.4/spark-3.4.4-bin-hadoop3.tgz
mkdir ~/spark
tar -xvzf spark-3.4.4-bin-hadoop3.tgz -C ~/spark
```

### Environment Variables

```bash
## Add to `~/.bashrc` then reload the shell by `source ~/.bashrc`:

export SPARK_HOME=~/spark
export PATH=$SPARK_HOME/bin:$PATH
export PYSPARK_PYTHON=~/wslenv/bin/python
```

Verify Spark Installation: Run the following command to check the Spark installation:

```bash
spark-shell
```

This should open an interactive shell.

### Service Management

```bash
# start master and worker
spark/sbin/start-all.sh
# stop master and worker
spark/sbin/stop-all.sh
```

## Additional Notes for Spark setup

Don't start any data creation/pre-processing until all the components of Spark and Hadoop are started.

Configure Spark to use YARN as the resource manager for Spark.

Edit the Spark configuration files in `$SPARK_HOME/conf`
`spark-env.sh`: Create a file `spark-env.sh` in `$SPARK_HOME/conf` if it doesn't exist:

```bash
cp $SPARK_HOME/conf/spark-env.sh.template $SPARK_HOME/conf/spark-env.sh
```

Add the following lines (core-site.xml and hdfs-site.xml: Spark will automatically pick up Hadoop configurations from `$HADOOP_CONF_DIR`):
## in file spark/conf/spark-env.sh

```bash
export HADOOP_CONF_DIR=$HADOOP_CONF_DIR
export YARN_CONF_DIR=$YARN_CONF_DIR
export SPARK_MASTER_HOST=localhost
export SPARK_LOCAL_IP=127.0.0.1

# Add the right venv path to be used when spark workers are scheduled (not yet tested)
export PYSPARK_PYTHON=~/wslenv/bin/python
export PYSPARK_DRIVER_PYTHON=~/wslenv/bin/python
```
## clear pyspark cache (whenever needed)
```
rm -rf ~/hadoop/hadoop-3.4.1/tmp/nm-local-dir/usercache/*
```

[You can have only one active SparkSession](https://stackoverflow.com/questions/40153728/multiple-sparksessions-in-single-jvm), due to a single SparkContext per JVM (if another Spark session is active in some other process, then some parts of the FedData will not work).

To verify if YARN is being used as the resource manager:
When YARN is managing resources and Spark has submitted the jobs, some more Java processes will be running (check by `jps`).

Spark.read cannot infer schema from files starting with underscores (`_`), and Spark sometimes writes files as directories (because multiple executors write parts of the file in parallel).

### Spark configs in spark/conf/spark-defaults.conf

```bash
# Set HDFS as the default file system
spark.hadoop.fs.defaultFS hdfs://localhost:9000

# Use YARN as the cluster manager
spark.master yarn

# Specify deploy mode for Spark jobs
spark.submit.deployMode client
```
there are other options too, yet to explore...

#####################################################################################################################################
################################################### Below configs are not tested  ###################################################
#####################################################################################################################################

### Cluster Tuning for 100GB+ Datasets: // not yet tested by me

```bash
1. Memory Settings:
spark.executor.memory = 16g
spark.driver.memory = 8g
spark.memory.fraction = 0.8

2. Parallelism:
spark.sql.shuffle.partitions = 2000
spark.default.parallelism = 2000

3. Serialization:
spark.serializer = org.apache.spark.serializer.KryoSerializer

4. SQL Optimizations:
spark.sql.autoBroadcastJoinThreshold = -1
spark.sql.adaptive.enabled = true

5. HDFS Tuning:
dfs.block.size = 256m
dfs.replication = 2
```

## Spark Configuration Files

### spark-defaults.conf

```properties
spark.master                     yarn
spark.eventLog.enabled           true
spark.eventLog.dir               hdfs://localhost:9000/spark-logs
spark.history.fs.logDirectory    hdfs://localhost:9000/spark-logs
spark.yarn.historyServer.address http://localhost:18080
```

### spark-env.sh

```bash
export HADOOP_CONF_DIR=$HADOOP_CONF_DIR
export YARN_CONF_DIR=$YARN_CONF_DIR
export SPARK_MASTER_HOST=localhost
export SPARK_LOCAL_IP=127.0.0.1
export PYSPARK_PYTHON=~/wslenv/bin/python
export PYSPARK_DRIVER_PYTHON=~/wslenv/bin/python
```

## Troubleshooting Guide

### Common Issues & Solutions

**Port Conflicts**

```bash
lsof -i :8000 # Find PID
kill -9 <PID>
```

**WebHDFS Configuration**  
Ensure `hdfs-site.xml` contains:

```xml
<!-- Add necessary WebHDFS configurations here -->
```

### Quick System Check

```bash
jps # Verify running Java processes, FedData will work correctly only if all expected processes are running
```

## Additional resources

WARNING: may/may not be used in this project
Ref:

[Connection refused error](https://cwiki.apache.org/confluence/display/HADOOP2/ConnectionRefused)

[Connection refused error](https://stackoverflow.com/questions/28661285/hadoop-cluster-setup-java-net-connectexception-connection-refused)

[Upload files in fastAPI](https://www.youtube.com/watch?v=y_JPb8vOh28&ab_channel=CodeCollider)
