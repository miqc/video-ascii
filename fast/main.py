# main.py
import asyncio
import json
import time
import datetime
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import requests

# --- NOVO: Configuração do Banco de Dados com SQLAlchemy ---
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "sqlite:///./monitor.db"  # Isso vai criar um arquivo monitor.db
Base = declarative_base()

# Modelo da nossa tabela no banco de dados
class StatusCheck(Base):
    __tablename__ = "status_checks"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String)
    latency = Column(Float)
    status_code = Column(Integer, nullable=True)

# Configuração para se conectar ao banco
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine) # Cria a tabela se ela não existir
# --- FIM DA CONFIGURAÇÃO DO BD ---


# --- Configuração do App e do Portal ---
URL_PORTAL = "https://portalccs.sjc.sp.gov.br/"
CHECK_INTERVAL_SECONDS = 5
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def status_generator(request: Request):
    db = SessionLocal() # Cria uma sessão com o banco
    try:
        while True:
            if await request.is_disconnected():
                print("Cliente desconectado.")
                break

            status_data = {}
            try:
                start_time = time.monotonic()
                response = requests.get(URL_PORTAL, timeout=10)
                end_time = time.monotonic()
                latency = int((end_time - start_time) * 1000)
                
                status_data = {
                    "status": "UP" if 200 <= response.status_code < 300 else "DOWN",
                    "statusCode": response.status_code,
                    "latency": latency,
                    "timestamp": datetime.datetime.now().isoformat()
                }

            except requests.RequestException as e:
                status_data = {
                    "status": "DOWN",
                    "statusCode": None,
                    "latency": -1,
                    "error": "Erro de Conexão",
                    "timestamp": datetime.datetime.now().isoformat()
                }
            
            # --- NOVO: Salva o resultado no banco de dados ---
            check_record = StatusCheck(
                status=status_data['status'],
                latency=status_data['latency'],
                status_code=status_data.get('statusCode')
            )
            db.add(check_record)
            db.commit()
            # --- FIM DO SALVAMENTO ---

            yield f"data: {json.dumps(status_data)}\n\n"
            await asyncio.sleep(CHECK_INTERVAL_SECONDS)
    finally:
        db.close() # Fecha a sessão com o banco ao final


# --- NOVO: Rota para buscar dados históricos ---
@app.get("/historical-data/{period}")
async def get_historical_data(period: str):
    db = SessionLocal()
    try:
        # Calcula o tempo inicial baseado no período solicitado
        if period == "TDY": # Today (Hoje)
            start_time = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "12H":
            start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=12)
        elif period == "24H":
            start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
        else:
            # Padrão para 12 horas se o período for inválido
            start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=12)

        # Consulta o banco de dados
        query_results = db.query(StatusCheck).filter(StatusCheck.timestamp >= start_time).order_by(StatusCheck.timestamp.asc()).all()
        
        # Formata os resultados para o frontend
        results = [
            {"timestamp": r.timestamp.isoformat(), "latency": r.latency} for r in query_results
        ]
        return results
    finally:
        db.close()


@app.get("/status-stream")
async def stream_status(request: Request):
    return StreamingResponse(status_generator(request), media_type="text/event-stream")