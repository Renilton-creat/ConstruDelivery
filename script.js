
"use strict";

// ======================================
// CONSTRUDELIVERY - SISTEMA COMPLETO
// ======================================

const WHATSAPP_LOJA = "5563999570763";
const CHAVE = "construdelivery_produtos";

// PRODUTOS DE DEMONSTRAÇÃO
const produtosIniciais = [
  {
    id: "1",
    nome: "Cimento CP II 50 kg",
    descricao: "Saco de cimento de 50 kg",
    categoria: "Cimento",
    preco: 39.90,
    estoque: 100,
    imagem: ""
  },
  {
    id: "2",
    nome: "Areia média - m³",
    descricao: "Areia média para construção",
    categoria: "Areia e brita",
    preco: 180.00,
    estoque: 30,
    imagem: ""
  },
  {
    id: "3",
    nome: "Brita 1 - m³",
    descricao: "Brita para concreto",
    categoria: "Areia e brita",
    preco: 220.00,
    estoque: 20,
    imagem: ""
  },
  {
    id: "4",
    nome: "Tijolo cerâmico",
    descricao: "Tijolo para alvenaria",
    categoria: "Alvenaria",
    preco: 1.20,
    estoque: 5000,
    imagem: ""
  },
  {
    id: "5",
    nome: "Argamassa 20 kg",
    descricao: "Argamassa para assentamento",
    categoria: "Revestimentos",
    preco: 24.90,
    estoque: 80,
    imagem: ""
  },
  {
    id: "6",
    nome: "Tinta acrílica 18 L",
    descricao: "Tinta para paredes",
    categoria: "Tintas",
    preco: 189.00,
    estoque: 40,
    imagem: ""
  }
];

// ======================================
// FUNÇÕES AUXILIARES
// ======================================

function elemento(id) {
  return document.getElementById(id);
}

function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function gerarId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString() +
    Math.random().toString(36).slice(2);
}

function carregarProdutos() {
  try {
    const dados = localStorage.getItem(CHAVE);

    if (dados === null) {
      const iniciais = produtosIniciais.map(
        produto => ({ ...produto })
      );

      localStorage.setItem(
        CHAVE,
        JSON.stringify(iniciais)
      );

      return iniciais;
    }

    const lista = JSON.parse(dados);

    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    return [];
  }
}

function salvarProdutos(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

let produtos = carregarProdutos();
const carrinho = {};

// ======================================
// CATÁLOGO DE PRODUTOS
// ======================================

function mostrarProdutos() {
  const lista = elemento("lista-produtos");

  if (!lista) return;

  produtos = carregarProdutos();
  lista.innerHTML = "";

  if (produtos.length === 0) {
    lista.textContent =
      "Nenhum produto cadastrado no momento.";
    return;
  }

  produtos.forEach(produto => {
    const card = document.createElement("article");
    card.className = "produto";

    if (produto.imagem) {
      const imagem = document.createElement("img");
      imagem.src = produto.imagem;
      imagem.alt = produto.nome;
      imagem.className = "foto-produto";
      card.appendChild(imagem);
    } else {
      const icone = document.createElement("div");
      icone.className = "emoji";
      icone.textContent = "🏗️";
      card.appendChild(icone);
    }

    const titulo = document.createElement("h3");
    titulo.textContent = produto.nome;
    card.appendChild(titulo);

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao || "";
    card.appendChild(descricao);

    const categoria = document.createElement("p");
    categoria.textContent = produto.categoria;
    card.appendChild(categoria);

    const preco = document.createElement("h3");
    preco.textContent = moeda(produto.preco);
    card.appendChild(preco);

    const estoque = document.createElement("p");
    estoque.textContent =
      "Estoque: " + produto.estoque;
    card.appendChild(estoque);

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Adicionar ao carrinho";
    botao.disabled = Number(produto.estoque) <= 0;

    botao.addEventListener("click", () => {
      adicionarCarrinho(produto.id);
    });

    card.appendChild(botao);
    lista.appendChild(card);
  });
}

// ======================================
// CARRINHO DE COMPRAS
// ======================================

function adicionarCarrinho(id) {
  const produto = produtos.find(
    item => String(item.id) === String(id)
  );

  if (!produto) return;

  const quantidade = carrinho[id] || 0;

  if (quantidade >= Number(produto.estoque)) {
    alert("Quantidade indisponível em estoque.");
    return;
  }

  carrinho[id] = quantidade + 1;
  atualizarCarrinho();
}

function removerCarrinho(id) {
  if (!carrinho[id]) return;

  carrinho[id]--;

  if (carrinho[id] <= 0) {
    delete carrinho[id];
  }

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = elemento("itens-carrinho");
  const totalElemento = elemento("total");

  if (!lista || !totalElemento) return;

  lista.innerHTML = "";

  let total = 0;
  let quantidadeItens = 0;

  produtos.forEach(produto => {
    const quantidade = carrinho[produto.id] || 0;

    if (quantidade === 0) return;

    quantidadeItens += quantidade;

    const subtotal =
      Number(produto.preco) * quantidade;

    total += subtotal;

    const item = document.createElement("div");
    item.className = "item-carrinho";

    const descricao = document.createElement("span");
    descricao.textContent =
      `${quantidade}x ${produto.nome} - ${moeda(subtotal)}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Remover 1";

    botao.addEventListener("click", () => {
      removerCarrinho(produto.id);
    });

    item.appendChild(descricao);
    item.appendChild(botao);
    lista.appendChild(item);
  });

  if (quantidadeItens === 0) {
    lista.textContent = "Seu carrinho está vazio.";
  }

  totalElemento.textContent =
    "Subtotal: " + moeda(total);
}

// ======================================
// PEDIDO PELO WHATSAPP
// ======================================

function configurarPedido() {
  const form = elemento("form-pedido");

  if (!form) return;

  form.addEventListener("submit", evento => {
    evento.preventDefault();

    produtos = carregarProdutos();

    const selecionados = produtos.filter(
      produto => carrinho[produto.id] > 0
    );

    if (selecionados.length === 0) {
      alert("Adicione pelo menos um produto.");
      return;
    }

    for (const produto of selecionados) {
      if (
        carrinho[produto.id] >
        Number(produto.estoque)
      ) {
        alert(
          "Estoque insuficiente: " + produto.nome
        );
        mostrarProdutos();
        atualizarCarrinho();
        return;
      }
    }

    const nome = elemento("nome").value.trim();
    const telefone = elemento("telefone").value.trim();
    const regiao = elemento("regiao").value;
    const endereco = elemento("endereco").value.trim();

    let total = 0;

    const itens = selecionados.map(produto => {
      const quantidade = carrinho[produto.id];

      const subtotal =
        quantidade * Number(produto.preco);

      total += subtotal;

      return (
        `${quantidade}x ${produto.nome} - ` +
        moeda(subtotal)
      );
    });

    const mensagem = [
      "*CONSTRUDELIVERY - SOLICITAÇÃO DE ORÇAMENTO*",
      "",
      "Cliente: " + nome,
      "Telefone: " + telefone,
      "Região: " + regiao,
      "Endereço: " + endereco,
      "",
      "*Materiais solicitados:*",
      ...itens,
      "",
      "Subtotal estimado: " + moeda(total),
      "",
      "Frete, preços e disponibilidade a confirmar."
    ].join("\n");

    const url =
      "https://wa.me/" +
      WHATSAPP_LOJA +
      "?text=" +
      encodeURIComponent(mensagem);

    window.open(url, "_blank");
  });
}

// ======================================
// PAINEL ADMINISTRATIVO
// ======================================

function configurarAdmin() {
  const form = elemento("form-produto");

  if (!form) return;

  const campoId = elemento("produto-id");
  const campoNome = elemento("produto-nome");
  const campoDescricao = elemento("produto-descricao");
  const campoCategoria = elemento("produto-categoria");
  const campoPreco = elemento("produto-preco");
  const campoEstoque = elemento("produto-estoque");
  const campoImagem = elemento("produto-imagem");
  const preview = elemento("preview-imagem");
  const mensagem = elemento("mensagem-admin");
  const listaAdmin = elemento("lista-admin");
  const cancelar = elemento("cancelar-edicao");

  let imagemAtual = "";
  let processandoImagem = false;
  let versaoImagem = 0;

  function avisar(texto) {
    if (mensagem) {
      mensagem.textContent = texto;
    }

    console.log(texto);
  }

  function limparFormulario() {
    versaoImagem++;
    processandoImagem = false;

    form.reset();
    campoId.value = "";
    imagemAtual = "";

    if (preview) {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
  }

  function processarImagem(arquivo) {
    return new Promise((resolve, reject) => {
      if (
        !["image/jpeg", "image/png", "image/webp"]
          .includes(arquivo.type)
      ) {
        reject(new Error("Formato de imagem inválido."));
        return;
      }

      const url = URL.createObjectURL(arquivo);
      const imagem = new Image();

      imagem.onload = () => {
        try {
          const escala = Math.min(
            1,
            600 / Math.max(imagem.width, imagem.height)
          );

          const canvas = document.createElement("canvas");

          canvas.width = Math.max(
            1,
            Math.round(imagem.width * escala)
          );

          canvas.height = Math.max(
            1,
            Math.round(imagem.height * escala)
          );

          const contexto = canvas.getContext("2d");

          if (!contexto) {
            throw new Error("Canvas indisponível.");
          }

          contexto.fillStyle = "#ffffff";
          contexto.fillRect(
            0, 0, canvas.width, canvas.height
          );

          contexto.drawImage(
            imagem, 0, 0,
            canvas.width, canvas.height
          );

          const resultado =
            canvas.toDataURL("image/jpeg", 0.65);

          URL.revokeObjectURL(url);
          resolve(resultado);
        } catch (erro) {
          URL.revokeObjectURL(url);
          reject(erro);
        }
      };

      imagem.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Não foi possível abrir a imagem."));
      };

      imagem.src = url;
    });
  }

  if (campoImagem) {
    campoImagem.addEventListener("change", async () => {
      const arquivo = campoImagem.files[0];

      if (!arquivo) return;

      const versao = ++versaoImagem;
      processandoImagem = true;

      avisar("Processando fotografia...");

      try {
        const resultado = await processarImagem(arquivo);

        if (versao !== versaoImagem) return;

        imagemAtual = resultado;

        if (preview) {
          preview.src = resultado;
          preview.style.display = "block";
        }

        avisar("Fotografia carregada.");
      } catch (erro) {
        if (versao !== versaoImagem) return;

        campoImagem.value = "";
        avisar(erro.message);
      } finally {
        if (versao === versaoImagem) {
          processandoImagem = false;
        }
      }
    });
  }

  // LISTAGEM NO PAINEL
  function listarAdmin() {
    if (!listaAdmin) return;

    produtos = carregarProdutos();
    listaAdmin.innerHTML = "";

    if (produtos.length === 0) {
      listaAdmin.textContent =
        "Nenhum produto cadastrado.";
      return;
    }

    produtos.forEach(produto => {
      const card = document.createElement("article");
      card.className = "produto";

      if (produto.imagem) {
        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.className = "foto-produto";
        card.appendChild(imagem);
      }

      const nome = document.createElement("h3");
      nome.textContent = produto.nome;
      card.appendChild(nome);

      const descricao = document.createElement("p");
      descricao.textContent = produto.descricao || "";
      card.appendChild(descricao);

      const categoria = document.createElement("p");
      categoria.textContent = produto.categoria;
      card.appendChild(categoria);

      const preco = document.createElement("h3");
      preco.textContent = moeda(produto.preco);
      card.appendChild(preco);

      const estoque = document.createElement("p");
      estoque.textContent =
        "Estoque: " + produto.estoque;
      card.appendChild(estoque);

      const editar = document.createElement("button");
      editar.type = "button";
      editar.textContent = "Editar";

      editar.addEventListener("click", () => {
        editarProduto(produto.id);
      });

      const excluir = document.createElement("button");
      excluir.type = "button";
      excluir.textContent = "Excluir";

      excluir.addEventListener("click", () => {
        excluirProduto(produto.id);
      });

      card.appendChild(editar);
      card.appendChild(excluir);
      listaAdmin.appendChild(card);
    });
  }

  // EDITAR PRODUTO
  function editarProduto(id) {
    produtos = carregarProdutos();

    const produto = produtos.find(
      item => String(item.id) === String(id)
    );

    if (!produto) return;

    versaoImagem++;
    processandoImagem = false;

    campoId.value = produto.id;
    campoNome.value = produto.nome;

    if (campoDescricao) {
      campoDescricao.value = produto.descricao || "";
    }

    campoCategoria.value = produto.categoria;
    campoPreco.value = produto.preco;
    campoEstoque.value = produto.estoque;

    if (campoImagem) {
      campoImagem.value = "";
    }

    imagemAtual = produto.imagem || "";

    if (preview) {
      if (imagemAtual) {
        preview.src = imagemAtual;
        preview.style.display = "block";
      } else {
        preview.removeAttribute("src");
        preview.style.display = "none";
      }
    }

    avisar("Editando: " + produto.nome);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // EXCLUIR PRODUTO
  function excluirProduto(id) {
    const confirmar = confirm(
      "Deseja realmente excluir este produto?"
    );

    if (!confirmar) return;

    try {
      const atualizados = carregarProdutos().filter(
        produto => String(produto.id) !== String(id)
      );

      salvarProdutos(atualizados);
      produtos = atualizados;

      limparFormulario();
      listarAdmin();
      avisar("Produto excluído com sucesso!");
    } catch (erro) {
      console.error(erro);
      avisar("Erro ao excluir produto.");
    }
  }

  // SALVAR PRODUTO
  form.addEventListener("submit", evento => {
    evento.preventDefault();

    const id = campoId.value;
    const nome = campoNome.value.trim();

    const descricao = campoDescricao
      ? campoDescricao.value.trim()
      : "";

    const categoria = campoCategoria.value;
    const preco = Number(campoPreco.value);
    const estoque = Number(campoEstoque.value);

    if (
      !nome ||
      !categoria ||
      !Number.isFinite(preco) ||
      preco <= 0 ||
      !Number.isInteger(estoque) ||
      estoque < 0
    ) {
      avisar("Verifique os dados do produto.");
      return;
    }

    if (processandoImagem) {
      avisar("Aguarde o processamento da fotografia.");
      return;
    }

    const produto = {
      id: id || gerarId(),
      nome,
      descricao,
      categoria,
      preco,
      estoque,
      imagem: imagemAtual
    };

    try {
      const lista = carregarProdutos();

      const indice = lista.findIndex(
        item => String(item.id) === String(id)
      );

      if (id && indice === -1) {
        avisar("Produto não encontrado para edição.");
        return;
      }

      if (indice >= 0) {
        lista[indice] = produto;
      } else {
        lista.push(produto);
      }

      salvarProdutos(lista);
      produtos = lista;

      limparFormulario();
      listarAdmin();

      avisar("Produto salvo com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar:", erro);

      avisar(
        "Não foi possível salvar. " +
        "Verifique o armazenamento do navegador."
      );
    }
  });

  if (cancelar) {
    cancelar.addEventListener(
      "click",
      limparFormulario
    );
  }

  listarAdmin();
}

// ======================================
// INICIALIZAÇÃO DO SISTEMA
// ======================================

function iniciarSistema() {
  if (elemento("lista-produtos")) {
    mostrarProdutos();
    atualizarCarrinho();
    configurarPedido();
  }

  if (elemento("form-produto")) {
    configurarAdmin();
  }

  console.log("ConstruDelivery iniciado com sucesso.");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
  );
} else {
  iniciarSistema();
}

// Atualizar catálogo quando o armazenamento
// for alterado em outra aba do navegador.
window.addEventListener("storage", evento => {
  if (evento.key === CHAVE) {
    produtos = carregarProdutos();
    mostrarProdutos();
    atualizarCarrinho();
  }
});
