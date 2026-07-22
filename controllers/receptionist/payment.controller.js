const { Payment, Invoice } = require("../../models");

const createPayment = async (req, res) => {
  try {
    const { invoice_id, payment_method, transaction_id, amount, status } = req.body;
    if (!invoice_id || !payment_method || amount == null) {
      return res.status(400).json({
        success: false,
        message: "invoice_id, payment_method and amount are required",
      });
    }

    const payment = await Payment.create({
      invoice_id,
      payment_method,
      transaction_id,
      amount,
      status: status || "success",
      paid_at: new Date(),
    });

    const invoice = await Invoice.findByPk(invoice_id);
    if (invoice && (status || "success") === "success") {
      await invoice.update({ status: "paid" });
    }

    return res.status(201).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment };
