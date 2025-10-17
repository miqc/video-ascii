import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

NOME_ARQUIVO_LOG = "stability_log.csv"

def gerar_grafico_estabilidade():
    try:
        # Carrega os dados do CSV para um DataFrame do Pandas
        df = pd.read_csv(NOME_ARQUIVO_LOG)
    except FileNotFoundError:
        print(f"Erro: Arquivo de log '{NOME_ARQUIVO_LOG}' não encontrado.")
        print("Rode o script 'monitor.py' primeiro para coletar os dados.")
        return

    # --- Processamento dos Dados ---
    # Converte a coluna 'timestamp' para o formato de data/hora
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Cria uma coluna numérica para o status (UP = 1, DOWN = 0)
    # Isso facilita a plotagem do gráfico
    df['status_numeric'] = df['status'].apply(lambda s: 1 if s == 'UP' else 0)

    # --- Cálculo do Uptime ---
    total_verificacoes = len(df)
    verificacoes_up = df['status_numeric'].sum()
    uptime_percentual = (verificacoes_up / total_verificacoes) * 100

    # --- Geração do Gráfico ---
    plt.style.use('seaborn-v0_8-grid') # Estilo visual do gráfico
    fig, ax = plt.subplots(figsize=(15, 7))

    # Plota os dados: tempo no eixo X, status (0 ou 1) no eixo Y
    ax.plot(df['timestamp'], df['status_numeric'], marker='o', linestyle='-', markersize=4, label='Status')

    # Formatação do Gráfico
    ax.set_title(f'Gráfico de Estabilidade do Portal CCS\nUptime: {uptime_percentual:.2f}%', fontsize=16)
    ax.set_xlabel('Data e Hora', fontsize=12)
    ax.set_ylabel('Status (1 = UP, 0 = DOWN)', fontsize=12)
    ax.set_yticks([0, 1]) # Força o eixo Y a mostrar apenas 0 e 1
    ax.set_yticklabels(['DOWN', 'UP'])
    
    # Melhora a formatação das datas no eixo X
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m %H:%M'))
    plt.xticks(rotation=45)
    plt.tight_layout() # Ajusta o layout para não cortar os labels

    # Salva o gráfico em um arquivo de imagem
    nome_grafico = 'grafico_estabilidade.png'
    plt.savefig(nome_grafico)
    
    print(f"Gráfico salvo como '{nome_grafico}'")
    plt.show() # Mostra o gráfico na tela


if __name__ == "__main__":
    gerar_grafico_estabilidade()