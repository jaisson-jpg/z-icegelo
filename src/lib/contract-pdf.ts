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

// Elementos que NUNCA devem sair no PDF (barra de ações, menus, topo/rodapé do site).
const IGNORE_CLASSES = ["capture-ignore", "print:hidden"];

function shouldIgnore(el: Element) {
  if (!(el instanceof HTMLElement)) return false;
  return IGNORE_CLASSES.some((c) => el.classList.contains(c));
}

/**
 * Gera um PDF A4 contendo SOMENTE o contrato (sem menu, topo ou rodapé do site).
 * Campos de formulário são convertidos em texto antes da captura para o PDF ficar limpo.
 */
export async function contractToPdfBlob(element: HTMLElement) {
  const html2canvas = (await import("html2canvas-pro")).default;
  const { jsPDF } = await import("jspdf");

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: Math.max(element.scrollWidth, 820),
      ignoreElements: shouldIgnore,
      onclone: (clonedDoc) => {
        const page = clonedDoc.querySelector<HTMLElement>(".contract-page");
        if (!page) return;

        page.querySelectorAll<HTMLInputElement>("input, textarea").forEach((input) => {
          const span = clonedDoc.createElement("span");
          span.className = input.className;
          span.style.display = "inline-block";
          span.style.whiteSpace = "pre-wrap";
          span.style.wordBreak = "break-word";
          span.style.minHeight = "1.4em";
          span.style.verticalAlign = "bottom";

          if (input.type === "checkbox") {
            span.textContent = input.checked ? "X" : "";
            span.style.width = "auto";
          } else {
            span.textContent = input.value || "\u00A0";
          }

          input.replaceWith(span);
        });
      },
    });
  } finally {
    window.scrollTo(scrollX, scrollY);
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
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
