# import os
from fastapi import FastAPI, WebSocketDisconnect, Request, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import data_preprocessing_routers
# from utils.spark_services import SparkSessionManager
# from utils.database_services import DatabaseManager
# from utils.hdfs_services import HDFSServiceManager
# import json
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
load_dotenv()

# executor = ThreadPoolExecutor(max_workers=os.cpu_count())

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_preprocessing_routers.router)

app.get("/")
def hello_server():
    return {"message": "Hello, this is main Server!"}


# HDFS_URL = os.getenv("HDFS_URL")
# HADOOP_USER_NAME = os.getenv("HADOOP_USER_NAME")
# # LOCAL_RAW_DATASETS_DIR = os.getenv("LOCAL_RAW_DATASETS_DIR")
# # LOCAL_PROCESSED_DATASETS_DIR = os.getenv("LOCAL_PROCESSED_DATASETS_DIR")
# HDFS_RAW_DATASETS_DIR = os.getenv("HDFS_RAW_DATASETS_DIR")
# RECENTLY_UPLOADED_DATASETS_DIR = os.getenv("RECENTLY_UPLOADED_DATASETS_DIR")
# # DB_FILENAME = os.getenv("DB_FILENAME")
# # DB_PATH = os.path.join(os.getcwd(), DB_FILENAME)  
# # DATABASE_URL = f"sqlite:///{DB_FILENAME}"  

# Initialize the database
# db_client = DatabaseManager()
# hdfs_client = HDFSServiceManager()
# spark_client = SparkSessionManager()

# async def create_dataset(filename: str, filetype: str):
#     try:
#         # rename the hdfs file with prefix PROCESSING_, not __PROC__ (spark can't read files with starting __)
#         source_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}"
#         destination_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}__PROCESSING__"
#         await hdfs_client.rename_file(source_path, destination_path)
#         newfilename = f"{filename}__PROCESSING__"
#         dataset_overview = await spark_client.create_new_dataset(newfilename, filetype)
#         await db_client.add_dataset(HDFS_RAW_DATASETS_DIR, filename, dataset_overview)
#         # await hdfs_client.delete_file_from_hdfs(RECENTLY_UPLOADED_DATASETS_DIR, newfilename)
#         await hdfs_client.rename_file(destination_path,source_path)
#     except Exception as e:
#         print("Error in processing the data is: ", str(e))


# async def preprocess_dataset(directory: str, filename: str, operations: list):
#     try:
#         # rename the file with __PROCESSING__ suffix
#         source_path = f"{directory}/{filename}"
#         destination_path = f"{directory}/{filename}__PROCESSING__"
#         await hdfs_client.rename_file(source_path, destination_path)
#         newfilename = f"{filename}__PROCESSING__"
#         dataset_overview =  await spark_client.preprocess_data(directory, newfilename, operations)
#         await db_client.add_dataset(directory, filename, dataset_overview)
#         await hdfs_client.rename_file(destination_path,source_path)
#     except Exception as e:
#         print("Error in preprocessing the data is: ", str(e))

# @app.get("/")
# def hello_server():
#     return {"message": "Hello, this is Server!"}

# @app.get("/testing_list_all_datasets")
# async def testing_list_all_datasets():
#     return await hdfs_client.testing_list_all_datasets()

# @app.get("/list-recent-uploads")   
# async def list_recent_uploads():
#     return await hdfs_client.list_recent_uploads()

# @app.get("/list-all-datasets")
# async def list_all_datasets():
#     return await db_client.list_all_datasets()

# @app.post("/create-new-dataset")
# async def create_new_dataset(request: Request):
#     data = await request.json()
#     # directory not needed, it is known that directory will be RECENTLY_UPLOADED_DATASETS_DIR from env file
#     filename = data.get("fileName")
#     filetype = "csv"
#     # background_tasks.add_task(create_dataset, filename, filetype)  #this is blocking the server    
#     executor.submit(lambda filename,filetype: asyncio.run(create_dataset(filename,filetype)),filename,filetype)

#     return {"message": "Dataset creation started..."}

# @app.get("/dataset-overview/{path}/{dataset_id}")
# async def get_overview(path: str, dataset_id: str):
#     try:
#         return await db_client.get_dataset(path, dataset_id)
#     except Exception as e:
#         return {"error": str(e)}

# @app.delete("/delete-file")
# async def delete_file(directory: str = Query(...), fileName: str = Query(...)):
#     # async because it's not more CPU bound task it's more of I/O bound
#     try:
#         print(f"Directory: {directory}, File Name: {fileName}")
        
#         await hdfs_client.delete_file_from_hdfs(directory, fileName)
#         await db_client.delete_dataset(directory, fileName)
#         return {"message": "File deleted successfully!"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/preprocess-dataset")
# # async def process_dataset(request: Request):
#     data = await request.json()
#     directory = data.get("directory")
#     filename = data.get("fileName")
#     operations = data.get("operations")
#     print(f"Started processing {filename}...")

#     executor.submit(lambda directory,filename,operations: asyncio.run(preprocess_dataset(directory, filename, operations)), directory,filename,operations)
#     return {"message": "Dataset preprocessed successfully"}



    













# if not os.path.exists(LOCAL_RAW_DATASETS_DIR):
#     os.makedirs(LOCAL_RAW_DATASETS_DIR)

# if not os.path.exists(LOCAL_PROCESSED_DATASETS_DIR):
#     os.makedirs(LOCAL_PROCESSED_DATASETS_DIR)


# @app.post("/set-filename")
# async def set_filename(request: Request):
#     data = await request.json()
#     hdfs_client.set_file_name(data.get("fileName"))
#     return {"received_fileName": hdfs_client.file_name}

# @app.websocket("/upload-raw-dataset")
# async def upload(websocket: WebSocket):
    # await websocket.accept()
    # chunk_count = 0
    # try:
    #     while True:
    #         data = await websocket.receive()  

    #         # Check if the received message is the "END_OF_FILE"
    #         if data.get("text") == "END_OF_FILE":
    #             print("Received the end of file signal...")
    #             await hdfs_client.flush_to_parquet()
    #             print("flushed to parquet")
    #             await hdfs_client.write_to_hdfs()
    #             print("written to hdfs")
    #             await db_client.add_dataset(LOCAL_RAW_DATASETS_DIR, hdfs_client.file_name, spark_client.get_dataset_overview(HDFS_RAW_DATASETS_DIR,hdfs_client.file_name))
    #             print("added to db") 
    #             break
            
    #         # Handle receiving the file name (initial message)
    #         elif data.get("text") is not None:
    #             parsed_data = json.loads(data.get("text"))
    #             file_name = parsed_data.get("fileName")
    #             hdfs_client.set_file_name(file_name)
    #             print("Received the file name " + file_name)
    #             continue
            
    #         # If data contains bytes (this is the file chunk)
    #         if data.get("bytes") is not None:
    #             print(f"Receiving chunk #{chunk_count}")
    #             await hdfs_client.process_chunk(data.get("bytes"))
    #             chunk_count += 1
    #             # Acknowledge receipt of the chunk
    #             await websocket.send_text("ACK")  
                
    # except WebSocketDisconnect:
    #     print("WebSocket Disconnected Abruptly...")
    #     websocket.close()
    # except Exception as ex:
    #     print("Error in websocket is: ", ex)
    # finally:
    #     await websocket.close()