export const getInventory = async (db) => {
  const [rows] = await db.query("SELECT * FROM inventory");
  return rows;
};

export const upsertInventory = async (db, item) => {
  const { center_name, item_name, quantity } = item;

  await db.query(
    `
    INSERT INTO inventory (center_name, item_name, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `,
    [center_name, item_name, quantity, quantity]
  );
};

export const decrementInventory = async (db, centerName, itemName, quantity) => {
  await db.query(
    `
    UPDATE inventory 
    SET quantity = quantity - ?
    WHERE center_name = ? AND item_name = ? AND quantity >= ?
    `,
    [quantity, centerName, itemName, quantity]
  );
};