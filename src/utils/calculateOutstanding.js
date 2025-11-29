function calculateOutstanding(records) {
  const totalBilled = records.reduce(
    (sum, record) => sum + parseFloat(record.billed_amount),
    0
  );
  const totalPaid = records.reduce(
    (sum, record) => sum + parseFloat(record.paid_amount),
    0
  );

  const totalOutstanding = totalBilled - totalPaid;

  const RECOVERY_FEE = totalOutstanding >= 5000 ? 5000 : 0;
  const currentBill = totalOutstanding + RECOVERY_FEE;

  return {
    totalBilled,
    totalPaid,
    totalOutstanding,
    recoveryFee: RECOVERY_FEE,
    currentBill,
  };
}

module.exports = { calculateOutstanding };
