export const getTransactions = async (db) => {
  const [rows] = await db.query(
    "SELECT * FROM transactions ORDER BY created_at DESC"
  );
  return rows;
};

export const createTransaction = async (db, tx) => {
  const { family_id, center_name, item_name, quantity } = tx;

  // Start a transaction to ensure both operations succeed or fail together
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log(`[Transaction] Starting: ${quantity} ${item_name} from ${center_name} to ${family_id}`);

    // Step 1: Check if there's enough inventory
    const [inventoryRows] = await connection.query(
      `
      SELECT quantity FROM inventory 
      WHERE center_name = ? AND item_name = ?
      `,
      [center_name, item_name]
    );

    if (inventoryRows.length === 0) {
      throw new Error(`Inventory item ${item_name} not found at ${center_name}`);
    }

    const currentQuantity = inventoryRows[0].quantity;
    console.log(`[Transaction] Current inventory: ${currentQuantity} ${item_name} at ${center_name}`);

    if (currentQuantity < quantity) {
      throw new Error(`Insufficient inventory. Available: ${currentQuantity}, Requested: ${quantity}`);
    }

    // Step 2: Insert the transaction record
    await connection.query(
      `
      INSERT INTO transactions (family_id, center_name, item_name, quantity)
      VALUES (?, ?, ?, ?)
      `,
      [family_id, center_name, item_name, quantity]
    );
    console.log(`[Transaction] Transaction record inserted`);

    // Step 3: Decrement inventory quantity in the database
    // This reduces the available stock when items are distributed
    const [updateResult] = await connection.query(
      `
      UPDATE inventory 
      SET quantity = quantity - ?
      WHERE center_name = ? AND item_name = ?
      `,
      [quantity, center_name, item_name]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error(`Failed to update inventory. Item ${item_name} not found at ${center_name}.`);
    }

    console.log(`[Transaction] Inventory decremented by ${quantity}. Affected rows: ${updateResult.affectedRows}`);

    // Step 4: Verify the update was successful
    const [verifyRows] = await connection.query(
      `
      SELECT quantity FROM inventory 
      WHERE center_name = ? AND item_name = ?
      `,
      [center_name, item_name]
    );

    if (verifyRows.length > 0) {
      const newQuantity = verifyRows[0].quantity;
      console.log(`[Transaction] New inventory quantity: ${newQuantity}`);
      
      if (newQuantity < 0) {
        throw new Error('Inventory quantity cannot be negative. Transaction rolled back.');
      }
    }

    // Commit the transaction - both transaction record and inventory update are saved
    await connection.commit();
    console.log(`[Transaction] Successfully committed`);
  } catch (error) {
    await connection.rollback();
    console.error(`[Transaction] Error occurred, rolling back:`, error.message);
    throw error;
  } finally {
    connection.release();
  }
};

export const clearTransactions = async (db) => {
  await db.query("DELETE FROM transactions");
};
