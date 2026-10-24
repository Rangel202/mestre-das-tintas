# Mestre das Tintas — site

Site de uma página, feito primeiro para celular, com animações (GSAP) e foco em levar o visitante ao WhatsApp.

## Estrutura

```
index.html            → todo o conteúdo (textos, seções, fotos)
css/style.css         → visual (cores da marca no topo do arquivo)
js/main.js            → interações e animações + CONFIG (número do WhatsApp)
assets/brand/         → logo vetorial (mestre-icone.svg), favicon e logo original
site.webmanifest      → ícone/nome quando salvo na tela inicial do celular
.claude/              → só para pré-visualizar no computador (não precisa subir)
```

## Antes de publicar — o que trocar

Procure por **EDITAR** no `index.html` e no `js/main.js`.

| Onde | O quê |
|---|---|
| `js/main.js` → `CONFIG.whatsapp` | Número do WhatsApp com DDI+DDD, só dígitos (ex.: `5511987654321`). Atualiza todos os 14 botões de uma vez. |
| `index.html` → `tel:+5500000000000` | Telefone para ligação (menu, CTA final e barra fixa). |
| `index.html` → rodapé e menu | Instagram, e-mail, CNPJ, `(00) 00000-0000`. |
| `index.html` → CTA final e FAQ | Horário, cidade/região, formas de pagamento. |
| `index.html` → seção "Por que o Mestre?" | Números reais (`+500 obras`, `10+ anos`). |
| `index.html` → "Depoimentos" | **São exemplos.** Troque por avaliações reais de clientes (Google/WhatsApp). Depoimento inventado é propaganda enganosa. |
| `assets/obras/` | Fotos reais dos serviços (hero, antes/depois, serviços e galeria). Cada foto tem duas versões: `-lg.jpg` (1080 px) e `-sm.jpg` (640 px, para celular). O card "Texturas" ainda usa foto do Unsplash. |
| `index.html` → `<head>` | `og:url` e o bloco `application/ld+json` (SEO local no Google). |

## Como publicar

O site está no ar em **https://mestre-das-tintas-mu.vercel.app** (Vercel, time Rangel LTDA).

O repositório [github.com/Rangel202/mestre-das-tintas](https://github.com/Rangel202/mestre-das-tintas) está ligado ao Vercel:
**todo commit enviado para a branch `main` publica o site sozinho** em cerca de 1 minuto.

```bash
git add -A
git commit -m "Troca WhatsApp e fotos reais"
git push
```

Para usar um domínio próprio (ex.: `mestredastintas.com.br`): painel do Vercel → projeto `mestre-das-tintas` → Settings → Domains.

Outras opções, se um dia precisar trocar de hospedagem:
- **Netlify:** [app.netlify.com/drop](https://app.netlify.com/drop) → arraste a pasta inteira.
- **Hospedagem comum (Hostinger, HostGator…):** envie `index.html`, `css/`, `js/`, `assets/` e `site.webmanifest` para a pasta `public_html`.

## Recursos do site

- Preloader com o "M" da logo se enchendo de tinta.
- Hero: um rolo de pintura atravessa a tela e transforma a foto de cinza em colorida.
- Fitas-crepe animadas que aceleram conforme a rolagem.
- Antes × Depois arrastável (o "pegador" é um rolo).
- Serviços em carrossel com mensagem pronta no WhatsApp para cada serviço.
- Simulador de cores: toque numa cor e o rolo repinta a sala; o botão envia a cor escolhida.
- Galeria de obras em pilha de cards para arrastar com o dedo.
- Escorridos de tinta entre as seções, contadores, FAQ animado, barra fixa de WhatsApp.
- Vibração leve ao tocar (Android), respeita "reduzir movimento" do sistema e funciona sem as animações se o GSAP não carregar.
