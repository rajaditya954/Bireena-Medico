export const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

export const generateAppointmentId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `APT-${timestamp}-${random}`;
};

export const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN-${timestamp}-${random}`;
};

export const generateUHID = (patientIndex) => {
  return `UH-${Date.now()}-${patientIndex}`;
};
