"""
Lista Telefônica RN Tintas - Versão OFFLINE
Carrega os arquivos HTML/CSS/JS localmente (não precisa internet)
"""
import webview
import os

def main():
    # Pega o diretório onde está o script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Caminho do index.html
    html_path = os.path.join(base_dir, 'index.html')
    
    # Cria janela carregando arquivo local
    window = webview.create_window(
        title='Lista Telefônica - RN Tintas',
        url=html_path,
        width=1200,
        height=800,
        resizable=True,
        fullscreen=False,
        min_size=(800, 600)
    )
    
    # Inicia a aplicação
    webview.start()

if __name__ == '__main__':
    main()
