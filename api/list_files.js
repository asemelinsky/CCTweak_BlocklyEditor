const SftpClient = require('ssh2-sftp-client');

function getSftpConfig(body) {
  const { serverId, server } = body;

  if (serverId) {
    const USER_ENV = { server1: 'SFTP_USER_1', server2: 'SFTP_USER_2', server3: 'SFTP_USER_3' };
    const userEnv = USER_ENV[serverId] || 'SFTP_USER_1';
    return {
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '2022'),
      username: process.env[userEnv],
      password: process.env.SFTP_PASS,
      basePath: 'world/computercraft/computer/',
    };
  }

  if (server && server.host) {
    return {
      host: server.host,
      port: parseInt(server.port || '2022'),
      username: server.user,
      password: server.pass,
      basePath: server.basePath || 'world/computercraft/computer/',
    };
  }

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

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { comp, file, action } = req.body;

  if (!comp) return res.status(400).json({ error: "Номер комп'ютера не вказано." });

  const compClean = comp.replace(/[^0-9]/g, '');
  const fileClean = file ? file.replace(/[^a-zA-Z0-9_\-\.]/g, '') : '';

  const { basePath, ...sftpConfig } = getSftpConfig(req.body);

  const sftp = new SftpClient();

  try {
    await sftp.connect(sftpConfig);

    const dir = `${basePath}${compClean}`;

    if (action === 'delete' && fileClean) {
      await sftp.delete(`${dir}/${fileClean}`);
      await sftp.end();
      return res.json({ ok: true });

    } else if (fileClean) {
      const content = await sftp.get(`${dir}/${fileClean}`);
      await sftp.end();
      return res.json({ name: fileClean, content: content.toString('utf8') });

    } else {
      const list = await sftp.list(dir).catch(() => []);
      await sftp.end();
      const luaFiles = list.filter(f => f.name.endsWith('.lua')).map(f => f.name);
      return res.json({ files: luaFiles });
    }

  } catch (err) {
    await sftp.end().catch(() => {});
    return res.status(400).json({ error: err.message });
  }
}
