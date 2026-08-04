require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "applications.json");

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

// ---- simple JSON file "database" ----
function readDb() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}
function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---- health check ----
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---- list all saved applications ----
app.get("/api/applications", (req, res) => {
  const data = readDb();
  res.json(data);
});

// ---- get a single application ----
app.get("/api/applications/:id", (req, res) => {
  const data = readDb();
  const record = data.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Application not found" });
  res.json(record);
});

// ---- save a new application ----
app.post("/api/applications", (req, res) => {
  const { template, lang, form, fullText, studentName } = req.body;
  if (!template || !fullText) {
    return res.status(400).json({ error: "template and fullText are required" });
  }
  const data = readDb();
  const record = {
    id: `${Date.now()}`,
    template,
    lang: lang || "hi",
    form: form || {},
    fullText,
    studentName: studentName || "",
    createdAt: new Date().toISOString(),
  };
  data.unshift(record);
  writeDb(data);
  res.status(201).json(record);
});

// ---- delete an application ----
app.delete("/api/applications/:id", (req, res) => {
  const data = readDb();
  const next = data.filter((r) => r.id !== req.params.id);
  writeDb(next);
  res.json({ ok: true, deletedId: req.params.id });
});

// ---- send an application by email ----
app.post("/api/send-email", async (req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: "to and text are required" });
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: "Email is not configured on the server. Set SMTP_* variables in .env" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: subject || "School Application",
      text,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Email send failed:", err.message);
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`School Application backend running on http://localhost:${PORT}`);
});
