import time
import requests
import datetime
from collections import deque

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static
from textual.containers import Container
from textual.reactive import reactive
from textual.worker import work

URL_PORTAL = "https://portalccs.sjc.sp.gov.br/"
CHECK_INTERVAL = 5 # Verifica a cada 5 segundos para um efeito mais "real-time"

class MonitorDisplay(Static):
    """Um widget para mostrar um valor e um título."""
    def __init__(self, title, value, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.value = value

    def render(self) -> str:
        return f"[b]{self.title}[/b]\n{self.value}"

class RealTimeMonitorApp(App):
    """Uma aplicação TUI para monitorar a saúde de um site."""

    CSS_PATH = "monitor.css"
    BINDINGS = [("d", "toggle_dark", "Alternar Modo Escuro")]

    # Reativos para atualização automática da UI
    current_status = reactive("PENDING...")
    current_latency = reactive("--- ms")
    last_check_time = reactive("Nunca")
    uptime_percentage = reactive("100.00%")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.history = deque(maxlen=100) # Armazena os últimos 100 status

    def compose(self) -> ComposeResult:
        """Cria os widgets da aplicação."""
        yield Header(name="🖥️ Monitor de Status do Portal CCS")
        with Container(id="metrics-grid"):
            yield MonitorDisplay("STATUS ATUAL", self.current_status, id="status")
            yield MonitorDisplay("LATÊNCIA ATUAL", self.current_latency, id="latency")
            yield MonitorDisplay("UPTIME (últimos 100)", self.uptime_percentage, id="uptime")
            yield MonitorDisplay("ÚLTIMA VERIFICAÇÃO", self.last_check_time, id="last_check")
        yield Footer()

    def on_mount(self) -> None:
        """Chamado quando a app é montada. Inicia o worker de checagem."""
        self.run_check()

    # O decorator @work executa esta função em uma thread separada,
    # para não travar a interface do usuário.
    @work(thread=True)
    def run_check(self) -> None:
        while True:
            try:
                start_time = time.monotonic()
                response = requests.get(URL_PORTAL, timeout=10)
                end_time = time.monotonic()

                latency = int((end_time - start_time) * 1000)
                
                if 200 <= response.status_code < 300:
                    status = "UP"
                    self.history.append(1) # 1 para UP
                else:
                    status = f"DOWN ({response.status_code})"
                    self.history.append(0) # 0 para DOWN
                
                # Atualiza a UI a partir da thread do worker
                self.call_soon(self.update_display, status, latency)

            except requests.RequestException:
                status = "DOWN (Erro de Conexão)"
                latency = -1
                self.history.append(0)
                self.call_soon(self.update_display, status, latency)
            
            time.sleep(CHECK_INTERVAL)

    def update_display(self, status: str, latency: int) -> None:
        """Atualiza os widgets na thread principal da UI."""
        self.last_check_time = datetime.datetime.now().strftime('%H:%M:%S')

        status_widget = self.query_one("#status", MonitorDisplay)
        status_widget.value = status
        # Muda a cor baseada no status
        status_widget.styles.background = "green" if status == "UP" else "red"
        
        latency_widget = self.query_one("#latency", MonitorDisplay)
        latency_widget.value = f"{latency} ms" if latency != -1 else "--- ms"

        # Calcula uptime
        if self.history:
            uptime = (sum(self.history) / len(self.history)) * 100
            self.query_one("#uptime", MonitorDisplay).value = f"{uptime:.2f}%"

    def action_toggle_dark(self) -> None:
        self.dark = not self.dark

if __name__ == "__main__":
    app = RealTimeMonitorApp()
    app.run()