# Lista Telefônica - RN Tintas

A Lista Telefônica agora fica dentro do FOCO-OS: https://rntintas.foco-os.com/lista-telefonica/

Este repositório não guarda mais a lista. O GitHub Pages (pasta `docs/` da `main`) serve apenas um
aviso com o botão para abrir a Lista no FOCO-OS e um tutorial animado que ensina a salvar o FOCO-OS
nos favoritos do Chrome. O app desktop (`desktop/app.py`) abre essa mesma página, então os
computadores que já têm o app instalado passam a mostrar o aviso sem precisar reinstalar nada.

## Estrutura

- `docs/index.html` — o aviso. Não usa CDN: fontes, imagens e o GSAP ficam em `docs/tutorial/assets/`.
- `docs/tutorial/index.html` — o tutorial, uma composição HyperFrames (GSAP) de 22,5 s em 1600×1000.
  A página carrega esse arquivo num iframe e avança a timeline ao vivo, sincronizando os 4 passos.
  A lista que aparece dentro do Chrome usa dados inventados.
- `docs/assets/` — logo da RN e a marca do FOCO-OS usadas no topo do aviso.
- `desktop/` — app desktop (pywebview 5.1) que abre a URL do GitHub Pages. O botão do aviso usa
  `target="_blank"`, que o pywebview abre no navegador padrão do computador.

Para ver localmente, sirva a pasta `docs/` (por exemplo `python -m http.server --directory docs`).
Aberto direto como arquivo, o navegador bloqueia o acesso ao iframe e a animação fica parada.
