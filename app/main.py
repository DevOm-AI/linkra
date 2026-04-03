from fastapi import FastAPI
from app.routes import links

app = FastAPI(title="Linkra API")

# Include our routes
app.include_router(links.router)

@app.get("/")
async def health_check():
    return {"status": "Linkra is live"}