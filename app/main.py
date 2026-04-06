from fastapi import FastAPI
from app.routes import links, auth

from fastapi.middleware.cors import CORSMiddleware
from app.routes import analytics
from app.models import User, URL, Click

from app.database import engine, Base

from fastapi.responses import JSONResponse
from json import JSONEncoder

from app.utils.geo import get_geo_info



Base.metadata.create_all(bind=engine)

class BigIntEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, int) and obj > 9007199254740991:
            return str(obj)
        return super().default(obj)


app = FastAPI(title="Linkra API", default_response_class=JSONResponse)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Add both!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include our routes    

app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

app.include_router(links.router)

app.include_router(auth.router)


app.include_router(links.router, prefix="/links", tags=["links"])




@app.get("/")
async def health_check():
    return {"status": "Linkra is live"}