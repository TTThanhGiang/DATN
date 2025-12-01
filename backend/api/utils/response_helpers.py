# response_helpers.py

from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse

def success_response(
    data: Any,
    message: str = "Thành công.",
    status_code: int = 200
) -> JSONResponse:
    """
    Trả về JSONResponse cho phản hồi thành công.
    
    Args:
        data: Dữ liệu trả về.
        message: Thông điệp kèm theo.
        status_code: HTTP status code.
        
    Returns:
        JSONResponse
    """
    content = {
        "status": status_code,
        "success": True,
        "message": message,
        "data": data,
        "error": None
    }
    return JSONResponse(content=content, status_code=status_code)


def error_response(
    message: str,
    status_code: int = 400,
    error_details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Trả về JSONResponse cho phản hồi lỗi.
    
    Args:
        message: Thông điệp lỗi.
        status_code: HTTP status code.
        error_details: Thông tin chi tiết về lỗi (optional).
        
    Returns:
        JSONResponse
    """
    content = {
        "status": status_code,
        "success": False,
        "message": message,
        "data": None,
        "error": error_details or {"code": f"HTTP_{status_code}"}
    }
    return JSONResponse(content=content, status_code=status_code)
