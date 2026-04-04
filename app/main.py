from fastapi import FastAPI
from app.routes import links, auth

app = FastAPI(title="Linkra API")

# Include our routes
app.include_router(links.router)

app.include_router(auth.router)

@app.get("/")
async def health_check():
    return {"status": "Linkra is live"}