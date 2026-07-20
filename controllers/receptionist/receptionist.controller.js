const { Op } = require("sequelize");
const {
  User,
  PatientProfile,
  Appointment,
  AppointmentStatusHistory,
  Invoice,
  InvoiceItem,
  Payment,
  Vital,
} = require("../../models");

const listPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const userWhere = {};

    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const patients = await PatientProfile.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
          where: Object.keys(userWhere).length ? userWhere : undefined,
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointments = async (req, res) => {
  try {
    const where = {};
    if (req.query.clinic_id) where.clinic_id = req.query.clinic_id;
    if (req.query.date) where.appointment_date = req.query.date;
    if (req.query.status) where.status = req.query.status;

    const appointments = await Appointment.findAll({
      where,
      order: [["appointment_date", "DESC"], ["start_time", "ASC"]],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      clinic_id,
      doctor_id,
      patient_id,
      department_id,
      appointment_date,
      start_time,
      end_time,
      visit_type,
      consultation_type,
      reason,
    } = req.body;

    if (!clinic_id || !doctor_id || !patient_id || !appointment_date || !start_time) {
      return res.status(400).json({
        success: false,
        message:
          "clinic_id, doctor_id, patient_id, appointment_date and start_time are required",
      });
    }

    const appointment = await Appointment.create({
      appointment_number: `APT-${Date.now()}`,
      clinic_id,
      doctor_id,
      patient_id,
      department_id,
      appointment_date,
      start_time,
      end_time,
      visit_type,
      consultation_type,
      reason,
      booked_by: req.user.id,
      status: "scheduled",
    });

    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    await appointment.update(req.body);
    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    await appointment.update({ status, remarks: remarks ?? appointment.remarks });
    await AppointmentStatusHistory.create({
      appointment_id: appointment.id,
      status,
      changed_by: req.user.id,
      remarks,
    });

    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

const createVital = async (req, res) => {
  try {
    const { appointment_id, temperature, pulse, bp, height, weight, oxygen } = req.body;
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    const vital = await Vital.create({
      appointment_id,
      temperature,
      pulse,
      bp,
      height,
      weight,
      oxygen,
    });

    return res.status(201).json({ success: true, data: vital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listPatients,
  listAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  listInvoices,
  createInvoice,
  createPayment,
  createVital,
};
