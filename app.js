/* ========= Norteando — lógica do front-end =========
   - Funciona sozinho em modo demonstrativo (dados de exemplo + localStorage).
   - Para usar uma API real, informe a URL em "Conexão com a API". Contrato:
       GET  {base}/acervo  -> [{ id, titulo, categoria, estado, local, descricao, autor, imagem, criadoEm }]
       POST {base}/acervo  -> cria um item (mesmo formato) e devolve o item criado
   ====================================================== */
(() => {
  'use strict';

  /* ---------- utilitários ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const urlSegura = (u) => {
    try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol) ? x.href : ''; }
    catch { return ''; }
  };

  const store = {
    get(chave, padrao) {
      try { const v = localStorage.getItem('norteando:' + chave); return v ? JSON.parse(v) : padrao; }
      catch { return padrao; }
    },
    set(chave, valor) {
      try { localStorage.setItem('norteando:' + chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
    },
  };

  /* ---------- dados ---------- */
  const CATEGORIAS = {
    musica:      { nome: 'Música e dança',    icone: '🥁', cor: '#c4512f' },
    culinaria:   { nome: 'Culinária',         icone: '🍲', cor: '#b57d0c' },
    artesanato:  { nome: 'Artesanato',        icone: '🏺', cor: '#4b1f5e' },
    festas:      { nome: 'Festas e rituais',  icone: '🎭', cor: '#c23b78' },
    lendas:      { nome: 'Lendas e saberes',  icone: '🌙', cor: '#1f6f8b' },
    povos:       { nome: 'Povos e memórias',  icone: '🌳', cor: '#2e8b62' },
  };

  const SEED = [
    { id: 's01', titulo: 'Carimbó', categoria: 'musica', estado: 'PA', local: 'Salvaterra e Marapanim',
      descricao: 'Ritmo e dança de origem indígena, africana e portuguesa, tocado com tambores curimbós, banjo e maracás. As saias rodadas e o giro dos casais fazem da roda uma festa que atravessa gerações. O carimbó é reconhecido como patrimônio cultural imaterial do Brasil.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-01' },
    { id: 's02', titulo: 'Círio de Nazaré', categoria: 'festas', estado: 'PA', local: 'Belém',
      descricao: 'Uma das maiores procissões católicas do mundo, realizada todo mês de outubro. A romaria atravessa Belém reunindo promessas, cantos e a mesa farta do almoço do Círio, onde se come maniçoba e pato no tucupi.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-02' },
    { id: 's03', titulo: 'Festival de Parintins', categoria: 'festas', estado: 'AM', local: 'Parintins',
      descricao: 'Todo mês de junho, os bois-bumbás Garantido e Caprichoso levam ao Bumbódromo toadas, alegorias gigantes e a presença de lendas e povos da floresta. É a disputa que faz uma cidade inteira vibrar em vermelho e azul.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-03' },
    { id: 's04', titulo: 'Tacacá', categoria: 'culinaria', estado: 'PA', local: 'Belém',
      descricao: 'Caldo quente de tucupi com goma de tapioca, jambu e camarão seco, servido em cuia no fim da tarde. O jambu faz a boca formigar, uma sensação que quem é da região reconhece de longe.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-04' },
    { id: 's05', titulo: 'Cerâmica Marajoara', categoria: 'artesanato', estado: 'PA', local: 'Ilha de Marajó',
      descricao: 'Tradição de mais de mil anos, conhecida pelos grafismos geométricos em vasos, urnas e estatuetas. Hoje, artesãs e artesãos do Marajó retomam esses padrões e mantêm viva uma das artes mais antigas da Amazônia.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-05' },
    { id: 's06', titulo: 'Lenda do Boto', categoria: 'lendas', estado: 'AM', local: 'Rio Amazonas',
      descricao: 'Nas noites de festa, um rapaz elegante e de chapéu aparece e encanta as moças; ao amanhecer, volta ao rio transformado em boto-cor-de-rosa. A história explica gravidezes misteriosas e ensina respeito às águas.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-06' },
    { id: 's07', titulo: 'Kene: grafismo Huni Kuin', categoria: 'artesanato', estado: 'AC', local: 'Terras indígenas do Alto Juruá',
      descricao: 'Os kene são padrões geométricos usados pelo povo Huni Kuin em tecidos, cestarias e pinturas corporais. Cada desenho traduz uma forma de enxergar o mundo e é passado entre as mulheres e os mais velhos.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-07' },
    { id: 's08', titulo: 'Memória dos seringais', categoria: 'povos', estado: 'AC', local: 'Xapuri e Alto Acre',
      descricao: 'Famílias seringueiras construíram uma cultura própria no meio da floresta: o corte da seringa de madrugada, a defumação da borracha, as histórias de barracão. Essa memória ficou ligada à luta pelas reservas extrativistas.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-08' },
    { id: 's09', titulo: 'Nheengatu, a língua geral', categoria: 'povos', estado: 'AM', local: 'Alto Rio Negro',
      descricao: 'Língua de origem tupi que se espalhou pelo Rio Negro e segue sendo falada por vários povos da região. Em São Gabriel da Cachoeira, é uma das línguas oficiais do município, ao lado do baniwa e do tukano.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-09' },
    { id: 's10', titulo: 'Maniçoba', categoria: 'culinaria', estado: 'PA', local: 'Belém',
      descricao: 'Feijoada verde feita com folhas da mandioca brava moídas e cozidas por cerca de uma semana para eliminar a toxina natural. O cuidado no preparo é parte da receita e do ritual de quem a faz para a família.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-10' },
    { id: 's11', titulo: 'Boi-bumbá', categoria: 'musica', estado: 'MA', local: 'Baixada e Amazônia maranhense',
      descricao: 'Folguedo que conta a história do boi que morre e ressuscita, com cantos, tambores e personagens como Pai Francisco e Catirina. Cada grupo tem seu sotaque, seus bordados e seu jeito de brincar.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-11' },
    { id: 's12', titulo: 'Cuias de Santarém', categoria: 'artesanato', estado: 'PA', local: 'Santarém',
      descricao: 'Cuias decoradas com pintura e gravura, usadas para servir tacacá, tucupi e açaí. O acabamento escuro vem do tingimento com cumatê, e cada artesão desenha o seu próprio padrão.',
      autor: 'Acervo Norteando', criadoEm: '2026-10-12' },
  ];

  const VIEWS = {
    explorar: 'Explorar acervo',
    roteiros: 'Meus roteiros',
    favoritos: 'Salvos',
    contribuir: 'Compartilhar cultura',
  };

  /* ---------- estado ---------- */
  const state = {
    acervo: [],
    favoritos: store.get('favoritos', []),
    roteiros: store.get('roteiros', []),
    contribuicoes: store.get('contribuicoes', []),
    user: store.get('user', null),
    api: store.get('api', { url: '', ativo: false }),
    filtro: { q: '', cat: 'todas', uf: 'todos', ord: 'recentes' },
    view: 'explorar',
    detalheId: null,
    itemParaRoteiro: null,
  };

  const salvar = {
    favoritos: () => store.set('favoritos', state.favoritos),
    roteiros: () => store.set('roteiros', state.roteiros),
    contribuicoes: () => store.set('contribuicoes', state.contribuicoes),
    user: () => store.set('user', state.user),
    api: () => store.set('api', state.api),
  };

  const achar = (id) => state.acervo.find((i) => i.id === id);

  /* ---------- feedback ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visivel'), 2800);
  }

  function setModo(modo, texto) {
    const el = $('#modo');
    el.dataset.modo = modo;
    $('#modo-texto').textContent = texto;
  }

  /* ---------- API ---------- */
  const baseApi = () => state.api.url.replace(/\/+$/, '');

  async function chamarApi(caminho, opcoes = {}) {
    const r = await fetch(baseApi() + caminho, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...opcoes,
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  function normalizar(lista) {
    const arr = Array.isArray(lista) ? lista : (lista && Array.isArray(lista.itens) ? lista.itens : []);
    return arr
      .filter((i) => i && (i.titulo || i.title))
      .map((i) => ({
        id: String(i.id ?? uid()),
        titulo: String(i.titulo ?? i.title),
        categoria: CATEGORIAS[i.categoria] ? i.categoria : 'povos',
        estado: String(i.estado ?? i.uf ?? ''),
        local: String(i.local ?? i.cidade ?? ''),
        descricao: String(i.descricao ?? i.description ?? ''),
        autor: String(i.autor ?? 'Comunidade'),
        imagem: urlSegura(i.imagem ?? ''),
        criadoEm: String(i.criadoEm ?? ''),
      }));
  }

  async function carregarAcervo() {
    if (state.api.ativo && state.api.url) {
      try {
        const dados = await chamarApi('/acervo');
        state.acervo = normalizar(dados).concat(state.contribuicoes);
        setModo('api', 'Conectado à API');
        return;
      } catch {
        setModo('erro', 'API indisponível — modo demonstrativo');
        toast('Não consegui falar com a API. Mostrando o acervo de demonstração.');
      }
    } else {
      setModo('demo', 'Modo demonstrativo');
    }
    state.acervo = state.contribuicoes.concat(SEED);
  }

  /* ---------- navegação ---------- */
  function rotaAtual() {
    const h = location.hash.replace('#', '');
    return VIEWS[h] ? h : 'explorar';
  }

  function mostrarView(rolar = true) {
    const v = rotaAtual();
    state.view = v;
    $$('.view').forEach((s) => { s.hidden = s.id !== 'view-' + v; });
    $('#hero').hidden = v !== 'explorar';
    $$('.menu a').forEach((a) => {
      const ativo = a.dataset.view === v;
      a.classList.toggle('ativo', ativo);
      if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#crumb-atual').textContent = VIEWS[v];
    document.title = `${VIEWS[v]} — Norteando`;
    renderizar();
    if (rolar) window.scrollTo({ top: 0 });
  }

  function renderizar() {
    atualizarContador();
    atualizarUsuario();
    if (state.view === 'explorar') renderExplorar();
    if (state.view === 'roteiros') renderRoteiros();
    if (state.view === 'favoritos') renderFavoritos();
    if (state.view === 'contribuir') atualizarAvisoLogin();
  }

  /* ---------- cards ---------- */
  function cardHTML(it) {
    const cat = CATEGORIAS[it.categoria] || CATEGORIAS.povos;
    const salvo = state.favoritos.includes(it.id);
    const img = urlSegura(it.imagem);
    const visual = img
      ? `<img src="${esc(img)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
      : `<span class="glifo" aria-hidden="true">${cat.icone}</span>`;
    const lugar = [it.local, it.estado].filter(Boolean).join(' · ');
    return `
      <article class="card" style="--cor:${cat.cor}">
        <div class="card-visual">${visual}<span class="selo">${esc(cat.nome)}</span></div>
        <div class="card-corpo">
          <h3>${esc(it.titulo)}</h3>
          <p class="local">📍 ${esc(lugar)}</p>
          <p class="resumo">${esc(it.descricao)}</p>
        </div>
        <div class="card-acoes">
          <button type="button" class="btn-texto" data-action="abrir" data-id="${esc(it.id)}">Ver história →</button>
          <button type="button" class="btn-icone ${salvo ? 'ativo' : ''}" data-action="favoritar" data-id="${esc(it.id)}"
            aria-pressed="${salvo}" aria-label="${salvo ? 'Remover dos salvos' : 'Salvar'}: ${esc(it.titulo)}">${salvo ? '♥' : '♡'}</button>
        </div>
      </article>`;
  }

  /* ---------- explorar ---------- */
  function filtrar() {
    const { q, cat, uf, ord } = state.filtro;
    const termo = norm(q.trim());
    const lista = state.acervo.filter((it) => {
      if (cat !== 'todas' && it.categoria !== cat) return false;
      if (uf !== 'todos' && it.estado !== uf) return false;
      if (!termo) return true;
      return norm([it.titulo, it.descricao, it.local, it.estado, it.autor].join(' ')).includes(termo);
    });
    lista.sort(ord === 'az'
      ? (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')
      : (a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    return lista;
  }

  function renderChips() {
    const itens = [['todas', 'Todas'], ...Object.entries(CATEGORIAS).map(([k, c]) => [k, `${c.icone} ${c.nome}`])];
    $('#chips').innerHTML = itens.map(([k, nome]) =>
      `<button type="button" class="chip" data-action="categoria" data-cat="${k}" aria-pressed="${state.filtro.cat === k}">${esc(nome)}</button>`
    ).join('');
  }

  function renderUFs() {
    const sel = $('#filtro-uf');
    const ufs = [...new Set(state.acervo.map((i) => i.estado).filter(Boolean))].sort();
    if (state.filtro.uf !== 'todos' && !ufs.includes(state.filtro.uf)) state.filtro.uf = 'todos';
    sel.innerHTML = '<option value="todos">Todos os estados</option>' +
      ufs.map((u) => `<option value="${esc(u)}">${esc(u)}</option>`).join('');
    sel.value = state.filtro.uf;
  }

  function renderExplorar() {
    renderChips();
    renderUFs();
    const lista = filtrar();
    $('#grade-acervo').innerHTML = lista.map(cardHTML).join('');
    $('#vazio-acervo').hidden = lista.length > 0;
    const n = lista.length;
    $('#contagem').textContent = n === 0 ? '' : `${n} ${n === 1 ? 'item encontrado' : 'itens encontrados'}`;
  }

  /* ---------- favoritos ---------- */
  function atualizarContador() {
    $('#contador-salvos').textContent = state.favoritos.filter((id) => achar(id)).length;
  }

  function renderFavoritos() {
    const lista = state.favoritos.map(achar).filter(Boolean);
    $('#grade-favoritos').innerHTML = lista.map(cardHTML).join('');
    $('#vazio-favoritos').hidden = lista.length > 0;
  }

  function alternarFavorito(id) {
    const i = state.favoritos.indexOf(id);
    if (i >= 0) { state.favoritos.splice(i, 1); toast('Removido dos salvos'); }
    else { state.favoritos.push(id); toast('Salvo!'); }
    salvar.favoritos();
    renderizar();
    if ($('#dlg-detalhe').open) renderDetalhe();
  }

  /* ---------- detalhe ---------- */
  function renderDetalhe() {
    const it = achar(state.detalheId);
    if (!it) return;
    const cat = CATEGORIAS[it.categoria] || CATEGORIAS.povos;
    const salvo = state.favoritos.includes(it.id);
    const img = urlSegura(it.imagem);
    const visual = img
      ? `<img src="${esc(img)}" alt="" referrerpolicy="no-referrer">`
      : `<span class="glifo" aria-hidden="true">${cat.icone}</span>`;
    const minha = state.contribuicoes.some((c) => c.id === it.id);
    const lugar = [it.local, it.estado].filter(Boolean).join(' · ');
    $('#detalhe-conteudo').innerHTML = `
      <div class="detalhe-visual" style="--cor:${cat.cor}">${visual}<span class="selo">${esc(cat.nome)}</span></div>
      <div class="detalhe-corpo">
        <h3 id="detalhe-titulo">${esc(it.titulo)}</h3>
        <p class="detalhe-meta">📍 ${esc(lugar)} · por ${esc(it.autor)}</p>
        <p class="detalhe-texto">${esc(it.descricao)}</p>
        <div class="detalhe-acoes">
          <button type="button" class="btn ${salvo ? 'btn-verde' : 'btn-contorno'}" data-action="favoritar" data-id="${esc(it.id)}" aria-pressed="${salvo}">
            ${salvo ? '♥ Salvo' : '♡ Salvar'}</button>
          <button type="button" class="btn btn-contorno" data-action="add-roteiro" data-id="${esc(it.id)}">⌁ Adicionar a um roteiro</button>
          <button type="button" class="btn btn-contorno" data-action="compartilhar" data-id="${esc(it.id)}">↗ Compartilhar</button>
          ${minha ? `<button type="button" class="btn btn-perigo" data-action="excluir-contribuicao" data-id="${esc(it.id)}">Excluir minha contribuição</button>` : ''}
        </div>
      </div>`;
  }

  function abrirDetalhe(id) {
    if (!achar(id)) return;
    state.detalheId = id;
    renderDetalhe();
    const dlg = $('#dlg-detalhe');
    if (!dlg.open) dlg.showModal();
  }

  async function compartilhar(id) {
    const it = achar(id);
    if (!it) return;
    const link = location.href.split('#')[0] + '#explorar';
    const texto = `${it.titulo} (${[it.local, it.estado].filter(Boolean).join(', ')}) — conheça no Norteando`;
    try {
      if (navigator.share) { await navigator.share({ title: it.titulo, text: texto, url: link }); return; }
      await navigator.clipboard.writeText(`${texto}: ${link}`);
      toast('Link copiado!');
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      toast('Não foi possível compartilhar neste navegador.');
    }
  }

  function excluirContribuicao(id) {
    if (!confirm('Excluir esta contribuição? Esta ação não pode ser desfeita.')) return;
    state.contribuicoes = state.contribuicoes.filter((c) => c.id !== id);
    state.favoritos = state.favoritos.filter((f) => f !== id);
    state.roteiros.forEach((r) => { r.itens = r.itens.filter((x) => x !== id); });
    salvar.contribuicoes(); salvar.favoritos(); salvar.roteiros();
    state.acervo = state.acervo.filter((i) => i.id !== id);
    $('#dlg-detalhe').close();
    renderizar();
    toast('Contribuição excluída');
  }

  /* ---------- roteiros ---------- */
  function criarRoteiro(nome) {
    const r = { id: uid(), nome: nome.trim(), itens: [] };
    state.roteiros.push(r);
    salvar.roteiros();
    return r;
  }

  function renderRoteiros() {
    const el = $('#lista-roteiros');
    if (!state.roteiros.length) {
      el.innerHTML = `<div class="vazio"><p class="vazio-icone" aria-hidden="true">⌁</p>
        <h3>Nenhum roteiro ainda</h3>
        <p>Crie um acima e adicione itens do acervo pelo botão “Adicionar a um roteiro”.</p></div>`;
      return;
    }
    el.innerHTML = state.roteiros.map((r) => {
      const itens = r.itens.map(achar).filter(Boolean);
      const paradas = itens.map((it, i) => `
        <li class="parada">
          <div class="parada-info">
            <button type="button" data-action="abrir" data-id="${esc(it.id)}">${esc(it.titulo)}</button>
            <small>${esc([it.local, it.estado].filter(Boolean).join(' · '))}</small>
          </div>
          <div class="parada-botoes">
            <button type="button" class="mini" data-action="rot-subir" data-r="${esc(r.id)}" data-id="${esc(it.id)}" aria-label="Subir ${esc(it.titulo)}" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="mini" data-action="rot-descer" data-r="${esc(r.id)}" data-id="${esc(it.id)}" aria-label="Descer ${esc(it.titulo)}" ${i === itens.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="mini" data-action="rot-remover" data-r="${esc(r.id)}" data-id="${esc(it.id)}" aria-label="Remover ${esc(it.titulo)} do roteiro">×</button>
          </div>
        </li>`).join('');
      return `
        <article class="roteiro">
          <div class="roteiro-topo">
            <div>
              <h3>${esc(r.nome)}</h3>
              <p class="roteiro-meta">${itens.length} ${itens.length === 1 ? 'parada' : 'paradas'}</p>
            </div>
            <div class="roteiro-botoes">
              <button type="button" class="btn btn-contorno btn-pequeno" data-action="rot-copiar" data-r="${esc(r.id)}">Copiar roteiro</button>
              <button type="button" class="btn btn-perigo btn-pequeno" data-action="rot-excluir" data-r="${esc(r.id)}">Excluir</button>
            </div>
          </div>
          ${itens.length ? `<ol class="paradas">${paradas}</ol>`
            : '<p class="roteiro-vazio">Sem paradas ainda. Explore o acervo e adicione itens a este roteiro.</p>'}
        </article>`;
    }).join('');
  }

  function moverParada(rid, id, delta) {
    const r = state.roteiros.find((x) => x.id === rid);
    if (!r) return;
    const i = r.itens.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= r.itens.length) return;
    [r.itens[i], r.itens[j]] = [r.itens[j], r.itens[i]];
    salvar.roteiros();
    renderRoteiros();
  }

  async function copiarRoteiro(rid) {
    const r = state.roteiros.find((x) => x.id === rid);
    if (!r) return;
    const linhas = r.itens.map(achar).filter(Boolean)
      .map((it, i) => `${i + 1}. ${it.titulo} — ${[it.local, it.estado].filter(Boolean).join(', ')}`);
    const texto = `Roteiro: ${r.nome}\n${linhas.join('\n') || '(sem paradas)'}\n\nMontado no Norteando`;
    try { await navigator.clipboard.writeText(texto); toast('Roteiro copiado!'); }
    catch { toast('Não foi possível copiar neste navegador.'); }
  }

  function abrirAddRoteiro(id) {
    const it = achar(id);
    if (!it) return;
    state.itemParaRoteiro = id;
    $('#roteiro-dlg-item').textContent = `Item: ${it.titulo}`;
    const sel = $('#add-roteiro-sel');
    sel.innerHTML = state.roteiros.length
      ? state.roteiros.map((r) => `<option value="${esc(r.id)}">${esc(r.nome)}</option>`).join('')
      : '<option value="">Você ainda não tem roteiros</option>';
    sel.disabled = !state.roteiros.length;
    $('#add-roteiro-novo').value = '';
    $('#dlg-roteiro').showModal();
  }

  /* ---------- usuário ---------- */
  function atualizarUsuario() {
    const nome = state.user ? state.user.nome : 'Visitante';
    $('#nome-usuario').textContent = nome;
    $('#avatar').textContent = nome.trim().charAt(0).toUpperCase() || 'V';
    const b = $('#btn-sessao');
    b.textContent = state.user ? 'Sair' : 'Entre para contribuir ↗';
    b.dataset.action = state.user ? 'sair' : 'abrir-login';
  }

  function atualizarAvisoLogin() {
    $('#aviso-login').textContent = state.user
      ? `Publicando como ${state.user.nome}.`
      : 'Você precisa entrar para publicar.';
  }

  /* ---------- contribuir ---------- */
  function preencherCategorias() {
    $('#form-contribuir [name="categoria"]').innerHTML =
      Object.entries(CATEGORIAS).map(([k, c]) => `<option value="${k}">${c.icone} ${esc(c.nome)}</option>`).join('');
  }

  function validar(form) {
    const f = new FormData(form);
    const erros = {};
    if (!String(f.get('titulo')).trim()) erros.titulo = 'Dê um título à sua história.';
    if (!f.get('estado')) erros.estado = 'Escolha o estado.';
    if (!String(f.get('local')).trim()) erros.local = 'Informe o local.';
    const d = String(f.get('descricao')).trim();
    if (d.length < 40) erros.descricao = 'Conte um pouco mais (mínimo de 40 caracteres).';
    const img = String(f.get('imagem')).trim();
    if (img && !urlSegura(img)) erros.imagem = 'Use um link que comece com http:// ou https://';
    $$('[data-erro]', form).forEach((el) => {
      el.textContent = erros[el.dataset.erro] || '';
      el.closest('.campo').classList.toggle('invalido', Boolean(erros[el.dataset.erro]));
    });
    return { ok: !Object.keys(erros).length, f };
  }

  async function publicar(ev) {
    ev.preventDefault();
    const form = ev.currentTarget;
    if (!state.user) {
      toast('Entre para publicar sua contribuição.');
      $('#dlg-login').showModal();
      return;
    }
    const { ok, f } = validar(form);
    if (!ok) return;
    const item = {
      id: uid(),
      titulo: String(f.get('titulo')).trim(),
      categoria: String(f.get('categoria')),
      estado: String(f.get('estado')),
      local: String(f.get('local')).trim(),
      descricao: String(f.get('descricao')).trim(),
      autor: state.user.nome,
      imagem: urlSegura(String(f.get('imagem')).trim()),
      criadoEm: new Date().toISOString().slice(0, 10),
    };
    let enviado = false;
    if (state.api.ativo && state.api.url) {
      try { await chamarApi('/acervo', { method: 'POST', body: JSON.stringify(item) }); enviado = true; }
      catch { toast('A API não respondeu. Salvei sua contribuição neste navegador.'); }
    }
    if (!enviado) { state.contribuicoes.unshift(item); salvar.contribuicoes(); }
    await carregarAcervo();
    form.reset();
    $('#contador-desc').textContent = '0';
    location.hash = '#explorar';
    if (enviado) toast('Contribuição publicada. Obrigado por compartilhar!');
    else if (!(state.api.ativo && state.api.url)) toast('Contribuição publicada. Obrigado por compartilhar!');
  }

  /* ---------- API: modal ---------- */
  function abrirApi() {
    $('#api-url').value = state.api.url;
    $('#api-ativo').checked = state.api.ativo;
    const t = $('#api-teste');
    t.textContent = ''; t.className = 'resultado-teste';
    $('#dlg-api').showModal();
  }

  async function testarApi() {
    const t = $('#api-teste');
    const url = urlSegura($('#api-url').value.trim());
    if (!url) { t.textContent = 'Informe uma URL válida (http:// ou https://).'; t.className = 'resultado-teste falha'; return; }
    t.textContent = 'Testando…'; t.className = 'resultado-teste';
    try {
      const r = await fetch(url.replace(/\/+$/, '') + '/acervo', { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const n = normalizar(await r.json()).length;
      t.textContent = `Conexão ok — ${n} ${n === 1 ? 'item' : 'itens'} recebidos.`;
      t.className = 'resultado-teste ok';
    } catch {
      t.textContent = 'Falhou. Confira a URL, o endpoint /acervo e se o CORS está liberado.';
      t.className = 'resultado-teste falha';
    }
  }

  /* ---------- eventos ---------- */
  function ligarEventos() {
    // Delegação de cliques
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('[data-action]');
      if (alvo) {
        const { action, id, r, cat } = alvo.dataset;
        switch (action) {
          case 'abrir': abrirDetalhe(id); break;
          case 'favoritar': alternarFavorito(id); break;
          case 'add-roteiro': abrirAddRoteiro(id); break;
          case 'compartilhar': compartilhar(id); break;
          case 'excluir-contribuicao': excluirContribuicao(id); break;
          case 'categoria': state.filtro.cat = cat; renderExplorar(); break;
          case 'limpar-filtros':
            state.filtro = { q: '', cat: 'todas', uf: 'todos', ord: 'recentes' };
            $('#busca').value = ''; $('#filtro-ord').value = 'recentes';
            renderExplorar(); break;
          case 'rot-subir': moverParada(r, id, -1); break;
          case 'rot-descer': moverParada(r, id, 1); break;
          case 'rot-remover': {
            const ro = state.roteiros.find((x) => x.id === r);
            if (ro) { ro.itens = ro.itens.filter((x) => x !== id); salvar.roteiros(); renderRoteiros(); }
            break;
          }
          case 'rot-copiar': copiarRoteiro(r); break;
          case 'rot-excluir':
            if (confirm('Excluir este roteiro?')) {
              state.roteiros = state.roteiros.filter((x) => x.id !== r);
              salvar.roteiros(); renderRoteiros(); toast('Roteiro excluído');
            }
            break;
          case 'abrir-api': abrirApi(); break;
          case 'testar-api': testarApi(); break;
          case 'abrir-login': $('#dlg-login').showModal(); break;
          case 'sair':
            state.user = null; salvar.user(); renderizar(); toast('Você saiu.'); break;
          case 'fechar': alvo.closest('dialog').close(); break;
          default: break;
        }
        return;
      }
      // fechar modal clicando no fundo
      if (e.target instanceof HTMLDialogElement && e.target.open) e.target.close();
    });

    window.addEventListener('hashchange', () => mostrarView(true));

    // Filtros
    $('#busca').addEventListener('input', (e) => { state.filtro.q = e.target.value; renderExplorar(); });
    $('#filtro-uf').addEventListener('change', (e) => { state.filtro.uf = e.target.value; renderExplorar(); });
    $('#filtro-ord').addEventListener('change', (e) => { state.filtro.ord = e.target.value; renderExplorar(); });

    // Roteiro: criar
    $('#form-roteiro').addEventListener('submit', (e) => {
      e.preventDefault();
      const campo = $('#roteiro-nome');
      if (!campo.value.trim()) return;
      criarRoteiro(campo.value);
      campo.value = '';
      renderRoteiros();
      toast('Roteiro criado');
    });

    // Roteiro: adicionar item
    $('#form-add-roteiro').addEventListener('submit', (e) => {
      e.preventDefault();
      const novo = $('#add-roteiro-novo').value.trim();
      const sel = $('#add-roteiro-sel').value;
      let roteiro = null;
      if (novo) roteiro = criarRoteiro(novo);
      else if (sel) roteiro = state.roteiros.find((r) => r.id === sel);
      if (!roteiro) { toast('Escolha ou crie um roteiro.'); return; }
      if (roteiro.itens.includes(state.itemParaRoteiro)) toast('Este item já está no roteiro.');
      else {
        roteiro.itens.push(state.itemParaRoteiro);
        salvar.roteiros();
        toast(`Adicionado a “${roteiro.nome}”`);
      }
      $('#dlg-roteiro').close();
      renderizar();
    });

    // Contribuir
    $('#form-contribuir').addEventListener('submit', publicar);
    $('#form-contribuir [name="descricao"]').addEventListener('input', (e) => {
      $('#contador-desc').textContent = e.target.value.length;
    });

    // Login
    $('#form-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#login-nome').value.trim();
      const email = $('#login-email').value.trim();
      if (!nome || !email) return;
      state.user = { nome, email };
      salvar.user();
      $('#dlg-login').close();
      renderizar();
      toast(`Bem-vindo(a), ${nome}!`);
    });

    // API
    $('#form-api').addEventListener('submit', async (e) => {
      e.preventDefault();
      const bruto = $('#api-url').value.trim();
      const url = bruto ? urlSegura(bruto) : '';
      const ativo = $('#api-ativo').checked;
      if (bruto && !url) { toast('URL inválida. Use http:// ou https://'); return; }
      if (ativo && !url) { toast('Informe a URL para usar a API.'); return; }
      state.api = { url, ativo };
      salvar.api();
      $('#dlg-api').close();
      await carregarAcervo();
      renderizar();
      if (!ativo) toast('Modo demonstrativo ativado.');
    });
  }

  /* ---------- início ---------- */
  async function iniciar() {
    preencherCategorias();
    ligarEventos();
    await carregarAcervo();
    mostrarView(false);
  }

  iniciar();
})();
