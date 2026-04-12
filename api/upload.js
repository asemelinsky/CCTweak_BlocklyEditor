const SftpClient = require('ssh2-sftp-client');

function getSftpConfig(body) {
  const { serverId, server } = body;

  // Builtin server — all credentials from env
  if (serverId) {
    const userEnv = serverId === 'server2' ? 'SFTP_USER_2' : 'SFTP_USER_1';
    return {
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '2022'),
      username: process.env[userEnv],
      password: process.env.SFTP_PASS,
      basePath: 'world/computercraft/computer/',
    };
  }

  // Custom server — credentials from request
  if (server && server.host) {
    return {
      host: server.host,
      port: parseInt(server.port || '2022'),
      username: server.user,
      password: server.pass,
      basePath: server.basePath || 'world/computercraft/computer/',
    };
  }

  // Fallback — env defaults (server1)
  return {
    host: process.env.SFTP_HOST,
    port: parseInt(process.env.SFTP_PORT || '2022'),
    username: process.env.SFTP_USER_1,
    password: process.env.SFTP_PASS,
    basePath: 'world/computercraft/computer/',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, comp, fileName } = req.body;

  if (!code || !comp || !fileName) {
    return res.status(400).send('⛔ Обов\'язкові поля відсутні або порожні.');
  }

  const compClean = comp.replace(/[^0-9]/g, '');
  const fileClean = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '');

  const { basePath, ...sftpConfig } = getSftpConfig(req.body);

  const sftp = new SftpClient();

  try {
    await sftp.connect(sftpConfig);

    const dir = `${basePath}${compClean}`;
    const remotePath = `${dir}/${fileClean}`;

    await sftp.mkdir(dir, true).catch(() => {});
    await sftp.put(Buffer.from(code, 'utf8'), remotePath);
    await sftp.end();

    res.status(200).send(`✅ Файл збережено у: ${remotePath}`);
  } catch (err) {
    await sftp.end().catch(() => {});
    res.status(500).send(`❌ ${err.message}`);
  }
}
