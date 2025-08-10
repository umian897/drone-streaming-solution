const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  // The 'trans' block has been removed as this functionality is now handled by your Python backend.
  logType: 3
};

const nms = new NodeMediaServer(config);

// --- CORRECTED EVENT LISTENERS FOR DIAGNOSTICS ---

// This event fires when a client (like your drone) starts to connect.
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

// This event fires after a client has successfully connected.
nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

// This event fires when a client disconnects.
nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

// This event fires right before the server tries to publish the stream.
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// This event fires after the server has started the publishing process.
nms.gop_cache = true;
nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// This event fires when the stream publishing is finished (e.g., the drone disconnects).
nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.run();

console.log('Node Media Server is running with FULL diagnostics on ports 1935 (RTMP) and 8000 (HTTP)...');
