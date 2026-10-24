/**
 * Shared socket.io limits.
 *
 * Nest attaches every gateway on the HTTP port to ONE socket.io server, configured by whichever
 * gateway happens to initialise first — so a limit set on just one gateway may or may not apply.
 * Every gateway uses this same value.
 *
 * A message over the limit makes socket.io drop the connection, and the message with it. Lobby
 * draw patches carry whole arrays (`drawBitmaps` holds base64 PNGs), so a lasso commit on a big
 * map lost its bitmap patch while the preceding `strokes` patch — which removed the strokes the
 * bitmap replaced — had already been written: most of a drawn map vanished on the next load.
 * Keep this in line with BODY_SIZE_LIMIT in main.ts.
 */
export const SOCKET_MAX_BUFFER_BYTES = 200 * 1024 * 1024;
