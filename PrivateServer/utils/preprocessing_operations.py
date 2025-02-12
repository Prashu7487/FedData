# from utils.spark_services import SparkSessionManager
# from utils.hdfs_services import HDFSServiceManager
# from utils.database_services import DatabaseManager

# from utils.processing_helper_functions import All_Column_Operations, Column_Operations
# from pyspark.sql.types import DoubleType, IntegerType, LongType, FloatType, DecimalType, StringType, BooleanType
# import time
# import os
# import time
# import json

# HADOOP_USER_NAME = os.getenv("HADOOP_USER_NAME")
# HDFS_NAME_NODE_URL = os.getenv("HDFS_NAME_NODE_URL")
# HDFS_PROCESSED_DATASETS_DIR = os.getenv("HDFS_PROCESSED_DATASETS_DIR")
# HDFS_FILE_READ_URL = f"hdfs://{HDFS_NAME_NODE_URL}/user/{HADOOP_USER_NAME}"


# async def preprocess_data(directory: str, filename: str, operations: list):
#     """
#     Preprocess a dataset using as per the options JSON received.

#     Notes:
#      i) If error occured at any step, the function will print the error and continue to the next step.
#      ii) When the operation is not finished in case of error, the df still could be modified (because I'm not maintaining the copy and each step is done on the same df)
#      iii) During many ops (like normalization, calculating mean, mode etc.) pyspark internally skips null if there is any
#      iv) Before changing the code please see the pyspark docs if ops can be paralellized (on executors) or not in the new code
#      v) ensure correctness of the operations and the order of operations, here is some list:
#             - Drop Null, Fill Null, Drop Duplicates should be done before any normalization, scaling, encoding etc.
#             - Normalization, Scaling, Encoding should be done before any transformation (like log, square etc.)
#             - Avoid log, square root and such transformation on negative or 0 values 
#             - Avoid normalization on categorical columns (see count of unique values in the column to decide)
#             - In most of the ops invalid rows are dropped or skiped by pyspark, take care of that
#             - only int cols can be encoded into one-hot, label encoding
#             - Normalization operation in "All Columns" will treat one row of all col as a vector, considering this they will do the opr
#               and then assigns the values back to the respective columns
#             - Exclude col from All Cloumns excludes that column from "All Columns" operation onwards, still you can select that col and do any ops
#             - even the order of cols in initial df matters for final results
#     """
#     try:
#         with SparkSessionManager("Preprocessing") as spark:
#             # Load the dataset from HDFS
#             print(f"Starting preprocessing for {HDFS_FILE_READ_URL}/{directory}/{filename}...")
#             df = spark.read.parquet(f"{HDFS_FILE_READ_URL}/{directory}/{filename}")

#             # df.show()
#             if(df is None):
#                 print(f"Dataset not found in HDFS: {HDFS_FILE_READ_URL}/{directory}/{filename}")
#                 return {"message": "Dataset not found in HDFS"}
            
#             # Record the time, and get the numeric columns
#             t1 = time.time()
#             All_Columns = df.columns
#             numericCols = [c for c in All_Columns if isinstance(df.schema[c].dataType, (DoubleType, IntegerType, LongType, FloatType, DecimalType))]

#             # Apply the preprocessing steps
#             for step in operations:
#                 if step["operation"] == "Exclude from All Columns list":
#                     All_Columns.remove(step['column'])
#                     if step['column'] in numericCols:
#                         numericCols.remove(step['column'])
                        
#                 elif step["column"] == "All Columns":
#                     try:
#                         df = All_Column_Operations(df, step, numericCols, All_Columns)
#                     except Exception as e:
#                         print(f"error: Error in {step['operation']} operation for {step['column']} column: {str(e)} \n")       
#                 else:
#                     try:
#                         df = Column_Operations(df, step)
#                     except Exception as e:
#                         print(f"error: Error in {step['operation']} operation for {step['column']} column: {str(e)} \n")


#             # Write the preprocessed dataset back to HDFS
#             df.write.mode("overwrite").parquet(f"{HDFS_FILE_READ_URL}/{HDFS_PROCESSED_DATASETS_DIR}/{filename}")
#             print(f"Preprocessed dataset saved to: {HDFS_FILE_READ_URL}/{HDFS_PROCESSED_DATASETS_DIR}/{filename} and time taken: ",time.time()-t1)

#             # save the new stats to the database
#             db_client = DatabaseManager()
#             spark_client = SparkSessionManager("")

#             # The spark_services file has a method to get the dataset overview, and that can take care of multiple simultaneous spark sessions
#             # for more optimization this fucntion can be repeated here, and we don't need to read the file again
#             await db_client.add_dataset(HDFS_PROCESSED_DATASETS_DIR, filename, spark_client.get_dataset_overview(HDFS_PROCESSED_DATASETS_DIR, filename))
#             print("Preprocessed Dataset saved to DB successfully!")
#             return {"message": "Dataset preprocessed successfully"}
#     except Exception as e:
#         print(f"An error occurred during preprocessing: {str(e)}")
#         return {"message": f"An error occurred in preprocess_data method: {str(e)}"}


# # operations = [
# #     {"column": "col1", "operation": "Label Encoding"},
# #     {"column": "col2", "operation": "Drop Null"},
# #     {"column": "col3", "operation": "z-score"},
# #     {"column": "All Columns", "operation": "Drop Null"},
# #     {"column": "All Columns", "operation": "z-score std"},
# #     {"column": "col4", "operation": "One Hot Encoding"},
# #     {"column": "col5", "operation": "Min-Max Scaling"},
# #     {"column": "col6", "operation": "Fill Mean"},
# #     {"column": "All Columns", "operation": "Drop Duplicates"},
# # ]
