/* =========================================================
   app.js — lógica da loja (vitrine, carrinho, pedido)
   Não precisa editar este arquivo para trocar produtos:
   use products.js.
   ========================================================= */
(function () {
  "use strict";

  const CHAVE_STORAGE = "delicia-carrinho-v1";
  const $ = (sel) => document.querySelector(sel);

  /* ---------- Utilidades ---------- */
  const formatarReais = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Data local no formato AAAA-MM-DD (para o input type="date")
  function dataISO(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function dataMinima() {
    const d = new Date();
    d.setDate(d.getDate() + CONFIG.antecedenciaDias);
    return dataISO(d);
  }
  const dataBR = (iso) => iso.split("-").reverse().join("/");

  const escapar = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Carrinho (com localStorage seguro) ---------- */
  let carrinho = carregar();

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      const lista = bruto ? JSON.parse(bruto) : [];
      // Descarta itens de produtos que não existem mais
      return Array.isArray(lista) ? lista.filter((i) => PRODUCTS.some((p) => p.id === i.id)) : [];
    } catch (e) {
      return [];
    }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho)); } catch (e) { /* modo privado: ignora */ }
  }

  // Calcula o preço unitário de um produto com as escolhas feitas
  function precoUnitario(produto, escolhas) {
    let total = produto.preco;
    (produto.opcoes || []).forEach((op, i) => {
      const esc = op.escolhas.find((e) => e.rotulo === escolhas[i]);
      if (esc) total += esc.acrescimo;
    });
    return total;
  }

  function adicionar(produto, escolhas) {
    const chave = produto.id + "|" + escolhas.join("|");
    const existente = carrinho.find((i) => i.chave === chave);
    if (existente) existente.qtd += 1;
    else carrinho.push({ chave, id: produto.id, escolhas, qtd: 1 });
    salvar();
    renderCarrinho();
    avisar(`${produto.nome} adicionado ✓`);
    const fab = $("#abrir-carrinho");
    fab.classList.remove("pulsar"); void fab.offsetWidth; fab.classList.add("pulsar");
  }

  function alterarQtd(chave, delta) {
    const item = carrinho.find((i) => i.chave === chave);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) carrinho = carrinho.filter((i) => i.chave !== chave);
    salvar();
    renderCarrinho();
  }
  function remover(chave) {
    carrinho = carrinho.filter((i) => i.chave !== chave);
    salvar();
    renderCarrinho();
  }

  // Lista detalhada: produto, opções, preços
  function detalhar() {
    return carrinho.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      const unit = precoUnitario(p, i.escolhas);
      const opcoesTxt = (p.opcoes || []).map((op, k) => `${op.nome}: ${i.escolhas[k]}`).join(", ");
      return { ...i, produto: p, unit, total: unit * i.qtd, opcoesTxt };
    });
  }
  const subtotal = () => detalhar().reduce((s, i) => s + i.total, 0);
  const totalItens = () => carrinho.reduce((s, i) => s + i.qtd, 0);

  /* ---------- Visual do produto (foto ou placeholder) ---------- */
  function visual(p, classe) {
    if (p.foto) return `<img src="${escapar(p.foto)}" alt="${escapar(p.nome)}" loading="lazy" />`;
    const [a, b] = p.cor || ["#f3e2df", "#c9707a"];
    return `<div class="${classe}" role="img" aria-label="${escapar(p.nome)} (imagem ilustrativa)"
      style="background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.55), transparent 55%),linear-gradient(135deg, ${a}, ${b})"><span aria-hidden="true">${p.emoji || "🧁"}</span></div>`;
  }

  /* ---------- Vitrine ---------- */
  let categoriaAtiva = "Todos";

  function renderFiltros() {
    const cats = ["Todos", ...CATEGORIAS];
    const conta = (c) => (c === "Todos" ? PRODUCTS.length : PRODUCTS.filter((p) => p.categoria === c).length);
    $("#filtros").innerHTML = cats
      .map((c) => `<button type="button" class="filtro" data-cat="${c}" aria-pressed="${c === categoriaAtiva}">${c} <span class="filtro__n" aria-hidden="true">${conta(c)}</span></button>`)
      .join("");
  }

  function renderVitrine() {
    const lista = PRODUCTS.filter((p) => categoriaAtiva === "Todos" || p.categoria === categoriaAtiva);
    $("#grade").innerHTML = lista
      .map((p, idx) => {
        const opcoes = (p.opcoes || [])
          .map((op, i) => `
            <div class="card__opcao">
              <label for="op-${p.id}-${i}">${escapar(op.nome)}</label>
              <select id="op-${p.id}-${i}" data-produto="${p.id}" data-opcao="${i}">
                ${op.escolhas.map((e) => `<option value="${escapar(e.rotulo)}">${escapar(e.rotulo)}${e.acrescimo ? ` (+ ${formatarReais(e.acrescimo)})` : ""}</option>`).join("")}
              </select>
            </div>`)
          .join("");
        return `
          <article class="card" style="--i:${idx}">
            <div class="card__foto">${visual(p, "card__placeholder")}<span class="card__selo">${escapar(p.categoria)}</span></div>
            <div class="card__corpo">
              <h3 class="card__nome">${escapar(p.nome)}</h3>
              <p class="card__desc">${escapar(p.descricao)}</p>
              ${opcoes}
              <div class="card__rodape">
                <span class="preco" id="preco-${p.id}">${p.opcoes ? "<small>a partir de</small>" : ""}${formatarReais(p.preco)}</span>
                <button type="button" class="btn btn--primary btn--sm btn-add" data-add="${p.id}" aria-label="Adicionar ${escapar(p.nome)} ao pedido"><span class="mais" aria-hidden="true">+</span> <span class="rotulo">Adicionar</span></button>
              </div>
            </div>
          </article>`;
      })
      .join("");
  }

  const escolhasDoCard = (p) =>
    (p.opcoes || []).map((_, i) => document.getElementById(`op-${p.id}-${i}`).value);

  /* ---------- Carrinho (render) ---------- */
  function renderCarrinho() {
    const itens = detalhar();
    $("#itens").innerHTML = itens
      .map((i) => `
        <li class="item">
          <div class="item__mini">${visual(i.produto, "item__mini")}</div>
          <div>
            <p class="item__nome">${escapar(i.produto.nome)}</p>
            ${i.opcoesTxt ? `<p class="item__opc">${escapar(i.opcoesTxt)}</p>` : ""}
            <div class="item__linha">
              <div class="qtd">
                <button type="button" data-menos="${escapar(i.chave)}" aria-label="Diminuir quantidade de ${escapar(i.produto.nome)}">−</button>
                <output aria-label="Quantidade">${i.qtd}</output>
                <button type="button" data-mais="${escapar(i.chave)}" aria-label="Aumentar quantidade de ${escapar(i.produto.nome)}">+</button>
              </div>
              <span class="item__preco">${formatarReais(i.total)}</span>
              <button type="button" class="remover" data-remover="${escapar(i.chave)}">Remover</button>
            </div>
          </div>
        </li>`)
      .join("");

    const vazio = itens.length === 0;
    $("#vazio").hidden = !vazio;
    $("#bloco-subtotal").hidden = vazio;
    $("#form-pedido").hidden = vazio;
    $("#subtotal").textContent = formatarReais(subtotal());
    const n = totalItens();
    $("#contador").textContent = n;
    $("#contador").setAttribute("aria-label", `${n} ${n === 1 ? "item" : "itens"} no carrinho`);
    $("#fab-total").textContent = n ? formatarReais(subtotal()) : "";
  }

  /* ---------- Microanimações ---------- */
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Foto do produto "voa" até o botão do carrinho
  function voarAteCarrinho(origemImg) {
    if (semMovimento || !origemImg || origemImg.tagName !== "IMG") return;
    const a = origemImg.getBoundingClientRect();
    const b = $("#abrir-carrinho").getBoundingClientRect();
    const tam = 72;
    const clone = document.createElement("img");
    clone.src = origemImg.currentSrc || origemImg.src;
    clone.alt = "";
    clone.className = "voando";
    Object.assign(clone.style, { width: tam + "px", height: tam + "px", left: a.left + a.width / 2 - tam / 2 + "px", top: a.top + a.height / 2 - tam / 2 + "px" });
    document.body.appendChild(clone);
    requestAnimationFrame(() => {
      const dx = b.left + b.width - 30 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(.25)`;
      clone.style.opacity = ".6";
    });
    setTimeout(() => clone.remove(), 800);
  }

  // Onda ao clicar em botões
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn || semMovimento) return;
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const o = document.createElement("span");
    o.className = "onda";
    Object.assign(o.style, { width: d + "px", height: d + "px", left: e.clientX - r.left - d / 2 + "px", top: e.clientY - r.top - d / 2 + "px" });
    btn.appendChild(o);
    setTimeout(() => o.remove(), 650);
  });

  // Seções aparecem suavemente ao entrar na tela
  function iniciarRevela() {
    const els = document.querySelectorAll(".revela");
    if (!("IntersectionObserver" in window) || semMovimento) { els.forEach((el) => el.classList.add("visivel")); return; }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }

  // Topo ganha fundo depois de rolar
  function iniciarTopo() {
    const topo = $("#topo");
    const atualizar = () => topo.classList.toggle("rolou", window.scrollY > 20);
    window.addEventListener("scroll", atualizar, { passive: true });
    atualizar();
  }

  /* ---------- Abrir / fechar gaveta ---------- */
  let ultimoFoco = null;
  function abrirCarrinho() {
    ultimoFoco = document.activeElement;
    $("#carrinho").hidden = false;
    $("#veu").hidden = false;
    $("#abrir-carrinho").setAttribute("aria-expanded", "true");
    document.body.classList.add("travado");
    $("#fechar-carrinho").focus();
  }
  function fecharCarrinho() {
    $("#carrinho").hidden = true;
    $("#veu").hidden = true;
    $("#abrir-carrinho").setAttribute("aria-expanded", "false");
    document.body.classList.remove("travado");
    // se estava na tela de sucesso, volta ao estado normal para a próxima abertura
    if (!$("#sucesso").hidden) {
      clearTimeout(timerSucesso);
      $("#sucesso").hidden = true;
      renderCarrinho();
      if (ultimoFoco && ultimoFoco.closest(".gaveta")) ultimoFoco = null;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (ultimoFoco) ultimoFoco.focus();
  }

  /* ---------- Toast ---------- */
  let timerToast;
  function avisar(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("mostrar");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => t.classList.remove("mostrar"), 1800);
  }

  /* ---------- Formulário e WhatsApp ---------- */
  const modo = () => document.querySelector('input[name="modo"]:checked').value;

  function marcarErro(campoId, erroId, msg) {
    const campo = document.getElementById(campoId);
    document.getElementById(erroId).textContent = msg || "";
    if (msg) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
    return !msg;
  }

  function validar() {
    const nome = $("#f-nome").value.trim();
    const tel = $("#f-tel").value.replace(/\D/g, "");
    const data = $("#f-data").value;
    const resultados = [
      marcarErro("f-nome", "e-nome", nome.length < 2 ? "Conte pra gente seu nome." : ""),
      marcarErro("f-tel", "e-tel", tel.length < 10 ? "Informe um telefone com DDD." : ""),
      marcarErro("f-data", "e-data",
        !data ? "Escolha a data do pedido." :
        data < dataMinima() ? `Precisamos de ${CONFIG.antecedenciaDias} dias de antecedência (a partir de ${dataBR(dataMinima())}).` : ""),
    ];
    if (modo() === "entrega") {
      resultados.push(
        marcarErro("f-bairro", "e-bairro", !$("#f-bairro").value.trim() ? "Informe o bairro." : ""),
        marcarErro("f-end", "e-end", $("#f-end").value.trim().length < 5 ? "Informe o endereço completo." : "")
      );
    } else {
      marcarErro("f-bairro", "e-bairro", "");
      marcarErro("f-end", "e-end", "");
    }
    const ok = resultados.every(Boolean);
    $("#e-geral").textContent = ok ? "" : "Confira os campos destacados acima.";
    if (!ok) { const primeiro = document.querySelector('[aria-invalid="true"]'); if (primeiro) primeiro.focus(); }
    return ok;
  }

  // Monta a mensagem no formato combinado
  function montarMensagem() {
    // Número do pedido: DD-diames-horaminuto do momento do envio (ex.: DD-1711-1432)
    const agora = new Date();
    const p2 = (n) => String(n).padStart(2, "0");
    const numero = `DD-${p2(agora.getDate())}${p2(agora.getMonth() + 1)}-${p2(agora.getHours())}${p2(agora.getMinutes())}`;

    // Dia da semana da data escolhida (meio-dia evita problema de fuso)
    const iso = $("#f-data").value;
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const diaSemana = dias[new Date(iso + "T12:00:00").getDay()];

    const itens = detalhar();
    const qtdTotal = totalItens();

    const linhas = [];
    linhas.push(`*Novo pedido — ${CONFIG.nome}* (#${numero})`);
    linhas.push("");
    linhas.push(`*Cliente:* ${$("#f-nome").value.trim()} — ${$("#f-tel").value.trim()}`);
    linhas.push("");
    linhas.push(`*Itens:*`);
    itens.forEach((i) => {
      const nome = `${i.qtd}x ${i.produto.nome}${i.opcoesTxt ? ` (${i.opcoesTxt})` : ""}`;
      const valor = i.qtd > 1 ? `${formatarReais(i.unit)} cada = ${formatarReais(i.total)}` : formatarReais(i.total);
      linhas.push(`• ${nome} — ${valor}`);
    });
    linhas.push("");
    linhas.push(`*Subtotal (${qtdTotal} ${qtdTotal === 1 ? "item" : "itens"}):* ${formatarReais(subtotal())}`);
    linhas.push("");
    if (modo() === "entrega") {
      linhas.push(`*Entrega:* ${$("#f-cidade").value} — ${$("#f-bairro").value.trim()} — ${$("#f-end").value.trim()}`);
      linhas.push(`*Taxa de entrega:* a confirmar`);
    } else {
      linhas.push(`*Retirada:* combinar local e horário`);
    }
    const hora = $("#f-hora").value;
    linhas.push(`*Data:* ${diaSemana}, ${dataBR(iso)}${hora ? ` às ${hora}` : ""}`);
    const obs = $("#f-obs").value.trim();
    if (obs) { linhas.push(""); linhas.push(`*Obs.:* ${obs}`); }
    linhas.push("");
    linhas.push("Aguardo a confirmação.");
    return linhas.join("\n");
  }

  function linkWhatsApp() {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(montarMensagem())}`;
  }
  // Exposto para testes no console: window.__pedido()
  window.__pedido = () => ({ mensagem: montarMensagem(), link: linkWhatsApp() });

  /* ---------- Inicialização ---------- */
  function iniciar() {
    // Textos vindos do CONFIG
    document.querySelectorAll('[data-config="nome"]').forEach((el) => (el.textContent = CONFIG.nome));
    document.querySelectorAll('[data-config="slogan"]').forEach((el) => (el.textContent = CONFIG.slogan));
    document.querySelectorAll('[data-config="antecedencia"]').forEach((el) => (el.textContent = CONFIG.antecedenciaDias));
    document.querySelectorAll('[data-config="instaUser"]').forEach((el) => (el.textContent = CONFIG.instagramUsuario));
    $("#link-insta-topo").href = CONFIG.instagram;
    $("#link-insta-rodape").href = CONFIG.instagram;
    $("#link-insta-cta").href = CONFIG.instagram;
    document.querySelectorAll('[data-config="avisoTaxa"]').forEach((el) => (el.textContent = CONFIG.avisoTaxa + "."));

    // Cartões de cidades + retirada
    $("#cidades").innerHTML =
      CONFIG.cidadesEntrega.map((c) => `<li class="cidade"><span class="cidade__pin" aria-hidden="true">📍</span><div><strong>${escapar(c)}</strong><span>Entrega com taxa por bairro</span></div></li>`).join("") +
      `<li class="cidade cidade--retirada"><span class="cidade__pin" aria-hidden="true">🏠</span><div><strong>Retirada</strong><span>Sem taxa, combinada pelo WhatsApp</span></div></li>`;

    // Créditos das fotos de exemplo (somem quando a lista ficar vazia)
    const cred = typeof CREDITOS_FOTOS !== "undefined" ? CREDITOS_FOTOS : [];
    $("#creditos-fotos").textContent = cred.length ? "Fotos ilustrativas: " + cred.join(" · ") + " (Wikimedia Commons)" : "";

    // Atalhos que filtram a vitrine (ex.: "Ver os box")
    document.querySelectorAll("[data-filtro-atalho]").forEach((a) =>
      a.addEventListener("click", () => { categoriaAtiva = a.dataset.filtroAtalho; renderFiltros(); renderVitrine(); })
    );
    $("#vazio-voltar").addEventListener("click", () => { fecharCarrinho(); location.hash = "#vitrine"; });

    iniciarRevela();
    iniciarTopo();
    $("#previa").hidden = !CONFIG.modoPrevia;
    $("#aviso-taxa").textContent = CONFIG.avisoTaxa;
    $("#f-cidade").innerHTML = CONFIG.cidadesEntrega.map((c) => `<option>${escapar(c)}</option>`).join("");
    $("#f-data").min = dataMinima();

    renderFiltros();
    renderVitrine();
    renderCarrinho();

    // Filtros
    $("#filtros").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      categoriaAtiva = b.dataset.cat;
      renderFiltros();
      renderVitrine();
    });

    // Vitrine: adicionar e atualizar preço conforme opção
    $("#grade").addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (!b) return;
      const p = PRODUCTS.find((x) => x.id === b.dataset.add);
      voarAteCarrinho(b.closest(".card").querySelector(".card__foto img"));
      adicionar(p, escolhasDoCard(p));
      // botão vira "Adicionado ✓" por um instante
      const rot = b.querySelector(".rotulo");
      b.classList.add("ok"); rot.textContent = "✓ Adicionado";
      clearTimeout(b._t);
      b._t = setTimeout(() => { b.classList.remove("ok"); rot.textContent = "Adicionar"; }, 1400);
    });
    $("#grade").addEventListener("change", (e) => {
      const s = e.target.closest("select[data-produto]");
      if (!s) return;
      const p = PRODUCTS.find((x) => x.id === s.dataset.produto);
      const el = $(`#preco-${p.id}`);
      el.textContent = formatarReais(precoUnitario(p, escolhasDoCard(p)));
      el.classList.remove("pula"); void el.offsetWidth; el.classList.add("pula");
    });

    // Carrinho: +, −, remover
    $("#itens").addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.mais) alterarQtd(t.dataset.mais, 1);
      if (t.dataset.menos) alterarQtd(t.dataset.menos, -1);
      if (t.dataset.remover) remover(t.dataset.remover);
    });

    $("#abrir-carrinho").addEventListener("click", abrirCarrinho);
    $("#fechar-carrinho").addEventListener("click", fecharCarrinho);
    $("#veu").addEventListener("click", fecharCarrinho);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#carrinho").hidden) fecharCarrinho(); });

    // Retirada / Entrega
    document.querySelectorAll('input[name="modo"]').forEach((r) =>
      r.addEventListener("change", () => { $("#bloco-entrega").hidden = modo() !== "entrega"; })
    );

    // Envio
    $("#form-pedido").addEventListener("submit", (e) => {
      e.preventDefault();
      if (carrinho.length === 0) return;
      if (!validar()) return;
      const link = linkWhatsApp();
      window.open(link, "_blank", "noopener");
      mostrarSucesso(link);
    });

    $("#sucesso-fechar").addEventListener("click", fecharCarrinho);
  }

  /* ---------- Depois de enviar: tela de sucesso, limpa tudo e fecha ---------- */
  let timerSucesso;
  function mostrarSucesso(link) {
    // guarda o nome antes de limpar, para a mensagem ficar pessoal
    const primeiroNome = $("#f-nome").value.trim().split(" ")[0];
    $("#sucesso-nome").textContent = primeiroNome ? `Obrigada, ${primeiroNome}!` : "Obrigada!";
    $("#sucesso-reenviar").href = link; // caso o WhatsApp não tenha aberto

    // limpa carrinho e formulário
    carrinho = [];
    salvar();
    $("#form-pedido").reset();
    $("#bloco-entrega").hidden = true;
    document.querySelectorAll("#form-pedido [aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    document.querySelectorAll("#form-pedido .erro").forEach((el) => (el.textContent = ""));
    renderCarrinho();

    // mostra a tela de sucesso no lugar do conteúdo da gaveta
    $("#vazio").hidden = true;
    $("#sucesso").hidden = false;
    $("#sucesso").focus();

    // fecha sozinha depois de alguns segundos
    clearTimeout(timerSucesso);
    timerSucesso = setTimeout(() => { if (!$("#carrinho").hidden) fecharCarrinho(); }, 6000);
  }

  iniciar();
})();
