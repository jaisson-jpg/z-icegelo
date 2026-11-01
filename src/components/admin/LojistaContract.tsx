"use client";

import { useState } from "react";
import { Download, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { contractPdfBlob, downloadBlob, slugifyFilePart } from "@/lib/contract-pdf";

type FreezerData = {
  id: string;
  code: string;
  brand: string | null;
  location: string;
  address: string | null;
};

type LojistaContractData = {
  id: string;
  businessName: string;
  cnpj: string | null;
  address: string;
  city: string;
  state: string;
  user: { name: string; email: string; phone: string | null };
  freezers: FreezerData[];
};

export function LojistaContract({ lojista }: { lojista: LojistaContractData }) {
  const today = new Date().toLocaleDateString("pt-BR");

  const [form, setForm] = useState({
    razaoSocial: lojista.businessName,
    nomeFantasia: lojista.businessName,
    cnpj: lojista.cnpj || "",
    endereco: lojista.address,
    cidade: lojista.city,
    uf: lojista.state,
    telefone: lojista.user.phone || "",
    email: lojista.user.email,
    responsavel: lojista.user.name,
    cpfResponsavel: "",
    freezerMarca: lojista.freezers[0]?.brand || "",
    freezerModelo: "",
    freezerSerie: lojista.freezers[0]?.code || "",
    freezerPatrimonio: "",
    freezerCor: "BRANCO ADESIVADO",
    freezerValor: "",
    freezerEstado: "OK",
    exclusividade: true,
    compraMinima: "",
    periodoCompra: "por semana",
    diasSemCompra: "",
    dataInicio: today,
    prazoIndeterminado: true,
    dataFinal: "",
    cidadeAssinatura: lojista.city || "Guaramirim",
    dataAssinatura: today,
  });

  const [busy, setBusy] = useState<"pdf" | "whatsapp" | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pdfFilename = () => {
    const who = slugifyFilePart(form.nomeFantasia || lojista.businessName) || "lojista";
    return `contrato-comodato-${who}.pdf`;
  };

  const buildPdf = async () => {
    const el = pageRef.current;
    if (!el) throw new Error("Contrato não encontrado na tela");
    return contractToPdfBlob(el);
  };

  const handleDownloadPdf = async () => {
    setBusy("pdf");
    try {
      const blob = await buildPdf();
      downloadBlob(blob, pdfFilename());
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setBusy(null);
    }
  };

  const handleWhatsApp = async () => {
    const digits = form.telefone.replace(/\D/g, "");

    setBusy("whatsapp");
    try {
      const blob = await buildPdf();
      const file = new File([blob], pdfFilename(), { type: "application/pdf" });
      const message =
        `Olá ${form.responsavel}! Segue o Contrato de Comodato de Freezer da Z-ICE GELO para análise e assinatura.\n\n` +
        `Estabelecimento: ${form.nomeFantasia}\n` +
        `Freezer: ${form.freezerMarca || "—"} — Série: ${form.freezerSerie || "—"}\n\n` +
        `Por favor, assine e me devolva o mesmo PDF. Obrigado!`;

      const canShareFile =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          files: [file],
          title: "Contrato de Comodato Z-ICE GELO",
          text: message,
        });
        return;
      }

      downloadBlob(blob, pdfFilename());
      const waTarget =
        digits.length >= 10 ? (digits.startsWith("55") ? digits : `55${digits}`) : "";
      window.open(`https://wa.me/${waTarget}?text=${encodeURIComponent(message)}`, "_blank");
      alert(
        "O PDF do contrato foi baixado (somente o contrato, sem nenhum dado do site). No WhatsApp que abrir, anexe esse arquivo PDF. Não envie print/foto da tela."
      );
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      console.error(err);
      alert("Não foi possível gerar o PDF para envio.");
    } finally {
      setBusy(null);
    }
  };

  const fieldClass =
    "contract-field w-full border-b border-gray-400 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:border-[var(--zice-medium)] print:border-gray-500";

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Barra de ações (oculta na impressão) */}
      <div className="capture-ignore print:hidden sticky top-0 z-50 bg-[var(--zice-dark)] text-white p-3 flex flex-wrap gap-2 justify-center items-center shadow-lg">
        <Link
          href={`/admin/lojistas/${lojista.id}`}
          className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-bold disabled:opacity-50"
        >
          <MessageCircle size={16} /> {busy === "whatsapp" ? "Gerando PDF..." : "Enviar contrato"}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-white text-[var(--zice-dark)] font-bold hover:bg-gray-100 disabled:opacity-50"
        >
          <Download size={16} /> {busy === "pdf" ? "Gerando PDF..." : "Baixar PDF"}
        </button>
        <p className="w-full text-center text-[11px] text-white/80">
          Edite os campos do contrato e depois clique em Baixar PDF ou Enviar. O arquivo gerado contém somente o contrato — sem menu, topo ou rodapé do site.
        </p>
      </div>

      {/* Contrato */}
      <div className="contract-page max-w-[800px] mx-auto bg-white my-6 shadow-xl print:shadow-none print:my-0 print:max-w-full">
        {/* Cabeçalho */}
        <div className="bg-[var(--zice-dark)] text-white p-5 flex items-center justify-between print:bg-[var(--zice-dark)]">
          <div>
            <h1 className="text-2xl font-black tracking-wide">Z-ICE GELO</h1>
          </div>
          <div className="text-right text-xs leading-relaxed">
            <p>CNPJ 067.962.086/0001-04</p>
            <p>Rua Lauro Zimmermann, 4450</p>
          </div>
        </div>

        <div className="p-8 space-y-6 text-[13px] text-gray-800 leading-relaxed">
          {/* Título */}
          <h2 className="text-center text-base font-black uppercase tracking-wider border-b-2 border-[var(--zice-dark)] pb-2">
            Contrato de Comodato de Freezer
          </h2>

          {/* Introdução */}
          <p className="text-justify">
            Pelo presente instrumento particular, de um lado, Z-ICE GELO, inscrita no CNPJ sob nº
            067.962.086/0001-04, com endereço na Rua Lauro Zimmermann, 4450, doravante denominada{" "}
            <strong>COMODANTE</strong>; e, de outro lado, o estabelecimento identificado abaixo,
            doravante denominado <strong>COMODATÁRIO</strong>, celebram o presente Contrato de
            Comodato de Freezer, mediante as cláusulas seguintes.
          </p>

          {/* 1. DADOS DO COMODATÁRIO */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              1. Dados do Comodatário
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Razão social / Nome empresarial</label>
                <input className={fieldClass} value={form.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Nome fantasia</label>
                <input className={fieldClass} value={form.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">CNPJ / CPF</label>
                <input className={fieldClass} value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Endereço completo do estabelecimento</label>
                <input className={fieldClass} value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Cidade / UF</label>
                <div className="flex gap-1">
                  <input className={fieldClass} value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
                  <input className={`${fieldClass} w-12`} value={form.uf} onChange={(e) => update("uf", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Telefone / WhatsApp</label>
                <input className={fieldClass} value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">E-mail</label>
                <input className={fieldClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Responsável pelo estabelecimento</label>
                <input className={fieldClass} value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">CPF do responsável</label>
                <input className={fieldClass} value={form.cpfResponsavel} onChange={(e) => update("cpfResponsavel", e.target.value)} />
              </div>
            </div>
          </section>

          {/* 2. IDENTIFICAÇÃO DO FREEZER */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              2. Identificação do Freezer
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Marca</label>
                <input className={fieldClass} value={form.freezerMarca} onChange={(e) => update("freezerMarca", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Modelo</label>
                <input className={fieldClass} value={form.freezerModelo} onChange={(e) => update("freezerModelo", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Nº de série</label>
                <input className={fieldClass} value={form.freezerSerie} onChange={(e) => update("freezerSerie", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Patrimônio Z-ICE</label>
                <input className={fieldClass} value={form.freezerPatrimonio} onChange={(e) => update("freezerPatrimonio", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Cor / Características</label>
                <input className={fieldClass} value={form.freezerCor} onChange={(e) => update("freezerCor", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Valor de referência (R$)</label>
                <input className={fieldClass} value={form.freezerValor} onChange={(e) => update("freezerValor", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Estado na entrega</label>
                <input className={fieldClass} value={form.freezerEstado} onChange={(e) => update("freezerEstado", e.target.value)} />
              </div>
            </div>
          </section>

          {/* 3. OBJETO E FINALIDADE */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              3. Objeto e Finalidade
            </h3>
            <p className="text-justify mb-2">
              <strong>Cláusula 1ª - Objeto.</strong> A COMODANTE entrega ao COMODATÁRIO, em comodato
              gratuito, o freezer identificado neste instrumento. O equipamento permanece de propriedade
              exclusiva da Z-ICE GELO, não ocorrendo venda ou transferência de propriedade.
            </p>
            <p className="text-justify">
              <strong>Cláusula 2ª - Finalidade.</strong> O freezer será utilizado para armazenamento,
              conservação e exposição de gelo e deverá permanecer no endereço informado neste contrato,
              salvo autorização escrita da COMODANTE.
            </p>
          </section>

          {/* 4. UTILIZAÇÃO COMERCIAL */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              4. Utilização Comercial
            </h3>
            <p className="text-justify mb-2">
              <strong>Cláusula 3ª - Produtos Z-ICE.</strong> O equipamento deverá ser destinado
              prioritariamente aos produtos fornecidos pela Z-ICE GELO. Caso as partes acordem
              exclusividade, o freezer deverá armazenar exclusivamente produtos da marca Z-ICE GELO,
              salvo autorização prévia e escrita da COMODANTE.
            </p>
            <div className="flex items-center gap-4 mb-3 px-2">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={form.exclusividade} onChange={(e) => update("exclusividade", e.target.checked)} />
                Exclusividade comercial: SIM
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={!form.exclusividade} onChange={(e) => update("exclusividade", !e.target.checked)} />
                Exclusividade comercial: NÃO
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Compra mínima</label>
                <input className={fieldClass} value={form.compraMinima} onChange={(e) => update("compraMinima", e.target.value)} placeholder="sacos" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Período (ex: por semana / por mês)</label>
                <input className={fieldClass} value={form.periodoCompra} onChange={(e) => update("periodoCompra", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Dias sem compra p/ devolução</label>
                <input className={fieldClass} value={form.diasSemCompra} onChange={(e) => update("diasSemCompra", e.target.value)} />
              </div>
            </div>
            <p className="text-justify">
              <strong>Cláusula 4ª - Compras.</strong> O COMODATÁRIO compromete-se a manter
              relacionamento comercial regular com a Z-ICE GELO enquanto permanecer com o freezer. Caso
              exista compra mínima preenchida acima, seu descumprimento reiterado ou a ausência de
              compras pelo período indicado poderão ensejar solicitação de devolução do equipamento.
            </p>
          </section>

          {/* 5. CONSERVAÇÃO, ENERGIA E MANUTENÇÃO */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              5. Conservação, Energia e Manutenção
            </h3>
            <p className="text-justify mb-2">
              <strong>Cláusula 5ª - Conservação.</strong> O COMODATÁRIO deverá utilizar corretamente o
              equipamento, mantê-lo limpo e em boas condições, não remover adesivos, identificações ou
              logotipos sem autorização, não realizar alterações elétricas ou mecânicas e comunicar
              imediatamente qualquer defeito ou problema.
            </p>
            <p className="text-justify mb-2">
              <strong>Cláusula 6ª - Energia elétrica.</strong> O consumo de energia e a disponibilização
              da instalação elétrica adequada e segura serão de responsabilidade do COMODATÁRIO.
            </p>
            <p className="text-justify">
              <strong>Cláusula 7ª - Manutenção.</strong> Defeitos decorrentes de desgaste natural serão
              avaliados pela Z-ICE GELO. Danos decorrentes de mau uso, negligência, acidentes,
              instalação elétrica inadequada ou alteração não autorizada poderão ser cobrados do
              COMODATÁRIO. Reparos por terceiros dependem de autorização prévia da COMODANTE.
            </p>
          </section>

          {/* 6. PERDA, FURTO, ROUBO E DANOS */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              6. Perda, Furto, Roubo e Danos
            </h3>
            <p className="text-justify">
              <strong>Cláusula 8ª.</strong> Em caso de furto, roubo, desaparecimento, incêndio ou dano
              relevante, o COMODATÁRIO deverá comunicar a Z-ICE GELO assim que tiver conhecimento.
              Quando houver responsabilidade comprovada do COMODATÁRIO, poderá ser exigido o reparo ou a
              reposição do equipamento, consideradas as circunstâncias do fato.
            </p>
          </section>

          {/* 7. FISCALIZAÇÃO E PROIBIÇÃO DE TRANSFERÊNCIA */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              7. Fiscalização e Proibição de Transferência
            </h3>
            <p className="text-justify mb-2">
              <strong>Cláusula 9ª.</strong> A Z-ICE GELO poderá verificar as condições de conservação,
              funcionamento e utilização do freezer, mediante contato prévio quando possível.
            </p>
            <p className="text-justify">
              <strong>Cláusula 10ª.</strong> É proibido ao COMODATÁRIO vender, ceder, emprestar, locar,
              transferir, oferecer em garantia ou de qualquer forma dispor do freezer, que permanece de
              propriedade da Z-ICE GELO.
            </p>
          </section>

          {/* 8. PRAZO, DEVOLUÇÃO E RESCISÃO */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              8. Prazo, Devolução e Rescisão
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Data de início</label>
                <input className={fieldClass} value={form.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mt-1">
                  <input type="checkbox" checked={form.prazoIndeterminado} onChange={(e) => update("prazoIndeterminado", e.target.checked)} />
                  Prazo indeterminado
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Data final (se houver)</label>
                <input className={fieldClass} value={form.dataFinal} onChange={(e) => update("dataFinal", e.target.value)} />
              </div>
            </div>
            <p className="text-justify mb-2">
              <strong>Cláusula 11ª - Prazo.</strong> O contrato inicia na data indicada acima e vigorará
              pelo prazo assinalado. Enquanto o equipamento permanecer no estabelecimento, permanecem
              válidas as obrigações das partes.
            </p>
            <p className="text-justify mb-2">
              <strong>Cláusula 12ª - Devolução.</strong> A Z-ICE GELO poderá solicitar a devolução do
              freezer em caso de encerramento da relação comercial, falha de compras conforme este
              contrato, uso inadequado, descumprimento contratual, encerramento das atividades,
              transferência do estabelecimento ou outro motivo razoável. Nessas condições, as partes
              combinarão data para retirada, e o equipamento deverá ser devolvido em condições
              compatíveis com o uso normal, ressalvado o desgaste natural.
            </p>
            <p className="text-justify mb-2">
              <strong>Cláusula 13ª - Transferência do estabelecimento.</strong> A venda, cessação ou
              troca de responsável pelo estabelecimento não transfere automaticamente este contrato. O
              COMODATÁRIO deverá informar a Z-ICE GELO para retirada do freezer ou celebração de novo
              instrumento com o novo responsável.
            </p>
            <p className="text-justify mb-2">
              <strong>Cláusula 14ª - Identidade visual.</strong> O COMODATÁRIO autoriza a permanência de
              adesivos, logomarca e materiais promocionais da Z-ICE GELO instalados no equipamento, sem
              que isso implique alteração ou utilização sem autorização.
            </p>
            <p className="text-justify">
              <strong>Cláusula 15ª - Rescisão.</strong> O contrato poderá ser encerrado por qualquer das
              partes. Com o encerramento, o freezer deverá ser disponibilizado para retirada pela Z-ICE
              GELO, sem gerar direito de propriedade ou retenção do equipamento.
            </p>
          </section>

          {/* 9. ASSINATURA ELETRÔNICA E DISPOSIÇÕES GERAIS */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--zice-dark)] bg-blue-50 px-2 py-1 mb-3 border-l-4 border-[var(--zice-medium)]">
              9. Assinatura Eletrônica e Disposições Gerais
            </h3>
            <p className="text-justify mb-2">
              <strong>Cláusula 16ª - Assinatura.</strong> As partes poderão assinar este instrumento de
              forma manuscrita ou eletrônica. A versão assinada e devolvida por meio digital será
              considerada válida e eficaz entre as partes, sem prejuízo da utilização de plataforma
              especializada de assinatura eletrônica prevista no versículo.
            </p>
            <p className="text-justify mb-2">
              <strong>Cláusula 17ª - Disposições gerais.</strong> Quaisquer alterações deste contrato
              deverão ser realizadas por escrito e acatadas pelas partes. A tolerância eventual quanto a
              qualquer obrigação não implica renúncia aos direitos previstos neste instrumento.
            </p>
            <p className="text-justify mb-4">
              <strong>Cláusula 18ª - Foro.</strong> Eventuais controvérsias serão submetidas ao foro
              juridicamente competente, observadas as regras legais aplicáveis.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Cidade de assinatura</label>
                <input className={fieldClass} value={form.cidadeAssinatura} onChange={(e) => update("cidadeAssinatura", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Data de assinatura</label>
                <input className={fieldClass} value={form.dataAssinatura} onChange={(e) => update("dataAssinatura", e.target.value)} />
              </div>
            </div>
          </section>

          {/* Linhas de assinatura — espaço em branco para assinar e devolver */}
          <p className="text-center text-xs text-gray-500 pt-4">
            E por estarem de acordo, as partes assinam o presente instrumento.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="text-center">
              <div className="h-20 border-b border-gray-700" />
              <p className="font-bold text-xs mt-2">Z-ICE GELO — Comodante</p>
              <p className="text-[10px] text-gray-500">CNPJ 067.962.086/0001-04</p>
              <p className="text-[10px] text-gray-400 mt-1">Assinatura / rubrica</p>
            </div>
            <div className="text-center">
              <div className="h-20 border-b border-gray-700" />
              <p className="font-bold text-xs mt-2">{form.responsavel || "Comodatário"}</p>
              <p className="text-[10px] text-gray-500">CPF: {form.cpfResponsavel || "__________"}</p>
              <p className="text-[10px] text-gray-400 mt-1">Assinatura / rubrica</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-[var(--zice-dark)] text-white p-3 flex items-center justify-between text-[10px]">
          <span>Z-ICE GELO - Contrato de comodato de freezer</span>
          <span>Página 1</span>
        </div>
      </div>
    </div>
  );
}
