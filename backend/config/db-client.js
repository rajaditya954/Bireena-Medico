import pg from "pg";
import path from "path";
import fs from "fs";
import { config } from "./env.js";

// Global connection state
let pool = null;
let useMemory = true;
const memoryDb = {}; // in-memory store fallback for test/dev environments without DB URL

const DB_FILE_PATH = path.resolve(process.cwd(), "memory-db.json");

function loadMemoryDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf8");
      // clear current memoryDb keys
      for (const key in memoryDb) {
        delete memoryDb[key];
      }
      Object.assign(memoryDb, JSON.parse(data));
    }
  } catch (err) {
    console.error("⚠️ Failed to load memory-db.json:", err.message);
  }
}

function saveMemoryDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryDb, null, 2), "utf8");
  } catch (err) {
    console.error("⚠️ Failed to save memory-db.json:", err.message);
  }
}

const tableMap = {
  "User": "users",
  "Patient": "patients",
  "Doctor": "doctors",
  "Appointment": "appointments",
  "Queue": "queues",
  "Notification": "notifications",
  "Prescription": "prescriptions",
  "LabTest": "lab_tests",
  "LabReport": "lab_reports",
  "Billing": "billing",
  "Payment": "payments",
  "Inventory": "inventory",
  "Invoice": "invoices",
  "History": "history",
  "Role": "roles",
  "Service": "services",
  "PatientHistory": "patient_histories",
  "Medicine": "medicines",
  "MedicineDistribution": "medicine_distributions",
  "MedicineRequirement": "medicine_requirements",
  "AuditLog": "audit_logs",
  "RefreshToken": "refresh_tokens"
};

const tableColumns = {
  "users": ["_id", "employeeId", "username", "name", "email", "passwordHash", "phone", "profileImage", "role", "isActive", "failedLoginAttempts", "lockedUntil", "resetToken", "resetTokenExpires", "lastLogin", "createdBy", "createdAt", "updatedAt"],
  "patients": ["_id", "userId", "patientId", "fullName", "dob", "age", "gender", "bloodGroup", "maritalStatus", "phone", "alternatePhone", "email", "address", "city", "state", "pincode", "occupation", "referredBy", "allergies", "chronicDiseases", "medicalHistory", "emergencyContact", "insuranceInfo", "createdAt", "updatedAt"],
  "doctors": ["_id", "userId", "doctorCode", "name", "specialization", "consultantType", "qualification", "description", "qualifications", "registrationNumber", "experience", "consultationFee", "roomNumber", "schedule", "clinic", "isVerified", "rating", "totalConsultations", "createdAt", "updatedAt"],
  "appointments": ["_id", "appointmentId", "patientId", "patientName", "patientPhone", "doctorId", "doctorName", "appointmentDate", "date", "appointmentType", "type", "consultantType", "priority", "tokenNumber", "slot", "slotId", "status", "notes", "reason", "createdBy", "createdAt", "updatedAt"],
  "queues": ["_id", "appointmentId", "patientId", "patientName", "doctorId", "doctorName", "queueNumber", "tokenNumber", "type", "scheduledTime", "priority", "currentPosition", "status", "date", "estimatedWaitTime", "calledAt", "completedAt", "createdAt", "updatedAt"],
  "notifications": ["_id", "userId", "type", "title", "message", "data", "isRead", "readAt", "expiresAt", "createdAt", "updatedAt"],
  "prescriptions": ["_id", "prescriptionId", "appointmentId", "patientId", "doctorId", "diagnosis", "symptoms", "medicines", "advice", "followUpDate", "notes", "fileUrl", "isActive", "createdAt", "updatedAt"],
  "lab_tests": ["_id", "testCode", "testName", "category", "sampleType", "method", "tat", "description", "price", "normalRange", "isActive", "createdAt", "updatedAt"],
  "lab_reports": ["_id", "reportId", "patientId", "doctorId", "appointmentId", "technicianId", "tests", "status", "sampleDate", "reportDate", "reportFile", "findings", "remarks", "history", "createdAt", "updatedAt"],
  "billing": ["_id", "invoiceNumber", "billingId", "patientId", "appointmentId", "items", "subtotal", "discount", "tax", "total", "paymentSummary", "paymentStatus", "status", "issuedAt", "paidAt", "notes", "dueDate", "createdAt", "updatedAt"],
  "payments": ["_id", "paymentId", "invoiceId", "bill", "patientId", "amount", "paymentMethod", "status", "transactionId", "razorpayPaymentId", "razorpayOrderId", "signature", "paymentDate", "completedAt", "failureReason", "notes", "createdAt", "updatedAt"],
  "inventory": ["_id", "medicineId", "currentStock", "minimumStock", "reorderLevel", "supplier", "stockValue", "location", "createdAt", "updatedAt"],
  "invoices": ["_id", "invoiceNumber", "billingId", "patientId", "amount", "status", "invoiceDate", "generatedAt", "dueDate", "invoicePdf", "pdfUrl", "notes", "createdAt", "updatedAt"],
  "history": ["_id", "patientId", "medicines", "requestedMedicines", "total", "paymentMethod", "amountPaid", "createdAt", "updatedAt"],
  "roles": ["_id", "name", "permissions", "description", "createdAt", "updatedAt"],
  "services": ["_id", "name", "description", "category", "price", "duration", "icon", "isActive", "serviceItems", "createdAt", "updatedAt"],
  "patient_histories": ["_id", "patientId", "doctorId", "appointmentId", "diagnosis", "notes", "createdAt", "updatedAt"],
  "medicines": ["_id", "medicineCode", "medicineName", "category", "manufacturer", "mrp", "unit", "expiryDate", "batchNo", "createdAt"],
  "medicine_distributions": ["_id", "distributionId", "patientId", "prescriptionId", "medicineId", "quantity", "items", "totalAmount", "distributedBy", "distributedAt", "notes", "createdAt", "updatedAt"],
  "medicine_requirements": ["_id", "requirementId", "patientId", "medicineId", "requestedMedicineName", "strength", "unitType", "requestedQty", "approvedQty", "status", "requestedBy", "approvedBy", "notes", "createdAt", "updatedAt"],
  "audit_logs": ["_id", "userId", "action", "resource", "resourceId", "oldValues", "newValues", "ipAddress", "userAgent", "status", "errorMessage", "createdAt", "updatedAt"],
  "refresh_tokens": ["_id", "userId", "token", "expiresAt", "isRevoked", "createdAt", "updatedAt"]
};

// Registered models registry
const registeredModels = {};

function generateObjectId() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function getNestedValue(obj, path) {
  if (!obj) return undefined;
  if (!path.includes(".")) return obj[path];
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function setNestedValue(obj, path, value) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function deleteNestedValue(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) return;
    current = current[part];
  }
  delete current[parts[parts.length - 1]];
}

// MongoDB filter matcher in JS
function matchQuery(doc, query) {
  if (!query) return true;
  for (const key in query) {
    const val = query[key];
    if (key === "$or") {
      if (!Array.isArray(val)) return false;
      if (!val.some(subQuery => matchQuery(doc, subQuery))) return false;
      continue;
    }
    const docVal = getNestedValue(doc, key);
    const isRoleKey = key === "role";

    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date) && !(val instanceof RegExp)) {
      for (const op in val) {
        const opVal = val[op];
        if (op === "$eq") {
          if (isRoleKey && typeof docVal === "string" && typeof opVal === "string") {
            if (docVal.toUpperCase() !== opVal.toUpperCase()) return false;
          } else {
            if (docVal !== opVal) return false;
          }
        } else if (op === "$ne") {
          if (isRoleKey && typeof docVal === "string" && typeof opVal === "string") {
            if (docVal.toUpperCase() === opVal.toUpperCase()) return false;
          } else {
            if (docVal === opVal) return false;
          }
        } else if (op === "$gt") {
          if (!(docVal > opVal)) return false;
        } else if (op === "$gte") {
          if (!(docVal >= opVal)) return false;
        } else if (op === "$lt") {
          if (!(docVal < opVal)) return false;
        } else if (op === "$lte") {
          if (!(docVal <= opVal)) return false;
        } else if (op === "$in") {
          if (!Array.isArray(opVal)) return false;
          const docList = Array.isArray(docVal) ? docVal : [docVal];
          if (isRoleKey) {
            const upperOpVal = opVal.map(item => typeof item === "string" ? item.toUpperCase() : item);
            if (!docList.some(item => typeof item === "string" && upperOpVal.includes(item.toUpperCase()))) return false;
          } else {
            if (!docList.some(item => opVal.includes(item))) return false;
          }
        } else if (op === "$nin") {
          if (!Array.isArray(opVal)) return false;
          if (isRoleKey && typeof docVal === "string") {
            const upperOpVal = opVal.map(item => typeof item === "string" ? item.toUpperCase() : item);
            if (upperOpVal.includes(docVal.toUpperCase())) return false;
          } else {
            if (opVal.includes(docVal)) return false;
          }
        } else if (op === "$exists") {
          const exists = docVal !== undefined;
          if (exists !== !!opVal) return false;
        } else if (op === "$regex") {
          const options = val.$options || "";
          const regex = new RegExp(opVal, options);
          if (typeof docVal !== "string" || !regex.test(docVal)) return false;
        }
      }
    } else if (val instanceof RegExp) {
      if (typeof docVal !== "string" || !val.test(docVal)) return false;
    } else {
      if (val instanceof Date) {
        if (!docVal || new Date(docVal).getTime() !== val.getTime()) return false;
      } else if (typeof val === "string" && (val.startsWith("^") || val.endsWith("$"))) {
        // Regex-like simple match
        try {
          const r = new RegExp(val);
          if (typeof docVal !== "string" || !r.test(docVal)) return false;
        } catch {
          if (isRoleKey && typeof docVal === "string") {
            if (docVal.toUpperCase() !== val.toUpperCase()) return false;
          } else {
            if (docVal != val) return false;
          }
        }
      } else {
        // String ObjectId / other loose matching
        if (isRoleKey && typeof docVal === "string" && typeof val === "string") {
          if (docVal.toUpperCase() !== val.toUpperCase()) return false;
        } else {
          if (docVal != val) return false;
        }
      }
    }
  }
  return true;
}

// MongoDB update applier in JS
function applyUpdate(doc, update) {
  if (!update) return doc;
  const hasOperators = Object.keys(update).some(k => k.startsWith("$"));
  if (!hasOperators) {
    return { ...doc, ...update };
  }
  const newDoc = { ...doc };
  if (update.$set) {
    for (const key in update.$set) {
      setNestedValue(newDoc, key, update.$set[key]);
    }
  }
  if (update.$unset) {
    for (const key in update.$unset) {
      deleteNestedValue(newDoc, key);
    }
  }
  if (update.$push) {
    for (const key in update.$push) {
      let array = getNestedValue(newDoc, key);
      if (!Array.isArray(array)) {
        array = [];
        setNestedValue(newDoc, key, array);
      }
      const pushVal = update.$push[key];
      if (pushVal && pushVal.$each) {
        array.push(...pushVal.$each);
      } else {
        array.push(pushVal);
      }
    }
  }
  return newDoc;
}

// Populate reference documents
async function populateDoc(doc, path) {
  if (!doc) return doc;
  const paths = Array.isArray(path) ? path : [path];
  for (const p of paths) {
    const fieldDef = doc.schema?.definition?.[p];
    let refModelName = null;
    if (fieldDef && fieldDef.ref) {
      refModelName = fieldDef.ref;
    } else if (Array.isArray(fieldDef) && fieldDef[0] && fieldDef[0].ref) {
      refModelName = fieldDef[0].ref;
    } else {
      if (p.endsWith("Id")) {
        const guess = p.slice(0, -2);
        refModelName = guess.charAt(0).toUpperCase() + guess.slice(1);
      } else if (p === "tests") {
        refModelName = "LabTest";
      } else if (p === "technicianId") {
        refModelName = "User";
      }
    }
    if (!refModelName) continue;
    const refModel = registeredModels[refModelName];
    if (!refModel) continue;

    const val = doc[p];
    if (Array.isArray(val)) {
      const populatedList = [];
      for (const item of val) {
        const id = typeof item === "object" && item !== null ? (item._id || item) : item;
        const refDoc = await refModel.findById(id);
        populatedList.push(refDoc || item);
      }
      doc[p] = populatedList;
    } else if (val) {
      const id = typeof val === "object" && val !== null ? (val._id || val) : val;
      const refDoc = await refModel.findById(id);
      if (refDoc) doc[p] = refDoc;
    }
  }
  return doc;
}

// SQL DB execution
async function dbSelect(tableName) {
  if (useMemory) {
    loadMemoryDb();
    return memoryDb[tableName] || [];
  }
  try {
    const res = await pool.query(`SELECT * FROM ${tableName}`);
    return res.rows.map(row => {
      // Postgres returns timestamp fields as Date objects. Mongoose returns them as Date objects.
      // Other JSON fields are parsed as JS objects.
      // Make sure we convert fields accordingly if needed.
      return { ...row };
    });
  } catch (err) {
    console.error(`[DbClient] dbSelect error on table ${tableName}:`, err.message);
    loadMemoryDb();
    return memoryDb[tableName] || [];
  }
}

async function dbSave(tableName, doc) {
  if (useMemory) {
    loadMemoryDb();
    if (!memoryDb[tableName]) memoryDb[tableName] = [];
    const idx = memoryDb[tableName].findIndex(d => d._id === doc._id);
    if (idx >= 0) {
      memoryDb[tableName][idx] = doc;
    } else {
      memoryDb[tableName].push(doc);
    }
    saveMemoryDb();
    return;
  }
  const jsonColumns = new Set([
    "allergies", "chronicDiseases", "medicalHistory", "emergencyContact", "insuranceInfo",
    "qualifications", "schedule", "clinic", "data", "symptoms", "medicines", "tests",
    "history", "items", "paymentSummary", "requestedMedicines", "permissions",
    "serviceItems", "resourceId", "oldValues", "newValues"
  ]);

  const columns = tableColumns[tableName];
  if (!columns) return;
  const cols = [];
  const vals = [];
  const placeholders = [];
  
  columns.forEach(col => {
    let val = doc[col];
    if (val !== undefined) {
      cols.push(`"${col}"`);
      placeholders.push(`$${cols.length}`);
      if (jsonColumns.has(col)) {
        vals.push(val === null || val === undefined ? null : JSON.stringify(val));
      } else if (typeof val === "object" && val !== null && !(val instanceof Date)) {
        vals.push(JSON.stringify(val));
      } else {
        vals.push(val);
      }
    }
  });

  if (cols.length === 0) return;
  const conflictUpdates = cols
    .filter(c => c !== '"_id"')
    .map(c => `${c} = EXCLUDED.${c}`)
    .join(", ");

  const sql = `
    INSERT INTO ${tableName} (${cols.join(", ")})
    VALUES (${placeholders.join(", ")})
    ON CONFLICT (_id) DO UPDATE SET ${conflictUpdates || '"updatedAt" = EXCLUDED."updatedAt"'}
  `;
  try {
    await pool.query(sql, vals);
  } catch (err) {
    console.error(`[DbClient] dbSave error on table ${tableName}:`, err.message, "SQL:", sql);
  }
}

async function dbDelete(tableName, id) {
  if (useMemory) {
    loadMemoryDb();
    if (!memoryDb[tableName]) return;
    memoryDb[tableName] = memoryDb[tableName].filter(d => d._id !== id);
    saveMemoryDb();
    return;
  }
  try {
    await pool.query(`DELETE FROM ${tableName} WHERE _id = $1`, [id]);
  } catch (err) {
    console.error(`[DbClient] dbDelete error on table ${tableName}:`, err.message);
  }
}

async function dbDeleteMany(tableName, query) {
  const rows = await dbSelect(tableName);
  const matched = rows.filter(r => matchQuery(r, query));
  for (const row of matched) {
    await dbDelete(tableName, row._id);
  }
}

// Mock Document representation
class Document {
  constructor(data, model) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateObjectId();
    }
    // Apply setters from schema definition
    if (model?.schema?.definition) {
      for (const field in model.schema.definition) {
        const def = model.schema.definition[field];
        if (def && typeof def.set === "function" && this[field] !== undefined) {
          this[field] = def.set(this[field]);
        }
      }
    }
    // Bind methods from schema
    if (model?.schema?.methods) {
      for (const m in model.schema.methods) {
        this[m] = model.schema.methods[m].bind(this);
      }
    }
    // Attach model/schema ref
    Object.defineProperty(this, "constructor", { value: model, writable: true, configurable: true });
    Object.defineProperty(this, "schema", { value: model?.schema, writable: true, configurable: true });
  }

  async save() {
    const tableName = tableMap[this.constructor.modelName];
    this.updatedAt = new Date();
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    // Execute pre-save hooks
    const preSaveHooks = this.schema?.preHooks?.["save"] || [];
    for (const hook of preSaveHooks) {
      await new Promise((resolve, reject) => {
        hook.call(this, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const plain = this.toObject ? this.toObject() : { ...this };
    // Strip functions before saving
    for (const key in plain) {
      if (typeof plain[key] === "function") delete plain[key];
    }
    await dbSave(tableName, plain);
    return this;
  }

  async populate(path) {
    await populateDoc(this, path);
    return this;
  }

  toObject() {
    const obj = { ...this };
    // strip out internal bindings if any
    return obj;
  }

  toJSON() {
    return this.toObject();
  }
}

// Mock Query class (supports sorting, selecting, populating, chaining, thenable)
class Query {
  constructor(model, filter = {}, operation = "find", updateData = null) {
    this.model = model;
    this.filter = filter;
    this.operation = operation;
    this.updateData = updateData;
    this.selectFields = null;
    this.sortOption = null;
    this.limitCount = null;
    this.populatePaths = [];
    this.isLean = false;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  sort(option) {
    this.sortOption = option;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  populate(paths) {
    if (Array.isArray(paths)) {
      this.populatePaths.push(...paths);
    } else if (typeof paths === "string") {
      this.populatePaths.push(...paths.split(" "));
    }
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  async exec() {
    const tableName = tableMap[this.model.modelName];
    const rows = await dbSelect(tableName);

    // Apply filter
    let results = rows.filter(r => matchQuery(r, this.filter));

    // Handle delete/update operations
    if (this.operation === "deleteMany") {
      for (const r of results) {
        await dbDelete(tableName, r._id);
      }
      return { deletedCount: results.length };
    }

    if (this.operation === "deleteOne" || this.operation === "findOneAndDelete" || this.operation === "findByIdAndDelete") {
      if (results.length > 0) {
        const match = results[0];
        await dbDelete(tableName, match._id);
        const doc = new Document(match, this.model);
        if (this.populatePaths.length > 0) await populateDoc(doc, this.populatePaths);
        return this.isLean ? doc.toObject() : doc;
      }
      return null;
    }

    if (this.operation === "updateOne" || this.operation === "updateMany" || this.operation === "findByIdAndUpdate" || this.operation === "findOneAndUpdate") {
      if (results.length > 0) {
        let updatedDocs = [];
        for (const match of results) {
          const updated = applyUpdate(match, this.updateData);
          updated.updatedAt = new Date();
          await dbSave(tableName, updated);
          const doc = new Document(updated, this.model);
          if (this.populatePaths.length > 0) await populateDoc(doc, this.populatePaths);
          updatedDocs.push(this.isLean ? doc.toObject() : doc);
        }
        return this.operation.includes("ById") || this.operation.includes("findOne") ? updatedDocs[0] : { modifiedCount: results.length };
      }
      return null;
    }

    if (this.operation === "countDocuments") {
      return results.length;
    }

    // Sort results
    if (this.sortOption) {
      let sortKey = "";
      let asc = true;
      if (typeof this.sortOption === "string") {
        sortKey = this.sortOption.startsWith("-") ? this.sortOption.substring(1) : this.sortOption;
        asc = !this.sortOption.startsWith("-");
      } else if (typeof this.sortOption === "object") {
        sortKey = Object.keys(this.sortOption)[0];
        asc = this.sortOption[sortKey] !== -1;
      }
      if (sortKey) {
        results.sort((a, b) => {
          const valA = getNestedValue(a, sortKey);
          const valB = getNestedValue(b, sortKey);
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }
    }

    // Limit results
    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    // Convert to Document objects (unless lean)
    let finalResults = results.map(r => new Document(r, this.model));

    // Populate
    if (this.populatePaths.length > 0) {
      for (const doc of finalResults) {
        await populateDoc(doc, this.populatePaths);
      }
    }

    if (this.isLean) {
      finalResults = finalResults.map(d => d.toObject());
    }

    if (this.operation === "findOne" || this.operation === "findById") {
      return finalResults.length > 0 ? finalResults[0] : null;
    }

    return finalResults;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Mock Model class
class Model {
  constructor(name, schema) {
    this.modelName = name;
    this.schema = schema;
    registeredModels[name] = this;

    // Extend class to act as a Document builder
    const self = this;
    const documentBuilder = function(data) {
      return new Document(data, self);
    };
    Object.setPrototypeOf(documentBuilder, this);
    return documentBuilder;
  }

  find(query = {}) {
    return new Query(this, query, "find");
  }

  findOne(query = {}) {
    return new Query(this, query, "findOne");
  }

  findById(id) {
    return new Query(this, { _id: id }, "findById");
  }

  findByIdAndUpdate(id, update, options = {}) {
    return new Query(this, { _id: id }, "findByIdAndUpdate", update);
  }

  findOneAndUpdate(query, update, options = {}) {
    return new Query(this, query, "findOneAndUpdate", update);
  }

  findByIdAndDelete(id) {
    return new Query(this, { _id: id }, "findByIdAndDelete");
  }

  findOneAndDelete(query) {
    return new Query(this, query, "findOneAndDelete");
  }

  deleteMany(query = {}) {
    return new Query(this, query, "deleteMany");
  }

  countDocuments(query = {}) {
    return new Query(this, query, "countDocuments");
  }

  updateOne(query, update) {
    return new Query(this, query, "updateOne", update);
  }

  async create(data) {
    const list = Array.isArray(data) ? data : [data];
    const created = [];
    for (const item of list) {
      const doc = new Document(item, this);
      await doc.save();
      created.push(doc);
    }
    return Array.isArray(data) ? created : created[0];
  }

  async insertMany(data) {
    return this.create(data);
  }

  async syncIndexes() {
    return [];
  }
}

// Mock Database Schema
class Schema {
  constructor(definition) {
    this.definition = definition;
    this.methods = {};
    this.statics = {};
    this.preHooks = {};
  }
  index() {}
  pre(event, fn) {
    if (!this.preHooks[event]) this.preHooks[event] = [];
    this.preHooks[event].push(fn);
  }
  post() {}
}
Schema.Types = {
  ObjectId: "ObjectId",
  Mixed: "Mixed"
};

// Global database exports
const dbClient = {
  Schema,
  model(name, schema) {
    if (schema) {
      return new Model(name, schema);
    }
    return registeredModels[name];
  },
  models: registeredModels,
  Types: {
    ObjectId: Object.assign(
      (val) => val || generateObjectId(),
      {
        isValid(val) {
          if (typeof val !== "string") return false;
          return val.length === 24 && /^[0-9a-fA-F]{24}$/.test(val);
        }
      }
    )
  },
  set() {},
  
  async connect(uri) {
    const dbUrl = process.env.DATABASE_URL || config.mongoUri || uri;
    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) && !dbUrl.includes("[YOUR-PASSWORD]")) {
      try {
        pool = new pg.Pool({ 
          connectionString: dbUrl,
          connectionTimeoutMillis: 2000,
          ssl: {
            rejectUnauthorized: false
          }
        });
        // Test connection query
        await pool.query("SELECT 1");
        useMemory = false;
        console.log("🗄️  Connected to Supabase PostgreSQL Database");
        
        // Load schema sql and sync tables
        try {
          const fs = await import("fs");
          const path = await import("path");
          let sqlPath = path.resolve(process.cwd(), "config/schema.sql");
          if (!fs.existsSync(sqlPath)) {
            sqlPath = path.resolve(process.cwd(), "backend/config/schema.sql");
          }
          if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, "utf8");
            await pool.query(sql);
            console.log("🔄 PostgreSQL tables checked/initialized successfully");
          }
        } catch (err) {
          console.error("⚠️ Failed to load or execute schema.sql:", err.message);
        }
      } catch (err) {
        console.warn(`⚠️ Supabase connection failed (${err.message}). Falling back to local JSON database.`);
        useMemory = true;
        pool = null;
        loadMemoryDb();
      }
    } else {
      useMemory = true;
      console.log("ℹ️  Using mock local JSON database fallback.");
      loadMemoryDb();
    }
  },

  async disconnect() {
    if (pool) {
      await pool.end();
      pool = null;
    }
    useMemory = true;
  }
};

export default dbClient;
export { Schema };
