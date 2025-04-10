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

Ref: [medium blog](https://awstip.com/setting-up-multi-node-apache-hadoop-cluster-on-aws-ec2-from-scratch-2e9caa6881bd)


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

WARNING: links may change as per port availability, and use your public IP in place of localhost for deployed cluster

- **YARN ResourceManager**: http://localhost:8088/cluster
- **HDFS NameNode**: http://localhost:9870/dfshealth.html#tab-overview or 9868 (command `ss -tuln`)

### HDFS Operations from CLI
- sample commands
- put command won't work if ports are not exposed

```bash
# make directory tmpuploads, uploads, processed, tmp, data/namenode, data/datanode
hdfs dfs -mkdir /user
hdfs dfs -mkdir /user/cdis/
hdfs dfs -mkdir /user/cdis/tmpuploads
hdfs dfs -mkdir /user/cdis/uploads
hdfs dfs -mkdir /user/cdis/processed
hdfs dfs -ls /user/cdis/processed
hdfs dfs -put /mnt/d/projects/datasets/health.csv /user/prashu/tmpuploads/health.csv # for hadoop on wsl, change accordingly
hdfs dfs -put /mnt/d/projects/datasets/health2.csv /user/fedserver/tmpuploads/health2.csv
hdfs dfs -rm -r /path/to/remove # directory or file, -r for recursive

# WARNING: Format namenode only when necessary
hdfs namenode -format

#verify running hdfs
hdfs dfsadmin -report
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
Instead of localhost 0.0.0.0 used to accept requests from all network interfaces.

```xml
<configuration>
    <!-- Default file system for HDFS -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://0.0.0.0:9000</value>
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

     <!--  0.0.0.0 means "accept connections from anywhere", not in current setup of mine but maybe needed ahead -->
    <property>
      <name>dfs.namenode.rpc-address</name>
      <value>0.0.0.0:9000</value>
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
wget https://dlcdn.apache.org/spark/spark-3.5.5/spark-3.5.5-bin-hadoop3.tgz
mkdir ~/spark
tar -xvzf spark-3.5.5-bin-hadoop3.tgz -C ~/spark
```

### Environment Variables

```bash
## Add to `~/.bashrc` then reload the shell by `source ~/.bashrc`:

export SPARK_HOME=~/spark/spark-3.5.5-bin-hadoop3
export PATH=$SPARK_HOME/bin:$PATH
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HADOOP_HOME/lib/native  # For native libs
export PYSPARK_PYTHON=~/wslenv/bin/python

```

### Reload env-
```
source ~/.bashrc
```

###  Link Hadoop Configurations to Spark
```
# Symlink Hadoop configs to Spark's conf directory
ln -s $HADOOP_CONF_DIR/core-site.xml $SPARK_HOME/conf/
ln -s $HADOOP_CONF_DIR/hdfs-site.xml $SPARK_HOME/conf/
```

### Service Management of spark

```bash
# start master and worker
spark/spark-3.5.5-bin-hadoop3/sbin/start-all.sh
# stop master and worker
spark/spark-3.5.5-bin-hadoop3/sbin/stop-all.sh
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
export SPARK_MASTER_HOST=localhost # or (0.0.0.0) to allow connection from everywhere
export SPARK_LOCAL_IP=127.0.0.1  # or (0.0.0.0) to allow connection from everywhere

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

### For pyspark shell to experiment quickly-
```
pyspark --master yarn --deploy-mode client

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

[For spark use with files on AWS](https://medium.com/@bharadwajaryan30/handling-big-data-with-pyspark-and-aws-s3-f2a3f28419a9)
[spark + S3](https://stackoverflow.com/questions/44411493/java-lang-noclassdeffounderror-org-apache-hadoop-fs-storagestatistics)


###############################################################################################
## temp notes: will edit later:

Set-up aws cli:
```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip    # install unzip if not already
sudo ./aws/install
```
verify installation-
```
which aws
aws --version
```

Setting AWS credentials (Keep these secret)-
Brief desc to find/create these AWS credentials (your username should have proper permissions to create an access key)

Login to AWS Console
Go to the "IAM" service
Click "Users" from the left sidebar
Click (not select) on your username
Go to the "Security credentials" tab
Scroll down to Access keys section
Click "Create access key"
Choose the Command Line Interface (CLI)
Click "Next", assign some name then "Create access key"
You’ll be shown:
✅ Access Key ID
✅ Secret Access Key (only once — save it somewhere safe)
📂 You can download a CSV file with them for safekeeping.
```
aws configure

# Now, you'll be prompted for-

AWS Access Key ID:     <your-access-key>
AWS Secret Access Key: <your-secret-key>
Default region name:  <your-region>    
Default output format: json      
```
Install Required JARs for Hadoop + Spark to Talk to S3 and place these jars into classpath
Note:
You need to install these JARs and update config files accordingly and these are highly version sensitive (the below ones are for Hadoop 3.4.1 and Spark 3.5.5, with PySpark 3.5.1)
```
wget https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.4.1/hadoop-aws-3.4.1.jar -P $HADOOP_HOME/share/hadoop/common/lib/

# For AWS SDKv1 use this and "com.amazonaws.auth.DefaultAWSCredentialsProviderChain" class as credential provider
wget https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.11.1026/aws-java-sdk-bundle-1.11.1026.jar -P $HADOOP_HOME/share/hadoop/common/lib/

# OR, for  AWS SDKv2 (hadoop 3.4+)  use this and "software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider" as credential provider, however this doesn't work sometimes
wget https://repo1.maven.org/maven2/software/amazon/awssdk/bundle/2.24.6/bundle-2.24.6.jar -P $HADOOP_HOME/share/hadoop/common/lib/

# verify these jars presence -

```
Update core-site.xml in 

```
<configuration>
     <!-- for AWS and distcp -->
    <property>
        <name>fs.s3a.impl</name>
        <value>org.apache.hadoop.fs.s3a.S3AFileSystem</value>
    </property>

    <property>
        <name>fs.s3a.aws.credentials.provider</name>
        <value>com.amazonaws.auth.DefaultAWSCredentialsProviderChain</value>
    </property>

    <property>
        <name>fs.s3a.fast.upload</name>
        <value>true</value>
    </property>

    <property>
        <name>fs.s3a.connection.maximum</name>
        <value>100</value>
    </property>

</configuration>
```

Check AWS reachability-

```
hadoop fs -ls s3a://qpd-data/
hadoop distcp hdfs:///user/prashu/data/ s3a://qpd-data/temp/   # (adjust path)

```

For writing to S3 using spark-

### Add AWS access credentials (either through awscli or in ~/.bashrc like below)
```
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
```

### install required jar files on hadoop (extreme version sensitive)
use this site to decide the AWS SDK jar compatible: [this](https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-aws/3.4.1)
Other refs: 
[apache docs](https://hadoop.apache.org/docs/r3.4.0/hadoop-aws/tools/hadoop-aws/index.html#General_S3A_Client_configuration)
[apache docs](https://hadoop.apache.org/docs/r3.4.1/hadoop-aws/tools/hadoop-aws/troubleshooting_s3a.html)
[stack overflow](https://stackoverflow.com/questions/44411493/java-lang-noclassdeffounderror-org-apache-hadoop-fs-storagestatistics)

```

## install only one of the below (either SDKv1 jar or SDKv2 jar, and be consistent with it in furthur commands)
# if your hadoop is for SDKv1
wget https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar -P $SPARK_HOME/jars/

#if your hadoop is for SDKv2 (hadoop 3.4.x), "aws-java-sdk-bundle-1.12.262.jar" also works for hadoop 3.4.x with appropriate credential resolver class
wget https://repo1.maven.org/maven2/software/amazon/awssdk/bundle/2.24.6/bundle-2.24.6.jar -P $HADOOP_HOME/share/hadoop/common/lib/

# install all from here
hadoop-common-3.4.1.jar in path $HADOOP_HOME/share/hadoop/common/lib

# this will be there initially (download if not avail)
guava-27.0-jre.jar
```

### Replace All Hadoop JARs in Spark with 3.4.1 Versions
```
mkdir -p ~/spark-hadoop-jars-backup
mv $SPARK_HOME/jars/hadoop-* ~/spark-hadoop-jars-backup

# Copy Hadoop 3.4.1 JARs from your Hadoop installation to spark jars
HADOOP_LIBS_DIR=$HADOOP_HOME/share/hadoop
cp $HADOOP_LIBS_DIR/common/hadoop-common-3.4.1.jar $SPARK_HOME/jars/
cp $HADOOP_LIBS_DIR/common/lib/hadoop-aws-3.4.1.jar $SPARK_HOME/jars/
cp $HADOOP_LIBS_DIR/common/lib/guava-27.0-jre.jar $SPARK_HOME/jars/
cp $HADOOP_LIBS_DIR/common/lib/bundle-2.24.6.jar $SPARK_HOME/jars/ (or aws-java-sdk-bundle-1.12.262.jar as per prev step)
```

### Add AWS JARs to Spark Classpath
```
# Example paths (adjust based on your Hadoop setup):
HADOOP_LIB_DIR=$HADOOP_HOME/share/hadoop/tools/lib/

# Copy required JARs
cp $HADOOP_LIB_DIR/hadoop-aws-3.4.1.jar $SPARK_HOME/jars/
cp $HADOOP_LIB_DIR/aws-java-sdk-bundle-1.12.262.jar $SPARK_HOME/jars/
```

### Copy spark-jars to hdfs to avoid warning on every job submit
```
# Upload Spark JARs to HDFS
hdfs dfs -mkdir -p /spark-jars
hdfs dfs -put $SPARK_HOME/jars/* /spark-jars/

# Add to spark-defaults.conf by echo command
echo "spark.yarn.jars hdfs:///spark-jars/*" >> $SPARK_HOME/conf/spark-defaults.conf
```

### Accessing spark UIs
```
Check YARN ResourceManager UI for the application logs by
http://<yarn-resourcemanager-host>:8088.

To access Spark UI directly:
Use the correct IP (from SPARK_LOCAL_IP in spark-env.sh) in the URL.
Allow port 4040 in your firewall (sudo ufw allow 4040)
```

### For accessing spark shell 
```
spark-shell --master yarn

# Test-
val data = Seq(("Prashu", 25), ("Spark", 10))
val df = data.toDF("Name", "Age")
df.show()
```

# yet to include env vars



