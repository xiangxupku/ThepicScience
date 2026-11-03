/* relay.js — one shared postbox every device can reach.

   Why this exists. Online duels went through /api/party, which keeps parties in memory
   inside the serverless function. Measured against the live deploy, 48 requests were
   answered by 10 different instances. A party written into one instance is invisible from
   the other nine, so two phones essentially never find each other. No amount of retrying
   fixes that: it needs something shared.

   A public MQTT broker is shared by definition. Every device connects to the same one, so
   a message published to a room arrives at everyone in it, whatever network or country
   they are on. No account, no setup, and nothing for the app to host.

   This speaks MQTT 3.1.1 directly over a WebSocket rather than pulling in a library — it
   is only four packet types, and it keeps the app's habit of depending on nothing.

   Be clear about the trade: in online mode the game goes through someone else's broker.
   What crosses it is a first name, a pet id, and which of three buttons was pressed. The
   room name is a hash rather than the code itself, so it is not trivially guessable, but
   this is obscurity and not privacy, and the app says so where you choose Online. Playing
   on one device still sends nothing anywhere. */

(function () {
  'use strict';

  var BROKERS = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt'
  ];
  var KEEPALIVE = 45;

  /* ── MQTT framing ─────────────────────────────────── */

  function utf8(s) {
    var enc = new TextEncoder().encode(s);
    var out = new Uint8Array(enc.length + 2);
    out[0] = (enc.length >> 8) & 0xff;
    out[1] = enc.length & 0xff;
    out.set(enc, 2);
    return out;
  }

  function varLen(n) {
    var out = [];
    do {
      var b = n % 128;
      n = Math.floor(n / 128);
      if (n > 0) b |= 0x80;
      out.push(b);
    } while (n > 0);
    return new Uint8Array(out);
  }

  function packet(type, body) {
    var len = varLen(body.length);
    var out = new Uint8Array(1 + len.length + body.length);
    out[0] = type;
    out.set(len, 1);
    out.set(body, 1 + len.length);
    return out;
  }

  function join(parts) {
    var n = parts.reduce(function (a, p) { return a + p.length; }, 0);
    var out = new Uint8Array(n), at = 0;
    parts.forEach(function (p) { out.set(p, at); at += p.length; });
    return out;
  }

  function connectPacket(clientId) {
    var body = join([
      utf8('MQTT'),
      new Uint8Array([4, 0x02, (KEEPALIVE >> 8) & 0xff, KEEPALIVE & 0xff]),
      utf8(clientId)
    ]);
    return packet(0x10, body);
  }

  function subscribePacket(topic, id) {
    var body = join([
      new Uint8Array([(id >> 8) & 0xff, id & 0xff]),
      utf8(topic),
      new Uint8Array([0])                       /* QoS 0 */
    ]);
    return packet(0x82, body);
  }

  function publishPacket(topic, payload) {
    var body = join([utf8(topic), new TextEncoder().encode(payload)]);
    return packet(0x30, body);                  /* QoS 0, no packet id */
  }

  /* read one packet out of a buffer; returns null if it is not all there yet */
  function readPacket(buf) {
    if (buf.length < 2) return null;
    var mult = 1, len = 0, i = 1, b;
    do {
      if (i >= buf.length) return null;
      b = buf[i++];
      len += (b & 127) * mult;
      mult *= 128;
      if (mult > 128 * 128 * 128) return null;
    } while (b & 0x80);
    if (buf.length < i + len) return null;
    return { type: buf[0] & 0xf0, body: buf.subarray(i, i + len), total: i + len };
  }

  function readPublish(body) {
    var tl = (body[0] << 8) | body[1];
    var topic = new TextDecoder().decode(body.subarray(2, 2 + tl));
    var payload = new TextDecoder().decode(body.subarray(2 + tl));
    return { topic: topic, payload: payload };
  }

  /* ── rooms ────────────────────────────────────────────
     A four-letter code is short enough to read out and short enough to guess, so the room
     name on the broker is a hash of it rather than the code itself. */

  function roomFor(code) {
    var s = 'thepicscience-room-' + String(code).toUpperCase();
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    var g = 52711;
    for (var j = s.length - 1; j >= 0; j--) g = ((g << 5) + g ^ s.charCodeAt(j)) | 0;
    return 'tps/' + (h >>> 0).toString(36) + (g >>> 0).toString(36);
  }

  /* ── a connection ─────────────────────────────────── */

  function open(opts) {
    var code = opts.code;
    var room = roomFor(code);
    var onMessage = opts.onMessage || function () {};
    var onReady = opts.onReady || function () {};
    var onDrop = opts.onDrop || function () {};

    var ws = null, buf = new Uint8Array(0), ping = null;
    var at = 0, live = false, closed = false, subId = 1;

    function send(bytes) {
      if (ws && ws.readyState === 1) { try { ws.send(bytes); } catch (e) {} }
    }

    function connect() {
      if (closed) return;
      var url = BROKERS[at % BROKERS.length];
      at++;
      try { ws = new WebSocket(url, 'mqtt'); } catch (e) { return retry(); }
      ws.binaryType = 'arraybuffer';

      var opened = setTimeout(function () {
        if (!live) { try { ws.close(); } catch (e) {} }
      }, 9000);

      ws.onopen = function () {
        send(connectPacket('tps' + Math.random().toString(36).slice(2, 10)));
      };

      ws.onmessage = function (ev) {
        var chunk = new Uint8Array(ev.data);
        var merged = new Uint8Array(buf.length + chunk.length);
        merged.set(buf); merged.set(chunk, buf.length);
        buf = merged;

        for (;;) {
          var p = readPacket(buf);
          if (!p) break;
          buf = buf.subarray(p.total);

          if (p.type === 0x20) {                      /* CONNACK */
            clearTimeout(opened);
            live = true;
            send(subscribePacket(room + '/#', subId++));
            clearInterval(ping);
            ping = setInterval(function () { send(packet(0xc0, new Uint8Array(0))); }, KEEPALIVE * 1000 / 2);
            onReady(url);
          } else if (p.type === 0x30) {               /* PUBLISH */
            var m = readPublish(p.body);
            try { onMessage(JSON.parse(m.payload)); } catch (e) { /* not ours */ }
          }
        }
      };

      ws.onclose = function () {
        clearTimeout(opened);
        clearInterval(ping);
        var was = live;
        live = false;
        if (was) onDrop();
        retry();
      };
      ws.onerror = function () { /* onclose does the work */ };
    }

    function retry() {
      if (closed) return;
      setTimeout(connect, 1200);                 /* next broker in the list */
    }

    connect();

    return {
      room: room,
      live: function () { return live; },
      say: function (msg) {
        send(publishPacket(room + '/m', JSON.stringify(msg)));
      },
      close: function () {
        closed = true;
        clearInterval(ping);
        try { ws && ws.close(); } catch (e) {}
      }
    };
  }

  /* Is any broker reachable from here? Tries each in turn rather than giving up on the
     first — one of them being blocked or busy is not the same as having no relay. */
  function one(url, ms) {
    return new Promise(function (res) {
      var done = false, ws;
      var t = setTimeout(function () {
        if (!done) { done = true; try { ws.close(); } catch (e) {} res(false); }
      }, ms);
      try { ws = new WebSocket(url, 'mqtt'); } catch (e) { clearTimeout(t); return res(false); }
      ws.onopen = function () { if (!done) { done = true; clearTimeout(t); ws.close(); res(true); } };
      ws.onerror = ws.onclose = function () { if (!done) { done = true; clearTimeout(t); res(false); } };
    });
  }

  function reachable(ms) {
    var each = Math.max(3000, Math.floor((ms || 10000) / BROKERS.length));
    return BROKERS.reduce(function (chain, url) {
      return chain.then(function (ok) { return ok ? true : one(url, each); });
    }, Promise.resolve(false));
  }

  window.RELAY = { open: open, reachable: reachable, roomFor: roomFor, brokers: BROKERS };
})();
