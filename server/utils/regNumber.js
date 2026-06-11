const generateRegNumber = async (StudentModel) => {
  const currentYear = new Date().getFullYear().toString().slice(2);
  const prefix = `CS${currentYear}/`;

  const lastStudent = await StudentModel.findOne().sort({ createdAt: -1 });
  if (!lastStudent?.regNumber) return `${prefix}001`;

  const match = lastStudent.regNumber.match(new RegExp(`${prefix}(\\d+)`));
  if (!match) return `${prefix}001`;

  const nextNum = parseInt(match[1]) + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
};

module.exports = { generateRegNumber };