import PDFDocument from "pdfkit";

export const generateInvoicePdf = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    const primaryColor = "#1a365d";
    const secondaryColor = "#4a5568";
    const textColor = "#2d3748";
    const lightGray = "#edf2f7";

    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .text("INVOICE", { align: "right" });

    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" })
      .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, {
        align: "right",
      })
      .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    doc
      .fillColor(textColor)
      .fontSize(14)
      .text("Freelance Manager", { align: "left" })
      .fontSize(10)
      .text("Opash", { align: "left" })
      .text("opash@gmail.com", { align: "left" });

    doc.moveDown(1);

    doc
      .fillColor(secondaryColor)
      .fontSize(12)
      .text("Bill To:", { align: "left" });

    if (invoice.clientId) {
      doc
        .fillColor(textColor)
        .fontSize(10)
        .text(invoice.clientId.name || "Client Name")
        .text(invoice.clientId.company || "")
        .text(invoice.clientId.email || "")
        .text(invoice.clientId.address || "");
    } else {
      doc.fillColor(textColor).fontSize(10).text("Unknown Client");
    }

    doc.moveDown(2);

    const tableTop = doc.y;
    doc.fillColor(primaryColor).rect(50, tableTop, 512, 20).fill();

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .text("Description", 60, tableTop + 5)
      .text("Qty", 300, tableTop + 5, { width: 50, align: "right" })
      .text("Unit Price", 360, tableTop + 5, { width: 80, align: "right" })
      .text("Amount", 450, tableTop + 5, { width: 100, align: "right" });

    let currentY = tableTop + 20;

    invoice.lineItems.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.fillColor(lightGray).rect(50, currentY, 512, 20).fill();
      }

      doc
        .fillColor(textColor)
        .fontSize(10)
        .text(item.description, 60, currentY + 5, { width: 230 })
        .text(item.quantity.toString(), 300, currentY + 5, {
          width: 50,
          align: "right",
        })
        .text(item.unitPrice.toFixed(2), 360, currentY + 5, {
          width: 80,
          align: "right",
        })
        .text(item.amount.toFixed(2), 450, currentY + 5, {
          width: 100,
          align: "right",
        });

      currentY += 20;
    });

    doc.moveDown(2);

    const totalsY = currentY + 10;
    doc
      .fillColor(textColor)
      .fontSize(10)
      .text("Subtotal:", 350, totalsY, { width: 100, align: "right" })
      .text(
        `${invoice.currency} ${invoice.subtotal.toFixed(2)}`,
        450,
        totalsY,
        { width: 100, align: "right" },
      );

    doc
      .text(`Tax (${invoice.taxRate}%):`, 350, totalsY + 15, {
        width: 100,
        align: "right",
      })
      .text(
        `${invoice.currency} ${invoice.taxAmount.toFixed(2)}`,
        450,
        totalsY + 15,
        { width: 100, align: "right" },
      );

    doc
      .text("Discount:", 350, totalsY + 30, { width: 100, align: "right" })
      .text(
        `${invoice.currency} ${invoice.discountAmount.toFixed(2)}`,
        450,
        totalsY + 30,
        { width: 100, align: "right" },
      );

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("Total:", 350, totalsY + 50, { width: 100, align: "right" })
      .text(
        `${invoice.currency} ${invoice.total.toFixed(2)}`,
        450,
        totalsY + 50,
        { width: 100, align: "right" },
      );

    if (invoice.notes) {
      doc
        .fillColor(secondaryColor)
        .fontSize(10)
        .text("Notes:", 50, totalsY + 80)
        .fillColor(textColor)
        .text(invoice.notes, 50, totalsY + 95, { width: 250 });
    }

    if (invoice.terms) {
      doc
        .fillColor(secondaryColor)
        .fontSize(10)
        .text("Terms:", 50, totalsY + 140)
        .fillColor(textColor)
        .text(invoice.terms, 50, totalsY + 155, { width: 250 });
    }

    doc.end();
  });
};
