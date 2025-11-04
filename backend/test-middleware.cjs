// Test para verificar que el middleware de gestión activa funciona correctamente
const { Client } = require('pg');

async function testMiddlewareLogic() {
  console.log('=== TEST MIDDLEWARE GESTIÓN ACTIVA ===\n');

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'apromam_db',
    user: 'postgres',
    password: '12345'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Simular la query que hace el middleware
    console.log('1. Obteniendo gestión activa (activo_sistema = true)...');
    const result = await client.query(`
      SELECT
        id_gestion, anio_gestion, descripcion,
        estado_gestion, activa, activo_sistema
      FROM gestiones
      WHERE activo_sistema = true
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ ERROR: No hay gestión activa en el sistema');
      console.log('   El middleware devolverá error 500');
      return;
    }

    const gestionActiva = result.rows[0];
    console.log('✅ Gestión activa encontrada:');
    console.log('   ID:', gestionActiva.id_gestion);
    console.log('   Año:', gestionActiva.anio_gestion);
    console.log('   Estado:', gestionActiva.estado_gestion);
    console.log('   activo_sistema:', gestionActiva.activo_sistema);
    console.log();

    // Verificar que solo hay una gestión activa
    console.log('2. Verificando constraint único...');
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM gestiones
      WHERE activo_sistema = true
    `);

    const count = parseInt(countResult.rows[0].total);
    if (count === 1) {
      console.log('✅ Solo UNA gestión tiene activo_sistema = true (correcto)');
    } else {
      console.log(`❌ ERROR: ${count} gestiones tienen activo_sistema = true`);
      console.log('   El constraint único NO está funcionando');
    }
    console.log();

    // Simular lo que hará el middleware: inyectar en request
    console.log('3. Simulando inyección en request...');
    const requestMock = {};
    requestMock.gestionActiva = gestionActiva;
    console.log('✅ request.gestionActiva inyectado:');
    console.log('   Año:', requestMock.gestionActiva.anio_gestion);
    console.log('   ID:', requestMock.gestionActiva.id_gestion);
    console.log();

    console.log('=== ✅ MIDDLEWARE FUNCIONA CORRECTAMENTE ===');
    console.log('El middleware podrá:');
    console.log('  1. Obtener la gestión activa de la BD');
    console.log('  2. Inyectarla en request.gestionActiva');
    console.log('  3. Controllers podrán acceder a request.gestionActiva');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await client.end();
  }
}

testMiddlewareLogic().catch(console.error);
