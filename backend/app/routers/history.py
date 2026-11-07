from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.requests import HistoryItem
from app.models.history import history_store

router = APIRouter(prefix="/api", tags=["History Management"])


@router.get("/history", response_model=List[HistoryItem])
async def get_history():
    """
    Retrieve saved summary history items safely without throwing HTTP 500 crashes.
    """
    try:
        items = history_store.get_all()
        return items
    except Exception as e:
        print(f"⚠️ Warning retrieving history: {e}")
        return []


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: str):
    """
    Delete a specific history entry by unique ID.
    """
    try:
        deleted = history_store.delete_by_id(item_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"History item with ID '{item_id}' not found.")
        return {"message": "History item deleted successfully", "id": item_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete history item: {str(e)}")
