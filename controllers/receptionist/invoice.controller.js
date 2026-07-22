const { Invoice, InvoiceItem } = require("../../models");

const listInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [{ model: InvoiceItem, as: "items" }],
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { appointment_id, subtotal, discount, tax, total, items } = req.body;
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    const invoice = await Invoice.create({
      appointment_id,
      invoice_no: `INV-${Date.now()}`,
      subtotal: subtotal || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      status: "pending",
    });

    if (Array.isArray(items) && items.length) {
      await InvoiceItem.bulkCreate(
        items.map((item) => ({ ...item, invoice_id: invoice.id }))
      );
    }

    const full = await Invoice.findByPk(invoice.id, {
      include: [{ model: InvoiceItem, as: "items" }],
    });

    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listInvoices,
  createInvoice,
};
