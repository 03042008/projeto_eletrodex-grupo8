const bcrypt = require("bcryptjs");
const pool = require("./src/config/database");

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

async function migratePasswords() {
  const connection = await pool.getConnection();
  let migrated = 0;

  try {
    await connection.beginTransaction();
    const [employees] = await connection.query(
      "SELECT id_funcionario, senha FROM funcionario FOR UPDATE"
    );

    for (const employee of employees) {
      if (isBcryptHash(employee.senha)) continue;
      const hash = await bcrypt.hash(String(employee.senha), 12);
      await connection.query(
        "UPDATE funcionario SET senha = ? WHERE id_funcionario = ?",
        [hash, employee.id_funcionario]
      );
      migrated += 1;
    }

    await connection.commit();
    console.log(`Senhas migradas para bcrypt: ${migrated}.`);
  } catch (error) {
    await connection.rollback();
    console.error("Não foi possível migrar as senhas.");
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

migratePasswords();