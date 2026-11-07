// ===== VESTE AI — script.js =====

// ============================================================
// 1. CLOSET — Carrossel Horizontal de Roupas
// ============================================================

const STORAGE_KEY = 'vesteai_closet';

// Peças padrão pré-carregadas (editorial de moda)
const PECAS_EXEMPLO = [
  {
    nome: 'Calça Jeans',
    categoria: 'Parte de Baixo',
    img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'
  },
  {
    nome: 'Camisa Branca',
    categoria: 'Parte de Cima',
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
  },
  {
    nome: 'Blazer Preto',
    categoria: 'Terceira Peça',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'
  },
  {
    nome: 'Tênis Casual',
    categoria: 'Calçado',
    img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
  },
  {
    nome: 'Vestido Minimalista',
    categoria: 'Peça Única',
    img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'
  },
  {
    nome: 'Sobretudo Bege',
    categoria: 'Terceira Peça',
    img: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80'
  }
];

const carousel = document.getElementById('closet-carousel');
const btnPrev = document.querySelector('.carousel-prev');
const btnNext = document.querySelector('.carousel-next');
const btnAddRoupa = document.getElementById('btn-add-roupa');
const inputAddRoupa = document.getElementById('input-add-roupa');

// --- Dados do closet ---
let closetItems = carregarCloset();

function carregarCloset() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Se houver dados legados sem categoria, reseta para os exemplos atuais
        const temDadoAntigo = parsed.some(p => p.img && (p.img.includes('data:image/svg') || !p.categoria));
        if (temDadoAntigo) {
          localStorage.removeItem(STORAGE_KEY);
          return PECAS_EXEMPLO.map(p => ({ ...p }));
        }
        return parsed;
      }
    }
  } catch (e) { /* ignora erros de parsing */ }
  return PECAS_EXEMPLO.map(p => ({ ...p }));
}

function salvarCloset() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(closetItems));
  } catch (e) {
    console.warn('Não foi possível salvar no localStorage:', e);
  }
}

// Utilitário para normalizar texto (sem acentos e minúsculo)
function normalizar(texto) {
  return texto ? texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

// --- Renderizar carrossel editorial ---
function renderCarrossel() {
  carousel.innerHTML = '';

  if (closetItems.length === 0) {
    carousel.innerHTML = '<p class="closet-empty">Seu closet está vazio. Adicione peças clicando no botão abaixo!</p>';
    return;
  }

  closetItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'roupa-card';
    card.dataset.index = index;
    if (item.selected) card.classList.add('selected');

    const categoria = item.categoria || '';

    card.innerHTML = `
      <img class="roupa-card-bg" src="${item.img}" alt="${item.nome}" loading="lazy">
      <div class="roupa-card-overlay">
        <span class="selo-selecionado">✓ Selecionado</span>
        <button class="btn-remove-roupa" title="Remover peça">&times;</button>
        <div class="roupa-card-label">
          ${categoria ? `<span class="roupa-card-cat">${categoria}</span>` : ''}
          <span class="roupa-card-nome">${item.nome}</span>
        </div>
      </div>
    `;

    // Clique no card → seleciona/deseleciona
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove-roupa')) return;
      item.selected = !item.selected;
      card.classList.toggle('selected', item.selected);
      salvarCloset();
    });

    // Botão remover
    card.querySelector('.btn-remove-roupa').addEventListener('click', (e) => {
      e.stopPropagation();
      closetItems.splice(index, 1);
      salvarCloset();
      renderCarrossel();
    });

    carousel.appendChild(card);
  });
}

// --- Navegação do carrossel ---
btnPrev.addEventListener('click', () => {
  carousel.scrollBy({ left: -280, behavior: 'smooth' });
  pausarAutoScroll();
});

btnNext.addEventListener('click', () => {
  carousel.scrollBy({ left: 280, behavior: 'smooth' });
  pausarAutoScroll();
});

// --- Auto-scroll contínuo do carrossel com retorno suave ---
let autoScrollInterval = null;
let autoScrollPaused = false;
let isResetting = false;

function iniciarAutoScroll() {
  if (autoScrollInterval) return;
  autoScrollInterval = setInterval(() => {
    if (autoScrollPaused || isResetting) return;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (maxScroll <= 0) return;

    // Detecta o fim da arara com margem de segurança de 4px
    if (carousel.scrollLeft >= maxScroll - 4) {
      isResetting = true;
      setTimeout(() => {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => {
          isResetting = false;
        }, 1200);
      }, 1000);
      return;
    }

    carousel.scrollLeft += 1;
  }, 35);
}

function pausarAutoScroll() {
  autoScrollPaused = true;
  clearTimeout(window._autoScrollResumeTimer);
  window._autoScrollResumeTimer = setTimeout(() => {
    autoScrollPaused = false;
  }, 4000);
}

// Pausa o auto-scroll durante interação com mouse ou toque
carousel.addEventListener('mouseenter', () => { autoScrollPaused = true; });
carousel.addEventListener('mouseleave', () => {
  clearTimeout(window._autoScrollResumeTimer);
  window._autoScrollResumeTimer = setTimeout(() => {
    if (!isResetting) autoScrollPaused = false;
  }, 1500);
});
carousel.addEventListener('touchstart', () => { pausarAutoScroll(); }, { passive: true });
carousel.addEventListener('touchend', () => { pausarAutoScroll(); }, { passive: true });

// Inicia o auto-scroll suavemente
setTimeout(iniciarAutoScroll, 1500);

// --- Adicionar roupas (câmera / galeria) ---
btnAddRoupa.addEventListener('click', () => {
  inputAddRoupa.click();
});

inputAddRoupa.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    comprimirImagem(file, (base64) => {
      const nome = prompt('Nome da peça (ex: Vestido Preto):', file.name.replace(/\.[^.]+$/, '')) || 'Peça Nova';
      const categoria = prompt('Categoria (ex: Parte de Cima, Calçado, Terceira Peça):', '') || '';
      closetItems.push({ nome, categoria, img: base64, selected: false });
      salvarCloset();
      renderCarrossel();
    });
  });

  inputAddRoupa.value = '';
});

// --- Compressão de imagem via <canvas> (max 300px) ---
function comprimirImagem(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 300;
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      } else {
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(base64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Inicializar carrossel
renderCarrossel();

// ============================================================
// 2. WIDGET FLUTUANTE — CHAT DA BIA
// ============================================================

const biaFab = document.getElementById('bia-fab');
const biaChatWindow = document.getElementById('bia-chat-window');
const biaChatClose = document.getElementById('bia-chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Toggle abrir/fechar chat flutuante
biaFab.addEventListener('click', () => {
  biaChatWindow.classList.toggle('hidden');
  if (!biaChatWindow.classList.contains('hidden')) {
    chatInput.focus();
  }
});

biaChatClose.addEventListener('click', () => {
  biaChatWindow.classList.add('hidden');
});

// ============================================================
// 3. ASSISTENTE BIA — INTEGRAÇÃO GEMINI & GUARDA-ROUPA VIRTUAL
// ============================================================

// Chave de API do Gemini (obtida via URL param, localStorage ou chave padrão decodificada)
const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42SUtyQmRjVGZyX0xkR3loaHdSWjlmdzZXbHJBdEdPcW5wckdJVEpGWE5ULWc=';

function obterChaveGemini() {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get('gemini_key');
      if (urlKey) {
        localStorage.setItem('vesteai_gemini_key', urlKey);
        return urlKey;
      }
      const localKey = localStorage.getItem('vesteai_gemini_key');
      if (localKey) return localKey;
    }
  } catch (e) {}
  return typeof atob === 'function' ? atob(DEFAULT_KEY_B64) : '';
}

// Histórico de conversa mantido durante a sessão
let chatHistory = [];

// Obter peças selecionadas no carrossel
function getPecasSelecionadas() {
  return closetItems.filter(item => item.selected);
}

// Formatar o inventário do guarda-roupa virtual para o Gemini
function gerarContextoGuardaRoupa() {
  if (!closetItems || closetItems.length === 0) {
    return 'O usuário ainda não possui peças cadastradas no guarda-roupa virtual.';
  }

  const linhas = closetItems.map((item, idx) => {
    const sel = item.selected ? ' ★ [SELECIONADA NO CARROSSEL PELO USUÁRIO]' : '';
    const cat = item.categoria ? ` [Categoria: ${item.categoria}]` : '';
    return `${idx + 1}. "${item.nome}"${cat}${sel}`;
  });

  const selecionadas = getPecasSelecionadas();
  let avisoDestaque = '';
  if (selecionadas.length > 0) {
    avisoDestaque = `\n\nATENÇÃO ESPECIAL: O usuário marcou com destaque no carrossel as seguintes peças: ${selecionadas.map(p => `"${p.nome}"`).join(', ')}. Use-as prioritariamente no look!`;
  }

  return `PEÇAS DO GUARDA-ROUPA VIRTUAL DO USUÁRIO:\n${linhas.join('\n')}${avisoDestaque}`;
}

// Prompt de Sistema da Stylist Bia com Persona e Contexto do Veste AI
function gerarSystemPrompt() {
  const inventario = gerarContextoGuardaRoupa();

  return `Você é a Bia, Personal Stylist inteligente, elegante, calorosa, moderna e Guia de Experiência Oficial do Veste AI.
Sua missão é tripla:
1. Atuar como consultora de estilo pessoal e montar combinações de looks incríveis, harmoniosas e elegantes.
2. Auxiliar nas dúvidas sobre os produtos e planos do site e oferecer suporte na navegação.
3. Manter-se estritamente fiel ao tema de moda, roupas, estilo pessoal e ao ecossistema do Veste AI.

${inventario}

CONHECIMENTO COMPLETO DOS PRODUTOS & PACOTES DO SITE:
• Look Express (R$ 14,90): Produto digital focado em evento único. Entrega 5 combinações completas geradas sob medida com paleta de cores ideal para a ocasião.
• Closet Inteligente Pro (R$ 29,90/mês): Nossa assinatura mais popular. Dá acesso a guarda-roupa virtual ilimitado, sugestões diárias inteligentes baseadas no clima e consultoria de estilo 24h com você (Bia).
• Guia Armário Cápsula (R$ 49,90): Pagamento único. E-book interativo com 30 looks versáteis montados com apenas 12 peças básicas essenciais, além de análise completa de estilo.

ESTRUTURA E NAVEGAÇÃO DO SITE (SUPORTE AO VISITANTE):
• Início (#inicio): Apresentação da plataforma e proposta de valor.
• Meu Closet (#closet): Carrossel horizontal com as peças do guarda-roupa do usuário. Ao clicar numa peça, ela fica selecionada (com borda destacada e estrela) como peça central do look.
• Botão "Montar guarda-roupa virtual": Localizado na seção #closet, abre a câmera ou galeria do dispositivo para adicionar fotos de roupas reais.
• Benefícios (#beneficios): Apresenta os diferenciais do Veste AI (Guarda-Roupa Inteligente, Stylist Bia 24h, Economia Real e Cores & Harmonização).
• Planos (#planos): Onde o usuário adquire ou assina os pacotes digitais.
• Cadastro (#cadastro): Formulário de perfil de estilo que presenteia o usuário com 1 Look VIP gratuito.
Sempre que for útil, indique ao visitante onde clicar ou rolar para encontrar o que procura no site.

DIRETRIZES PARA RECOMENDAÇÃO DE LOOKS:
1. Ao sugerir ou montar combinações, priorize expressamente as peças do guarda-roupa virtual listadas acima.
2. Se o usuário marcou peças com destaque no carrossel, use-as obrigatoriamente como ponto central do visual.
3. Se faltar algum calçado ou acessório que não esteja cadastrado, recomende com simpatia com o que complementar.
4. Estruture sua resposta de consultoria editorial com elegância:
   ✦ Look Recomendado (cite os nomes exatos das peças do guarda-roupa utilizadas)
   ✦ Calçados & Complementos
   ✦ Dica de Ouro da Bia (truque de styling, paleta cromática ou ocasião)
5. OBRIGATÓRIO NO FINAL DO LOOK: Inclua na última linha técnica da resposta a tag discreta:
   [PEÇAS_LOOK: Nome da Peça 1, Nome da Peça 2]
   (com os nomes exatos das peças do armário usadas. Se nenhuma peça do closet foi usada ou se a mensagem for apenas suporte/dúvidas, coloque [PEÇAS_LOOK: nenhuma]).

DIRETRIZ DE BLINDAGEM E ALINHAMENTO DE CONTEXTO:
Se o visitante fizer perguntas que fujam totalmente do tema do site (como receitas culinárias, política, programação, esportes alheios, notícias gerais ou fofocas), recuse com delicadeza, muito charme e elegância de personal stylist. Explique com simpatia que seu foco exclusivo é moda, estilo e suporte ao Veste AI, e convide-o a montar um look ou conhecer nossos recursos.`;
}

// Chamada à API do Google Gemini (gemini-2.5-flash) com histórico conversacional
async function consultarGemini(mensagemUsuario) {
  const apiKey = obterChaveGemini();
  const systemPrompt = gerarSystemPrompt();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: mensagemUsuario }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errTexto = await response.text();
      console.error(`[Gemini API] Erro HTTP ${response.status}:`, errTexto);
      throw new Error(`Status ${response.status}: ${errTexto}`);
    }

    const data = await response.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      throw new Error('Conteúdo vazio retornado pelo Gemini');
    }

    // Salva o histórico de turnos para conversas contínuas
    chatHistory.push({ role: 'user', parts: [{ text: mensagemUsuario }] });
    chatHistory.push({ role: 'model', parts: [{ text: texto }] });
    if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);

    return texto;
  } catch (err) {
    console.warn('API Gemini indisponível. Acionando motor dinâmico de contingência:', err);
    return responderBiaFallback(mensagemUsuario);
  }
}

// Extrai quais peças do guarda-roupa virtual foram sugeridas no look
function extrairPecasUsadas(textoResposta) {
  const pecasEncontradas = [];

  // 1. Tenta extrair a tag técnica [PEÇAS_LOOK: ...]
  const matchTag = textoResposta.match(/\[PE[ÇC]AS_LOOK:\s*([^\]]+)\]/i);
  if (matchTag && matchTag[1]) {
    const nomes = matchTag[1].split(',').map(s => normalizar(s.trim()));
    closetItems.forEach(item => {
      const nomeNorm = normalizar(item.nome);
      if (nomes.some(n => n === nomeNorm || nomeNorm.includes(n) || n.includes(nomeNorm))) {
        if (!pecasEncontradas.includes(item)) pecasEncontradas.push(item);
      }
    });
  }

  // 2. Busca por menção direta no texto
  const textoNorm = normalizar(textoResposta);
  closetItems.forEach(item => {
    const nomeNorm = normalizar(item.nome);
    if (textoNorm.includes(nomeNorm) && !pecasEncontradas.includes(item)) {
      pecasEncontradas.push(item);
    }
  });

  // 3. Se nenhuma foi encontrada mas o usuário tinha itens selecionados, inclui os selecionados
  if (pecasEncontradas.length === 0) {
    return getPecasSelecionadas();
  }

  return pecasEncontradas;
}

// Formatar markdown básico (negrito e itálico)
function formatarMarkdown(txt) {
  return txt
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// ============================================================
// MOTOR DE CONTINGÊNCIA (FALLBACK LOCAL DINÂMICO)
// ============================================================

const RESPOSTA_PACOTES = `✦ Conheça os Produtos Digitais & Pacotes do Veste AI:

• Look Express (R$ 14,90): 5 combinações completas sob medida para um evento único com paleta de cores ideal.
• Closet Inteligente Pro (R$ 29,90/mês): Nossa assinatura mais popular! Guarda-roupa virtual ilimitado, sugestões diárias por clima e consultoria 24h comigo (Bia).
• Guia Armário Cápsula (R$ 49,90): E-book interativo com 30 looks usando apenas 12 peças básicas essenciais.

Você pode assinar ou adquirir na seção Planos (#planos) do site!`;

function responderBiaFallback(texto) {
  const t = normalizar(texto);

  // 1. Dúvidas sobre produtos e planos
  if (/\b(preco|precos|quanto|valor|valores|pacote|pacotes|plano|planos|assinar|assinatura|comprar|guia|express|pro)\b/.test(t)) {
    return RESPOSTA_PACOTES;
  }

  // 2. Dúvidas sobre o funcionamento do site e navegação
  if (/\b(como funciona|como usar|adicionar|roupa|roupas|foto|fotos|carrossel|upload|site|ajuda|suporte|navegar|onde clico)\b/.test(t)) {
    return `O Veste AI foi pensado para ser prático e intuitivo! ✨

1. **Meu Closet (#closet)**: Navegue pelo carrossel para ver suas roupas. Toque em qualquer peça para destacá-la com estrela como peça-chave do look.
2. **Montar guarda-roupa virtual**: Clique no botão laranja na seção Meu Closet para enviar fotos reais das suas roupas pela câmera ou galeria.
3. **Benefícios (#beneficios)**: Descubra todas as vantagens da moda inteligente e economia real.
4. **Planos (#planos)**: Escolha seu pacote ou assinatura de consultoria contínua.
5. **Cadastro (#cadastro)**: Preencha seu perfil de estilo e ganhe na hora 1 Look VIP gratuito!

Quer montar um look agora? Me diga para qual evento você vai!`;
  }

  // 3. Blindagem de contexto: recusa educada de assuntos fora do tema
  if (/\b(futebol|jogo|receita|bolo|politica|programacao|codigo|python|java|javascript|filme|musica|tempo hoje|previsao)\b/.test(t) && !/\b(look|roupa|vestir|estilo|moda)\b/.test(t)) {
    return `Como sua Personal Stylist e Guia Oficial no Veste AI, meu foco exclusivo é transformar seu visual, seu guarda-roupa e te ajudar a aproveitar ao máximo o nosso site! ✨\n\nQue tal falarmos sobre um look elegante para o seu dia ou tirar alguma dúvida sobre o Veste AI?`;
  }

  // 4. Saudações
  if (/\b(oi|ola|bom dia|boa tarde|boa noite)\b/.test(t)) {
    return `Olá! Sou a Bia, sua Personal Stylist e Guia Oficial do Veste AI ✨\nTenho acesso ao seu guarda-roupa virtual com ${closetItems.length} peças cadastradas. Posso te ajudar com dúvidas sobre o site, nossos planos ou montar a combinação ideal para você. Para onde você vai hoje?`;
  }

  // 5. Utiliza as peças selecionadas pelo usuário ou as peças disponíveis no closet
  const selecionadas = getPecasSelecionadas();
  const pecasUsar = selecionadas.length > 0 ? selecionadas : closetItems.slice(0, 3);
  const nomesPecas = pecasUsar.map(p => p.nome);

  if (nomesPecas.length > 0) {
    return `✦ Look Recomendado: Recomendo combinar ${nomesPecas.join(' + ')}.\n✦ Calçados & Complementos: Use um calçado em tom neutro para manter a sofisticação.\n✦ Dica de Ouro da Bia: Dobre as mangas e adicione acessórios delicados para dar charme.\n\n[PEÇAS_LOOK: ${nomesPecas.join(', ')}]`;
  }

  return 'Olá! Sou a Bia, sua Personal Stylist no Veste AI. Posso criar uma combinação sob medida para você ou te orientar no site. Como posso te ajudar hoje?';
}

// --- Envio de mensagens com IA Gemini ---
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;

  // Mensagem do usuário
  addMsg(texto, 'user');
  chatInput.value = '';
  chatInput.disabled = true;

  // Indicador animado de digitação
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg bot typing-msg';
  typingDiv.innerHTML = '<span class="typing-dots">✦ Bia está analisando seu guarda-roupa...</span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const respostaBruta = await consultarGemini(texto);
    typingDiv.remove();

    // Extrai as peças sugeridas do closet
    const pecasUsadas = extrairPecasUsadas(respostaBruta);

    // Remove a tag técnica do balão de texto
    const textoLimpo = respostaBruta.replace(/\[PE[ÇC]AS_LOOK:[^\]]*\]/gi, '').trim();

    const msgDiv = addMsg(textoLimpo, 'bot', true);

    // Se houver peças identificadas, renderiza as miniaturas
    if (pecasUsadas.length > 0) {
      const thumbsContainer = document.createElement('div');
      thumbsContainer.className = 'msg-pecas-container';
      thumbsContainer.innerHTML = '<span class="msg-pecas-title">Peças do seu guarda-roupa:</span>';

      const thumbsGrid = document.createElement('div');
      thumbsGrid.className = 'msg-pecas-thumbs';

      pecasUsadas.forEach(item => {
        const card = document.createElement('div');
        card.className = 'msg-peca-card';
        card.innerHTML = `
          <img src="${item.img}" alt="${item.nome}" title="${item.nome}">
          <span>${item.nome}</span>
        `;
        thumbsGrid.appendChild(card);
      });

      thumbsContainer.appendChild(thumbsGrid);
      msgDiv.appendChild(thumbsContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  } catch (err) {
    console.error('Erro no fluxo do chat:', err);
    typingDiv.remove();
    addMsg('Desculpe, tive um contratempo momentâneo. Me diga para qual evento você vai que monto seu look com o seu guarda-roupa!', 'bot');
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

function addMsg(text, cls, isMarkdown = false) {
  const div = document.createElement('div');
  div.className = `msg ${cls}`;
  if (isMarkdown) {
    div.innerHTML = formatarMarkdown(text);
  } else {
    div.textContent = text;
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// ============================================================
// 4. FORMULÁRIO DE CADASTRO
// ============================================================

const signupForm = document.getElementById('signup-form');
const signupMsg = document.getElementById('signup-msg');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = new FormData(signupForm);
  const nome = dados.get('nome');
  const estilo = dados.get('estilo');

  signupMsg.textContent = `🎉 Perfeito, ${nome}! Seu perfil "${estilo}" foi salvo. Em breve você receberá seu look VIP gratuito por e-mail!`;
  signupMsg.classList.remove('hidden');
  signupForm.reset();
  setTimeout(() => signupMsg.classList.add('hidden'), 8000);
});

// ============================================================
// 5. CABEÇALHO & MENU MOBILE
// ============================================================

const header = document.getElementById('header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

function atualizarHeader() {
  header.classList.toggle('scrolled', window.scrollY > 30);
}

window.addEventListener('scroll', atualizarHeader, { passive: true });
atualizarHeader();

// Menu mobile toggle
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Fechar menu mobile ao clicar em um link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Fechar menu mobile ao clicar fora
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      navMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
