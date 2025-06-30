exports.cekAdminBot = (participants, botNumber) => {
  return participants.some(p => p.id === botNumber && p.admin);
};
