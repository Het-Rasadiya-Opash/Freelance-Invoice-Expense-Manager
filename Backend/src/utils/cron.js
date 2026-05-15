import cron from "node-cron";
import invoiceModel from "../models/invoice.model.js";

const setupCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    console.log(`[Cron] Checking for recurring invoices at ${new Date().toISOString()}`);
    const now = new Date();
    
    try {
      const recurringInvoices = await invoiceModel.find({
        "recurring.isRecurring": true,
        "recurring.nextRunAt": { $lte: now },
      });
      
      if (recurringInvoices.length > 0) {
        console.log(`[Cron] Found ${recurringInvoices.length} recurring invoices to process.`);
      }
      
      for (const invoice of recurringInvoices) {
        try {
          console.log(`[Cron] Processing recurring invoice: ${invoice._id}`);
          
          const newInvoiceData = {
            userId: invoice.userId,
            clientId: invoice.clientId,
            projectId: invoice.projectId,
            status: "DRAFT",
            dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), 
            lineItems: invoice.lineItems.map(item => ({
              description: item.description,
              type: item.type,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
            taxRate: invoice.taxRate,
            discountAmount: invoice.discountAmount,
            currency: invoice.currency,
            notes: invoice.notes,
            terms: invoice.terms,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            recurring: {
              isRecurring: false, 
            }
          };
          
          const newInvoice = new invoiceModel(newInvoiceData);
          await newInvoice.save();
          
          console.log(`[Cron] Generated new invoice: ${newInvoice.invoiceNumber} (${newInvoice._id})`);
          
          invoice.recurring.lastRunAt = now;
          
          let nextRunAt = new Date(now);
          if (invoice.recurring.frequency === "WEEKLY") {
            nextRunAt.setDate(now.getDate() + 7);
          } else if (invoice.recurring.frequency === "MONTHLY") {
            nextRunAt.setMonth(now.getMonth() + 1);
          }
          
          invoice.recurring.nextRunAt = nextRunAt;
          await invoice.save();
          
          console.log(`[Cron] Updated template invoice ${invoice._id}. Next run: ${nextRunAt.toISOString()}`);
        } catch (error) {
          console.error(`[Cron] Error processing invoice ${invoice._id}:`, error);
        }
      }
    } catch (error) {
      console.error("[Cron] Error fetching recurring invoices:", error);
    }
  });
  
  console.log("[Cron] Recurring invoice checker scheduled (every minute).");
};

export default setupCronJobs;
