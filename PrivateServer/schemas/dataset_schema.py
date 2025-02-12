# from pydantic import BaseModel
# from typing import List, Optional

# class ColumnStats(BaseModel):
#     name: str
#     type: str
#     nullCount: int
#     uniqueCount: Optional[int] = None
#     mean: Optional[float] = None
#     stddev: Optional[float] = None
#     min: Optional[float] = None
#     max: Optional[float] = None

# class DatasetOverview(BaseModel):
#     numRows: int
#     numColumns: int
#     schema: List[dict]
#     columnStats: List[ColumnStats]

# class DatasetDetails(BaseModel):
#     file_name: str
#     details: dict