import os
from hdfs import InsecureClient
from dotenv import load_dotenv

load_dotenv()

HDFS_URL = os.getenv("HDFS_URL")
HADOOP_USER_NAME = os.getenv("HADOOP_USER_NAME")
# LOCAL_RAW_DATASETS_DIR = os.getenv("LOCAL_RAW_DATASETS_DIR")
# LOCAL_PROCESSED_DATASETS_DIR = os.getenv("LOCAL_PROCESSED_DATASETS_DIR")
HDFS_RAW_DATASETS_DIR = os.getenv("HDFS_RAW_DATASETS_DIR")
HDFS_PROCESSED_DATASETS_DIR = os.getenv("HDFS_PROCESSED_DATASETS_DIR")
RECENTLY_UPLOADED_DATASETS_DIR = os.getenv("RECENTLY_UPLOADED_DATASETS_DIR")
"""
NOTE: HDFS session is created and destroyed on demand, so there is no session created when __init__ method is called.
"""
class HDFSServiceManager:
    def __init__(self):
        """
        Initialize HDFSServiceManager with basic settings.
        HDFS connection is not persistent and will be established only when required.
        """
        self.buffer = b""
        self.file_name = ""

    def _with_hdfs_client(self, operation):
        """
        Internal utility to manage HDFS connection asynchronously.
        Offloads HDFS operations to a separate thread to avoid blocking the event loop.
        """
        def wrapped_operation():
            client = InsecureClient(HDFS_URL, user=HADOOP_USER_NAME)
            try:
                return operation(client)
            except Exception as e:
                print(f"Error during HDFS operation: {e}")
                raise
            finally:
                client = None  # Explicitly clean up the client

        # Offloading the blocking operation to a thread ...didn't work for some reason
        # return asyncio.to_thread(wrapped_operation)
        return wrapped_operation()

    def delete_file_from_hdfs(self, directory, filename):
        """
        Delete a file from HDFS, don't make this method async (sync nature required for few use cases)
        """
        hdfs_path = os.path.join(directory, filename)
        print(f"Deleting {hdfs_path} from HDFS...")
        def delete(client):
            status = client.delete(hdfs_path,recursive=True)
            if status:
                print(f"Deleted {hdfs_path} from HDFS.")
            else:
                print(f"Failed to delete {hdfs_path} from HDFS.")

        try:
            return self._with_hdfs_client(delete)
        except Exception as e:
            print(f"Error deleting file from HDFS: {e}")
            return None

    async def list_recent_uploads(self):
        def human_readable_size(size_in_bytes):
            """Convert size in bytes to human-readable format (KB, MB, GB, etc.)."""
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if size_in_bytes < 1024.0:
                    return f"{size_in_bytes:.2f} {unit}"
                size_in_bytes /= 1024.0
            return f"{size_in_bytes:.2f} PB"

        def list_files(client):
            result = {'contents': {}, 'error': None}
            try:
                files = client.list(f"/user/{HADOOP_USER_NAME}/{RECENTLY_UPLOADED_DATASETS_DIR}", status=True)
                files = [{"filename": entry[0], "size": human_readable_size(entry[1]["length"])} for entry in files if entry[1]["type"] == "FILE"]
                result['contents'] = {RECENTLY_UPLOADED_DATASETS_DIR: files}
            except Exception as e:
                result['error'] = str(e)
            return result

        return self._with_hdfs_client(list_files)
    
    async def testing_list_all_datasets(self):
        def list_files(client):
            result = {'contents': {}, 'error': None}
            try:
                files = client.list(f"/user/{HADOOP_USER_NAME}/{RECENTLY_UPLOADED_DATASETS_DIR}", status=True)
                result['contents'] = files
            except Exception as e:
                result['error'] = str(e)
            return result

        return self._with_hdfs_client(list_files)


    async def rename_file_or_folder(self,source_path, destination_path):
        """
        Rename a file in HDFS.
        NOTE: If the destination_path already exists and is a directory, the source will be moved into it
        """
        def rename(client):
            client.rename(source_path, destination_path)
            print(f"Renamed {source_path} to {destination_path} in HDFS.")

        try:
            return self._with_hdfs_client(rename)
        except Exception as e:
            print(f"Error renaming file in HDFS: {e}")
            return None
    

    # async def write_to_hdfs(self):
    #     """
    #     Upload the processed Parquet file to HDFS asynchronously.
    #     """
    #     if not self.file_name:
    #         raise ValueError("File name is not set.")
    #     local_path = os.path.join(LOCAL_RAW_DATASETS_DIR, self.file_name)
    #     hdfs_path = os.path.join(HDFS_RAW_DATASETS_DIR, self.file_name)
    #     print(f"Uploading to HDFS: {hdfs_path}")
    #     def upload(client):
    #         """
    #         Perform the actual upload operation synchronously.
    #         """
    #         with open(local_path, "rb") as f:
    #             client.write(hdfs_path, f, overwrite=True)
    #         print(f"Successfully uploaded {self.file_name} to HDFS.")    
    #     self._with_hdfs_client(upload)
    #     os.remove(local_path)  # Remove the local file after upload
    #     return {"message": "Data uploaded to HDFS successfully."}


    # def set_file_name(self, file_name: str):
    #     """
    #     Set the name of the file being processed.
    #     Converts .csv file names to .parquet.
    #     """
    #     self.file_name = file_name.replace(".csv", ".parquet")


    # async def process_chunk(self, chunk: bytes):
    #     """
    #     Append a data chunk to the buffer and flush to a Parquet file if the buffer size exceeds 10MB.
    #     """
    #     self.buffer += chunk
    #     if len(self.buffer) >= 10 * 1024 * 1024:  # Process when buffer > 10MB
    #        self.flush_to_parquet()
    #     return {"message": "Data chunk processed successfully."}


    # async def flush_to_parquet(self):
    #     """
    #     Flush the buffer to a local Parquet file, merging with existing data if the file already exists.
    #     """
    #     if not self.buffer:
    #         return
    #     buffer = self.buffer
    #     self.buffer = b""  # Clear buffer 
    #     def write_parquet():
    #         df = pd.read_csv(io.StringIO(buffer.decode("utf-8")), low_memory=False, on_bad_lines='warn')
    #         # In above we generate a warning for each bad line, bad lne is a line that has too many fields
    #         local_path = os.path.join(LOCAL_RAW_DATASETS_DIR, self.file_name)

    #         if not os.path.exists(local_path):
    #             df.to_parquet(local_path, engine="pyarrow")
    #         else:
    #             existing_df = pd.read_parquet(local_path, engine="pyarrow")
    #             combined_df = pd.concat([existing_df, df], ignore_index=True)
    #             combined_df.to_parquet(local_path, engine="pyarrow")

    #     # asyncio.to_thread(write_parquet)
    #     write_parquet()
    #     return {"message": "Data chunk processed successfully."}


    # async def create_new_dataset(self, file_name, filetype):
    #     """
    #     Create a new dataset in HDFS.
    #     """
    #     if filetype == "csv":
    #         self.set_file_name(file_name)
    #         return {"message": "Dataset creation started..."}
    #     return {"message": "Dataset creation started..."}

    ########## Don't delete ################
    # this method is never used in the current implementation of FedData

    # def list_all_content(self):
    #     """
    #     List files and directories in the specified HDFS directory.
    #     """
    #     def list_files(client):
    #         result = {'contents': {}, 'error': None}
    #         try:
    #             dirs = client.list(f"/user/{HADOOP_USER_NAME}", status=True)
    #             dirs = [entry[0] for entry in dirs if entry[1]["type"] == "DIRECTORY"] #entry[0] is dir name
    #             print("dirs:", dirs)
    #             for entry in dirs:
    #                 try:
    #                     files = client.list(entry, status=True)
    #                     result['contents'][entry] = [file_name[0] for file_name in files if file_name[1]["type"] == "FILE"]
    #                 except Exception as e:
    #                     result['contents'][entry] = [str(e)]
    #         except Exception as e:
    #             result['error'] = str(e)
    #         return result

    #     return self._with_hdfs_client(list_files)

    # def read_file_from_hdfs(self, hdfs_path):
    #     """
    #     Read a file from HDFS and return its content as a string.
    #     """
    #     def read(client):
    #         with client.read(hdfs_path) as reader:
    #             return reader.read().decode("utf-8")

    #     try:
    #         return self._with_hdfs_client(read)
    #     except Exception as e:
    #         print(f"Error reading file from HDFS: {e}")
    #         return None

    # def download_from_hdfs(self, hdfs_path, local_path):
    #     """
    #     Download a file from HDFS to the local filesystem.
    #     """
    #     def download(client):
    #         client.download(hdfs_path, local_path, overwrite=True)
    #         print(f"Downloaded {hdfs_path} to {local_path}")

    #     try:
    #         return self._with_hdfs_client(download)
    #     except Exception as e:
    #         print(f"Error downloading file from HDFS: {e}")
    #         return None
        
# sample response if list a directory is called without filters on response
# {
#   "contents": [
#     [
#       "Maragakis et al DUDE docking scores and vortex properties.parquet",
#       {
#         "accessTime": 1738518372593,
#         "blockSize": 134217728,
#         "childrenNum": 0,
#         "fileId": 16977,
#         "group": "supergroup",
#         "length": 37598383,
#         "modificationTime": 1738518373840,
#         "owner": "prashu",
#         "pathSuffix": "Maragakis et al DUDE docking scores and vortex properties.parquet",
#         "permission": "644",
#         "replication": 1,
#         "storagePolicy": 0,
#         "type": "FILE"
#       }
#     ],
#     [
#       "health.parquet",
#       {
#         "accessTime": 1738514857243,
#         "blockSize": 134217728,
#         "childrenNum": 0,
#         "fileId": 16609,
#         "group": "supergroup",
#         "length": 3365,
#         "modificationTime": 1736325436275,
#         "owner": "prashu",
#         "pathSuffix": "health.parquet",
#         "permission": "644",
#         "replication": 1,
#         "storagePolicy": 0,
#         "type": "FILE"
#       }
#     ]
#   ],
#   "error": null
# }