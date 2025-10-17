import cv2
from PIL import Image
import os
import time

VIDEO_PATH = '1.mp4' 
BLOCK_CHARS = ' `.-":;!*#%@'

def get_terminal_size():
    """Obtém o tamanho do terminal (colunas, linhas)."""
    try:
        return os.get_terminal_size()
    except OSError:
        return 80, 24

def frame_to_ascii(frame, width, height):
    """Converte um quadro de vídeo para arte ASCII com contraste melhorado e blocos."""
    try:
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        enhanced_gray_frame = cv2.equalizeHist(gray_frame)

        image = Image.fromarray(enhanced_gray_frame)
        
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        
        pixels = image.getdata()
        
        ascii_str = "".join([BLOCK_CHARS[int(pixel * (len(BLOCK_CHARS) - 1) / 255)] for pixel in pixels])
        
        ascii_img_lines = [ascii_str[i:i + width] for i in range(0, len(ascii_str), width)]
        
        return "\n".join(ascii_img_lines)

    except Exception:
        return ""

def main():
    if not os.path.exists(VIDEO_PATH):
        print(f"ERRO: Vídeo '{VIDEO_PATH}' não encontrado.")
        return

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print("ERRO CRÍTICO: OpenCV não conseguiu abrir o vídeo.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    delay = 1 / fps if fps > 0 else 0.033
    frame_number = 0

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            frame_number += 1
            term_width, term_height = get_terminal_size()
            ascii_height = term_height - 2
            
            ascii_frame = frame_to_ascii(frame, term_width, ascii_height)
            
            status_bar = f" Frame: {frame_number}/{total_frames} | Terminal: {term_width}x{term_height} | FPS: {fps:.2f} "
            final_output = f"{status_bar}\n{ascii_frame}"
            
            print("\033[H" + final_output, end="", flush=True)
            time.sleep(delay)

    except KeyboardInterrupt:
        print("\nReprodução interrompida.")
    finally:
        cap.release()
        os.system('cls' if os.name == 'nt' else 'clear')
        print("Player finalizado.")

if __name__ == '__main__':
    main()