import requests
import datetime
import time
import csv
import os

URL_PORTAL = "https://portalccs.sjc.sp.gov.br/"
INTERVALO_SEGUNDOS = 5  # 300 segundos = 5 minutos
NOME_ARQUIVO_LOG = "stability_log.csv"

def verificar_portal():
    """Verifica o status do portal e retorna 'UP' ou 'DOWN'."""
    try:
        # O timeout é importante para não deixar o script travado
        response = requests.get(URL_PORTAL, timeout=10)
        # Consideramos 'UP' qualquer status de sucesso (2xx)
        if 200 <= response.status_code < 300:
            return 'UP'
        else:
            # Retorna o status code para análise posterior
            return f'DOWN_{response.status_code}'
    except requests.exceptions.RequestException as e:
        # Se ocorrer qualquer erro de conexão, consideramos 'DOWN'
        print(f"Erro de conexão: {e}")
        return 'DOWN_CONNECTION_ERROR'

def salvar_log(status):
    """Salva o resultado da verificação no arquivo CSV."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Verifica se o arquivo precisa de cabeçalho
    arquivo_existe = os.path.exists(NOME_ARQUIVO_LOG)
    
    with open(NOME_ARQUIVO_LOG, 'a', newline='') as file:
        writer = csv.writer(file)
        if not arquivo_existe:
            writer.writerow(['timestamp', 'status'])  # Escreve o cabeçalho
        
        writer.writerow([timestamp, status])
    
    print(f"[{timestamp}] Status: {status} - Log salvo.")

if __name__ == "__main__":
    print("Iniciando monitoramento de estabilidade...")
    while True:
        status_atual = verificar_portal()
        salvar_log(status_atual)
        time.sleep(INTERVALO_SEGUNDOS)