export const getFamilies = async (db) => {
  const [rows] = await db.query("SELECT * FROM families");
  return rows;
};

export const getFamilyById = async (db, familyId) => {
  const [rows] = await db.query(
    "SELECT * FROM families WHERE UPPER(family_id) = UPPER(?)",
    [familyId]
  );
  return rows[0] || null;
};

export const createFamily = async (db, family) => {
  const { family_id, name, ration_balance } = family;

  await db.query(
    "INSERT INTO families (family_id, name, ration_balance) VALUES (?, ?, ?)",
    [family_id, name, ration_balance]
  );
};
