const generateEmpId = async (EmployeeModel) => {
  const lastEmployee = await EmployeeModel.findOne().sort({ createdAt: -1 });
  if (!lastEmployee?.empId) return 'EM-001';

  const match = lastEmployee.empId.match(/EM-(\d+)/);
  if (!match) return 'EM-001';

  const nextNum = parseInt(match[1]) + 1;
  return `EM-${nextNum.toString().padStart(3, '0')}`;
};

module.exports = { generateEmpId };