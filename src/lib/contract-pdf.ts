"use client";

export function slugifyFilePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40);
}

export type ContractPdfData = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone: string;
  email: string;
  responsavel: string;
  cpfResponsavel: string;
  freezerMarca: string;
  freezerModelo: string;
  freezerSerie: string;
  freezerPatrimonio: string;
  freezerCor: string;
  freezerValor: string;
  freezerEstado: string;
  exclusividade: boolean;
  compraMinima: string;
  periodoCompra: string;
  diasSemCompra: string;
  dataInicio: string;
  prazoIndeterminado: boolean;
  dataFinal: string;
  cidadeAssinatura: string;
  dataAssinatura: string;
};

type RGB = [number, number, number];

const DARK: RGB = [0, 74, 128];
const MEDIUM: RGB = [0, 160, 227];
const ICE: RGB = [232, 247, 255];
const TEXT: RGB = [26, 38, 51];
const MUTED: RGB = [122, 133, 146];
const LINE: RGB = [150, 160, 175];
const WHITE: RGB = [255, 255, 255];

type Field = { label: string; value: string };

/**
 * Gera o PDF do contrato de comodato em texto vetorial (A4).
 * O arquivo contém SOMENTE o contrato, sem nada do site, e traz campos
 * editáveis para o comércio preencher/assinar e devolver.
 */
export async function contractPdfBlob(data: ContractPdfData) {
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const M = 14;
  const CW = pageW - M * 2;
  const TOP = 16;
  const BOTTOM = pageH - 16;
  let y = TOP;

  const font = (size: number, style: "normal" | "bold" = "normal", color: RGB = TEXT) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const fill = (color: RGB) => pdf.setFillColor(color[0], color[1], color[2]);
  const stroke = (color: RGB, w = 0.2) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(w);
  };

  const newPage = () => {
    pdf.addPage();
    y = TOP + 6;
  };

  const ensure = (needed: number) => {
    if (y + needed > BOTTOM) newPage();
  };

  // Cabeçalho (apenas na 1ª página)
  const drawHeader = () => {
    fill(DARK);
    pdf.rect(0, 0, pageW, 24, "F");
    font(19, "bold", WHITE);
    pdf.text("Z-ICE GELO", M, 15.5);
    font(8, "normal", WHITE);
    pdf.text("CNPJ 067.962.086/0001-04", pageW - M, 10, { align: "right" });
    pdf.text("Rua Lauro Zimmermann, 4450 - Guaramirim/SC", pageW - M, 14.5, { align: "right" });
    pdf.text("Fone (47) 99647-1803", pageW - M, 19, { align: "right" });
    y = 34;
  };

  const drawTitle = () => {
    font(13.5, "bold", DARK);
    pdf.text("CONTRATO DE COMODATO DE FREEZER", pageW / 2, y, { align: "center" });
    y += 2.6;
    stroke(DARK, 0.6);
    pdf.line(M, y, pageW - M, y);
    y += 8;
  };

  const paragraph = (
    text: string,
    opts?: { size?: number; bold?: boolean; gap?: number }
  ) => {
    const size = opts?.size ?? 9.2;
    font(size, opts?.bold ? "bold" : "normal", TEXT);
    const lines = pdf.splitTextToSize(text, CW) as string[];
    const lh = size * 0.43;
    if (y + lines.length * lh <= BOTTOM) {
      pdf.text(text, M, y, { align: "justify", maxWidth: CW });
      y += lines.length * lh;
    } else {
      lines.forEach((line) => {
        ensure(lh);
        pdf.text(line, M, y);
        y += lh;
      });
    }
    y += opts?.gap ?? 0;
  };

  const section = (num: number, title: string) => {
    ensure(17);
    const bandTop = y;
    fill(ICE);
    pdf.rect(M, bandTop, CW, 7.5, "F");
    fill(MEDIUM);
    pdf.rect(M, bandTop, 1.4, 7.5, "F");
    font(9.5, "bold", DARK);
    pdf.text(`${num}. ${title.toUpperCase()}`, M + 4.5, bandTop + 5);
    y = bandTop + 7.5 + 4;
  };

  const fieldRow = (items: Field[], cols = items.length) => {
    const gap = 6;
    const colW = (CW - gap * (cols - 1)) / cols;
    const need = 11.5;
    ensure(need);
    const top = y;
    items.forEach((item, i) => {
      const x = M + i * (colW + gap);
      font(6.8, "normal", MUTED);
      pdf.text(item.label.toUpperCase(), x, top + 3);
      font(9.6, "normal", TEXT);
      const first = (pdf.splitTextToSize(item.value || " ", colW)[0] as string) || " ";
      pdf.text(first, x, top + 8.2);
      stroke(LINE, 0.2);
      pdf.line(x, top + 9.6, x + colW, top + 9.6);
    });
    y = top + need + 0.5;
  };

  // Campo editável (AcroForm) que o comércio pode preencher no PDF
  const addTextField = (opts: {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    value?: string;
    fontSize?: number;
  }) => {
    try {
      const AcroForm = (
        pdf as unknown as {
          AcroForm?: { TextField?: () => Record<string, unknown> };
        }
      ).AcroForm;
      if (!AcroForm?.TextField) return;

      const field = AcroForm.TextField() as Record<string, unknown>;
      field.fieldName = opts.name;
      field.x = opts.x;
      field.y = opts.y;
      field.width = opts.width;
      field.height = opts.height;
      field.fontSize = opts.fontSize ?? 10.5;
      field.value = opts.value ?? "";
      field.defaultValue = opts.value ?? "";
      field.multiline = true;
      field.textAlign = "left";
      field.readOnly = false;
      (
        pdf as unknown as { addField: (f: Record<string, unknown>) => void }
      ).addField(field);
    } catch {
      /* visualizador/versão sem suporte a campos de formulário */
    }
  };

  const editableRow = (label: string, value: string, fieldName: string) => {
    ensure(15);
    const top = y;
    font(7.4, "normal", MUTED);
    pdf.text(label.toUpperCase(), M, top + 3);
    addTextField({
      name: fieldName,
      x: M,
      y: top + 4.6,
      width: CW,
      height: 7,
      value,
      fontSize: 10.5,
    });
    stroke(LINE, 0.2);
    pdf.line(M, top + 12, M + CW, top + 12);
    y = top + 14.5;
  };

  const signatures = () => {
    ensure(42);
    const gap = 12;
    const colW = (CW - gap) / 2;
    const lineY = y + 20;
    stroke([70, 70, 70], 0.3);
    pdf.line(M, lineY, M + colW, lineY);
    pdf.line(M + colW + gap, lineY, pageW - M, lineY);

    font(9, "bold", TEXT);
    pdf.text("Z-ICE GELO - Comodante", M + colW / 2, lineY + 4.6, { align: "center" });
    font(7.5, "normal", MUTED);
    pdf.text("CNPJ 067.962.086/0001-04", M + colW / 2, lineY + 8.6, { align: "center" });

    font(9, "bold", TEXT);
    pdf.text(data.responsavel || "Comodatário", M + colW + gap + colW / 2, lineY + 4.6, {
      align: "center",
    });
    font(7.5, "normal", MUTED);
    pdf.text(
      `CPF: ${data.cpfResponsavel || "__________"}`,
      M + colW + gap + colW / 2,
      lineY + 8.6,
      { align: "center" }
    );

    y = lineY + 14;
  };

  // ---------- Conteúdo ----------
  drawHeader();
  drawTitle();

  paragraph(
    "Pelo presente instrumento particular, de um lado, Z-ICE GELO, inscrita no CNPJ sob nº " +
      "067.962.086/0001-04, com endereço na Rua Lauro Zimmermann, 4450, doravante denominada " +
      "COMODANTE; e, de outro lado, o estabelecimento identificado abaixo, doravante denominado " +
      "COMODATÁRIO, celebram o presente Contrato de Comodato de Freezer, mediante as cláusulas seguintes.",
    { gap: 5 }
  );

  section(1, "Dados do Comodatário");
  fieldRow([{ label: "Razão social / Nome empresarial", value: data.razaoSocial }], 1);
  fieldRow([
    { label: "Nome fantasia", value: data.nomeFantasia },
    { label: "CNPJ / CPF", value: data.cnpj },
  ]);
  fieldRow([{ label: "Endereço completo do estabelecimento", value: data.endereco }], 1);
  fieldRow([
    { label: "Cidade / UF", value: `${data.cidade}${data.uf ? " / " + data.uf : ""}` },
    { label: "Telefone / WhatsApp", value: data.telefone },
  ]);
  fieldRow([
    { label: "E-mail", value: data.email },
    { label: "Responsável pelo estabelecimento", value: data.responsavel },
  ]);
  fieldRow([{ label: "CPF do responsável", value: data.cpfResponsavel }], 1);
  y += 4;

  section(2, "Identificação do Freezer");
  fieldRow([
    { label: "Marca", value: data.freezerMarca },
    { label: "Modelo", value: data.freezerModelo },
  ]);
  fieldRow([
    { label: "Nº de série", value: data.freezerSerie },
    { label: "Patrimônio Z-ICE", value: data.freezerPatrimonio },
  ]);
  fieldRow([
    { label: "Cor / Características", value: data.freezerCor },
    { label: "Valor de referência (R$)", value: data.freezerValor },
  ]);
  fieldRow([{ label: "Estado na entrega", value: data.freezerEstado }], 1);
  y += 4;

  section(3, "Objeto e Finalidade");
  paragraph(
    "Cláusula 1ª - Objeto. A COMODANTE entrega ao COMODATÁRIO, em comodato gratuito, o freezer " +
      "identificado neste instrumento. O equipamento permanece de propriedade exclusiva da Z-ICE GELO, " +
      "não ocorrendo venda ou transferência de propriedade.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 2ª - Finalidade. O freezer será utilizado para armazenamento, conservação e exposição de " +
      "gelo e deverá permanecer no endereço informado neste contrato, salvo autorização escrita da COMODANTE.",
    { gap: 4 }
  );

  section(4, "Utilização Comercial");
  paragraph(
    "Cláusula 3ª - Produtos Z-ICE. O equipamento deverá ser destinado prioritariamente aos produtos " +
      "fornecidos pela Z-ICE GELO. Caso as partes acordem exclusividade, o freezer deverá armazenar " +
      "exclusivamente produtos da marca Z-ICE GELO, salvo autorização prévia e escrita da COMODANTE.",
    { gap: 3 }
  );
  paragraph(
    `Exclusividade comercial: ${data.exclusividade ? "SIM" : "NÃO"}`,
    { size: 9, bold: true, gap: 3 }
  );
  fieldRow([
    { label: "Compra mínima", value: data.compraMinima },
    { label: "Período", value: data.periodoCompra },
    { label: "Dias sem compra p/ devolução", value: data.diasSemCompra },
  ]);
  y += 3;
  paragraph(
    "Cláusula 4ª - Compras. O COMODATÁRIO compromete-se a manter relacionamento comercial regular com a " +
      "Z-ICE GELO enquanto permanecer com o freezer. Caso exista compra mínima preenchida acima, seu " +
      "descumprimento reiterado ou a ausência de compras pelo período indicado poderão ensejar solicitação " +
      "de devolução do equipamento.",
    { gap: 4 }
  );

  section(5, "Conservação, Energia e Manutenção");
  paragraph(
    "Cláusula 5ª - Conservação. O COMODATÁRIO deverá utilizar corretamente o equipamento, mantê-lo limpo " +
      "e em boas condições, não remover adesivos, identificações ou logotipos sem autorização, não realizar " +
      "alterações elétricas ou mecânicas e comunicar imediatamente qualquer defeito ou problema.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 6ª - Energia elétrica. O consumo de energia e a disponibilização da instalação elétrica " +
      "adequada e segura serão de responsabilidade do COMODATÁRIO.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 7ª - Manutenção. Defeitos decorrentes de desgaste natural serão avaliados pela Z-ICE GELO. " +
      "Danos decorrentes de mau uso, negligência, acidentes, instalação elétrica inadequada ou alteração não " +
      "autorizada poderão ser cobrados do COMODATÁRIO. Reparos por terceiros dependem de autorização prévia " +
      "da COMODANTE.",
    { gap: 4 }
  );

  section(6, "Perda, Furto, Roubo e Danos");
  paragraph(
    "Cláusula 8ª. Em caso de furto, roubo, desaparecimento, incêndio ou dano relevante, o COMODATÁRIO " +
      "deverá comunicar a Z-ICE GELO assim que tiver conhecimento. Quando houver responsabilidade comprovada " +
      "do COMODATÁRIO, poderá ser exigido o reparo ou a reposição do equipamento, consideradas as " +
      "circunstâncias do fato.",
    { gap: 4 }
  );

  section(7, "Fiscalização e Proibição de Transferência");
  paragraph(
    "Cláusula 9ª. A Z-ICE GELO poderá verificar as condições de conservação, funcionamento e utilização do " +
      "freezer, mediante contato prévio quando possível.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 10ª. É proibido ao COMODATÁRIO vender, ceder, emprestar, locar, transferir, oferecer em " +
      "garantia ou de qualquer forma dispor do freezer, que permanece de propriedade da Z-ICE GELO.",
    { gap: 4 }
  );

  section(8, "Prazo, Devolução e Rescisão");
  fieldRow([
    { label: "Data de início", value: data.dataInicio },
    { label: "Prazo", value: data.prazoIndeterminado ? "Indeterminado" : "Determinado" },
    { label: "Data final (se houver)", value: data.dataFinal },
  ]);
  y += 3;
  paragraph(
    "Cláusula 11ª - Prazo. O contrato inicia na data indicada acima e vigorará pelo prazo assinalado. " +
      "Enquanto o equipamento permanecer no estabelecimento, permanecem válidas as obrigações das partes.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 12ª - Devolução. A Z-ICE GELO poderá solicitar a devolução do freezer em caso de encerramento " +
      "da relação comercial, falha de compras conforme este contrato, uso inadequado, descumprimento " +
      "contratual, encerramento das atividades, transferência do estabelecimento ou outro motivo razoável. " +
      "Nessas condições, as partes combinarão data para retirada, e o equipamento deverá ser devolvido em " +
      "condições compatíveis com o uso normal, ressalvado o desgaste natural.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 13ª - Transferência do estabelecimento. A venda, cessação ou troca de responsável pelo " +
      "estabelecimento não transfere automaticamente este contrato. O COMODATÁRIO deverá informar a Z-ICE " +
      "GELO para retirada do freezer ou celebração de novo instrumento com o novo responsável.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 14ª - Identidade visual. O COMODATÁRIO autoriza a permanência de adesivos, logomarca e " +
      "materiais promocionais da Z-ICE GELO instalados no equipamento, sem que isso implique alteração ou " +
      "utilização sem autorização.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 15ª - Rescisão. O contrato poderá ser encerrado por qualquer das partes. Com o encerramento, " +
      "o freezer deverá ser disponibilizado para retirada pela Z-ICE GELO, sem gerar direito de propriedade " +
      "ou retenção do equipamento.",
    { gap: 4 }
  );

  section(9, "Assinatura Eletrônica e Disposições Gerais");
  paragraph(
    "Cláusula 16ª - Assinatura. As partes poderão assinar este instrumento de forma manuscrita ou " +
      "eletrônica. A versão assinada e devolvida por meio digital será considerada válida e eficaz entre as " +
      "partes.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 17ª - Disposições gerais. Quaisquer alterações deste contrato deverão ser realizadas por " +
      "escrito e acatadas pelas partes. A tolerância eventual quanto a qualquer obrigação não implica " +
      "renúncia aos direitos previstos neste instrumento.",
    { gap: 2.5 }
  );
  paragraph(
    "Cláusula 18ª - Foro. Eventuais controvérsias serão submetidas ao foro juridicamente competente, " +
      "observadas as regras legais aplicáveis.",
    { gap: 3 }
  );
  fieldRow([
    { label: "Cidade de assinatura", value: data.cidadeAssinatura },
    { label: "Data de assinatura", value: data.dataAssinatura },
  ]);
  y += 6;

  section(10, "Preenchimento e assinatura do comodatário");
  paragraph(
    "Os campos abaixo podem ser preenchidos diretamente neste PDF (clique e digite). Depois de preencher e " +
      "assinar, salve o arquivo e devolva para a Z-ICE GELO.",
    { size: 9, gap: 4 }
  );
  editableRow("Nome completo do responsável", data.responsavel, "comodatario_nome");
  editableRow("CPF do responsável", data.cpfResponsavel, "comodatario_cpf");
  editableRow("Assinatura (digite seu nome completo)", "", "comodatario_assinatura");
  editableRow("Data da assinatura", data.dataAssinatura, "comodatario_data");

  y += 3;
  paragraph("E por estarem de acordo, as partes assinam o presente instrumento.", {
    size: 9.2,
    gap: 6,
  });
  signatures();

  // Rodapé em todas as páginas
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    fill(DARK);
    pdf.rect(0, pageH - 10, pageW, 10, "F");
    font(7.5, "normal", WHITE);
    pdf.text("Z-ICE GELO - Contrato de comodato de freezer", M, pageH - 4);
    pdf.text(`Página ${p} de ${total}`, pageW - M, pageH - 4, { align: "right" });
  }

  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
