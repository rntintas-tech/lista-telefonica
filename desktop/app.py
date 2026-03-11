"""
Lista Telefônica RN Tintas - Versão Desktop
Abre a lista telefônica hospedada no GitHub Pages em janela nativa
"""
import webview

def main():
    # Cria janela apontando pro GitHub Pages
    window = webview.create_window(
        title='Lista Telefônica - RN Tintas',
        url='https://rntintas-tech.github.io/lista-telefonica/',
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
