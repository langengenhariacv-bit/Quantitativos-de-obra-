package br.lang.controletv;

import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONException;
import org.json.JSONObject;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/** Cliente do protocolo SSAP das TVs LG webOS (pareamento, comandos e teclas do controle). */
final class LgTv {

    interface Listener {
        void onState(String state, String detail);
    }

    /** Certificados que as TVs LG apresentam na porta 3001 (intermediário e folha "LGE TV SSG"). */
    private static final Set<String> LG_FINGERPRINTS = new HashSet<>(Arrays.asList(
            "E2BD6464D3F51C1B95B7697D9D6773C33D9412EBA0299C568C34937D3FE68AA0",
            "11C5B1C5907750ABB9DA2A6665CCCE2BB288A583F45A3339E71F87BF2F808552"));

    private static final String POINTER_URI = "ssap://com.webos.service.networkinput/getPointerInputSocket";

    private final SharedPreferences prefs;
    private final Listener listener;
    private final String pairingJson;
    private final OkHttpClient http;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final List<String> queuedKeys = new ArrayList<>();

    private WebSocket socket;
    private WebSocket pointer;
    private boolean registered;
    private boolean registerSigned;
    private boolean pointerPending;
    private int generation;
    private int seq;
    private String ip;

    LgTv(SharedPreferences prefs, String pairingJson, Listener listener) {
        this.prefs = prefs;
        this.pairingJson = pairingJson;
        this.listener = listener;
        this.http = buildClient();
    }

    synchronized boolean isConnected() {
        return registered;
    }

    synchronized void connect(String address) {
        closeSockets();
        ip = address;
        prefs.edit().putString("ip", address).apply();
        int gen = generation;
        state("connecting", address);
        open(gen, "wss://" + address + ":3001", true);
    }

    synchronized void reconnectIfNeeded() {
        String saved = prefs.getString("ip", "");
        if (socket == null && !saved.isEmpty()) {
            connect(saved);
        }
    }

    synchronized void forget() {
        closeSockets();
        prefs.edit().remove("ip").remove("clientKey").remove("certPin").apply();
        state("offline", "");
    }

    synchronized void close() {
        closeSockets();
    }

    synchronized boolean request(String uri, String payloadJson) {
        if (!registered) {
            return false;
        }
        JSONObject payload = null;
        if (payloadJson != null && !payloadJson.isEmpty()) {
            try {
                payload = new JSONObject(payloadJson);
            } catch (JSONException e) {
                return false;
            }
        }
        send("request", "req_" + (++seq), uri, payload);
        return true;
    }

    synchronized boolean key(String name) {
        if (!registered) {
            return false;
        }
        if (pointer != null) {
            pointer.send("type:button\nname:" + name + "\n\n");
            return true;
        }
        queuedKeys.add(name);
        if (!pointerPending) {
            pointerPending = true;
            send("request", "ptr_" + (++seq), POINTER_URI, null);
        }
        return true;
    }

    private void closeSockets() {
        generation++;
        if (socket != null) {
            socket.close(1000, null);
        }
        if (pointer != null) {
            pointer.close(1000, null);
        }
        socket = null;
        pointer = null;
        registered = false;
        pointerPending = false;
        queuedKeys.clear();
    }

    private void open(final int gen, String url, final boolean secure) {
        socket = http.newWebSocket(new Request.Builder().url(url).build(), new WebSocketListener() {
            private boolean opened;

            @Override
            public void onOpen(WebSocket ws, Response response) {
                synchronized (LgTv.this) {
                    if (gen != generation) {
                        ws.close(1000, null);
                        return;
                    }
                    opened = true;
                    register(true);
                }
            }

            @Override
            public void onMessage(WebSocket ws, String text) {
                synchronized (LgTv.this) {
                    if (gen == generation) {
                        handle(text);
                    }
                }
            }

            @Override
            public void onFailure(WebSocket ws, Throwable t, Response response) {
                synchronized (LgTv.this) {
                    if (gen != generation) {
                        return;
                    }
                    if (!opened && secure) {
                        open(gen, "ws://" + ip + ":3000", false);
                        return;
                    }
                    dropped(t.getMessage());
                }
            }

            @Override
            public void onClosed(WebSocket ws, int code, String reason) {
                synchronized (LgTv.this) {
                    if (gen == generation) {
                        dropped(reason);
                    }
                }
            }
        });
    }

    private void dropped(String detail) {
        socket = null;
        pointer = null;
        registered = false;
        pointerPending = false;
        queuedKeys.clear();
        state("offline", detail == null ? "" : detail);
    }

    private void register(boolean signed) {
        try {
            JSONObject pairing = new JSONObject(pairingJson);
            if (!signed) {
                // TVs com firmware recente recusam o manifesto assinado antigo.
                JSONObject manifest = pairing.getJSONObject("manifest");
                manifest.remove("signed");
                manifest.put("appVersion", "1.0");
                manifest.getJSONArray("permissions").put("CONTROL_INPUT_TEXT").put("CONTROL_MOUSE_AND_KEYBOARD");
            }
            String key = prefs.getString("clientKey", null);
            if (key != null) {
                pairing.put("client-key", key);
            }
            registerSigned = signed;
            send("register", "reg_" + (++seq), null, pairing);
        } catch (JSONException e) {
            state("refused", e.getMessage());
        }
    }

    private void handle(String text) {
        JSONObject message;
        try {
            message = new JSONObject(text);
        } catch (JSONException e) {
            return;
        }
        String type = message.optString("type");
        String id = message.optString("id");
        JSONObject payload = message.optJSONObject("payload");

        if (id.startsWith("reg_")) {
            if ("registered".equals(type)) {
                String key = payload == null ? "" : payload.optString("client-key", "");
                if (!key.isEmpty()) {
                    prefs.edit().putString("clientKey", key).apply();
                }
                registered = true;
                state("connected", ip);
            } else if ("response".equals(type) && payload != null
                    && "PROMPT".equals(payload.optString("pairingType"))) {
                state("prompt", "");
            } else if ("error".equals(type)) {
                String error = message.optString("error");
                if (registerSigned && error.toLowerCase().contains("blacklisted")) {
                    register(false);
                } else {
                    state("refused", error);
                }
            }
            return;
        }

        if (id.startsWith("ptr_")) {
            String path = payload == null ? "" : payload.optString("socketPath", "");
            if (!path.isEmpty()) {
                openPointer(path);
            } else {
                pointerPending = false;
                queuedKeys.clear();
            }
        }

        if ("error".equals(type)) {
            state("error", message.optString("error"));
        }
    }

    private void openPointer(String path) {
        final int gen = generation;
        http.newWebSocket(new Request.Builder().url(path).build(), new WebSocketListener() {
            @Override
            public void onOpen(WebSocket ws, Response response) {
                synchronized (LgTv.this) {
                    if (gen != generation) {
                        ws.close(1000, null);
                        return;
                    }
                    pointer = ws;
                    pointerPending = false;
                    for (String name : queuedKeys) {
                        ws.send("type:button\nname:" + name + "\n\n");
                    }
                    queuedKeys.clear();
                }
            }

            @Override
            public void onFailure(WebSocket ws, Throwable t, Response response) {
                synchronized (LgTv.this) {
                    if (pointer == ws) {
                        pointer = null;
                    }
                    if (gen == generation) {
                        pointerPending = false;
                        queuedKeys.clear();
                    }
                }
            }

            @Override
            public void onClosed(WebSocket ws, int code, String reason) {
                synchronized (LgTv.this) {
                    if (pointer == ws) {
                        pointer = null;
                    }
                }
            }
        });
    }

    private void send(String type, String id, String uri, JSONObject payload) {
        if (socket == null) {
            return;
        }
        try {
            JSONObject message = new JSONObject();
            message.put("type", type);
            message.put("id", id);
            if (uri != null) {
                message.put("uri", uri);
            }
            if (payload != null) {
                message.put("payload", payload);
            }
            socket.send(message.toString());
        } catch (JSONException ignored) {
            // Mensagem montada aqui mesmo; não há como falhar com dados válidos.
        }
    }

    private void state(final String state, final String detail) {
        main.post(() -> listener.onState(state, detail));
    }

    /**
     * A TV usa certificado próprio. Aceita a cadeia oficial da LG; para outros modelos,
     * guarda o certificado da primeira conexão e exige o mesmo nas próximas.
     */
    private OkHttpClient buildClient() {
        X509TrustManager trust = new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                throw new CertificateException("client certificates not supported");
            }

            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                if (chain == null || chain.length == 0) {
                    throw new CertificateException("empty certificate chain");
                }
                for (X509Certificate cert : chain) {
                    if (LG_FINGERPRINTS.contains(sha256(cert))) {
                        return;
                    }
                }
                String leaf = sha256(chain[0]);
                String pinned = prefs.getString("certPin", null);
                if (pinned == null) {
                    prefs.edit().putString("certPin", leaf).apply();
                } else if (!pinned.equals(leaf)) {
                    throw new CertificateException("TV certificate changed");
                }
            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return new X509Certificate[0];
            }
        };
        try {
            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, new TrustManager[]{trust}, null);
            return new OkHttpClient.Builder()
                    .sslSocketFactory(context.getSocketFactory(), trust)
                    // O certificado da TV não traz o IP; a confiança vem da verificação acima.
                    .hostnameVerifier((host, session) -> true)
                    .connectTimeout(4, TimeUnit.SECONDS)
                    .pingInterval(15, TimeUnit.SECONDS)
                    .build();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String sha256(X509Certificate cert) throws CertificateException {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(cert.getEncoded());
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) {
                hex.append(String.format("%02X", b));
            }
            return hex.toString();
        } catch (GeneralSecurityException e) {
            throw new CertificateException(e);
        }
    }
}
