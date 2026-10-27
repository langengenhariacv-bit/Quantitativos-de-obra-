package br.lang.controletv;

import android.content.Context;
import android.net.wifi.WifiManager;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

/** Procura TVs LG webOS na rede Wi-Fi pela busca SSDP (a mesma que o app oficial usa). */
final class TvFinder {

    interface Callback {
        /** Chave: IP da TV; valor: nome mostrado pela TV (ou "TV LG"). */
        void onFound(Map<String, String> tvs);
    }

    private static final String SSDP_HOST = "239.255.255.250";
    private static final int SSDP_PORT = 1900;
    private static final String[] SEARCH_TARGETS = {
            "urn:lge-com:service:webos-second-screen:1",
            "urn:dial-multiscreen-org:service:dial:1",
    };
    private static final int LISTEN_MS = 3500;
    private static final Pattern LOCATION = Pattern.compile("(?im)^location:\\s*(\\S+)");
    private static final Pattern FRIENDLY_NAME = Pattern.compile("<friendlyName>([^<]*)</friendlyName>");

    private final Context context;
    private final OkHttpClient http = new OkHttpClient.Builder()
            .connectTimeout(2, TimeUnit.SECONDS)
            .readTimeout(2, TimeUnit.SECONDS)
            .build();

    TvFinder(Context context) {
        this.context = context.getApplicationContext();
    }

    void search(Callback callback) {
        new Thread(() -> callback.onFound(searchBlocking()), "tv-finder").start();
    }

    private Map<String, String> searchBlocking() {
        Map<String, String> found = new LinkedHashMap<>();
        Map<String, String> locations = new LinkedHashMap<>();
        WifiManager wifi = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiManager.MulticastLock lock = wifi == null ? null : wifi.createMulticastLock("controle-tv");
        if (lock != null) {
            lock.setReferenceCounted(false);
            lock.acquire();
        }
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setSoTimeout(500);
            InetAddress group = InetAddress.getByName(SSDP_HOST);
            for (int round = 0; round < 2; round++) {
                for (String target : SEARCH_TARGETS) {
                    byte[] query = ("M-SEARCH * HTTP/1.1\r\n"
                            + "HOST: " + SSDP_HOST + ":" + SSDP_PORT + "\r\n"
                            + "MAN: \"ssdp:discover\"\r\n"
                            + "MX: 2\r\n"
                            + "ST: " + target + "\r\n\r\n").getBytes(StandardCharsets.US_ASCII);
                    socket.send(new DatagramPacket(query, query.length, group, SSDP_PORT));
                }
            }
            long end = System.currentTimeMillis() + LISTEN_MS;
            byte[] buffer = new byte[2048];
            while (System.currentTimeMillis() < end) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                try {
                    socket.receive(packet);
                } catch (SocketTimeoutException e) {
                    continue;
                }
                String reply = new String(packet.getData(), 0, packet.getLength(), StandardCharsets.UTF_8);
                String lower = reply.toLowerCase(Locale.ROOT);
                if (!lower.contains("webos") && !lower.contains("lge") && !lower.contains("lg electronics")) {
                    continue;
                }
                String ip = packet.getAddress().getHostAddress();
                if (!found.containsKey(ip)) {
                    found.put(ip, "TV LG");
                    Matcher m = LOCATION.matcher(reply);
                    if (m.find()) {
                        locations.put(ip, m.group(1));
                    }
                }
            }
        } catch (IOException e) {
            // Sem Wi-Fi ou rede bloqueando multicast: devolve o que encontrou.
        } finally {
            if (lock != null) {
                lock.release();
            }
        }
        for (Map.Entry<String, String> entry : locations.entrySet()) {
            String name = friendlyName(entry.getValue());
            if (name != null && !name.isEmpty()) {
                found.put(entry.getKey(), name);
            }
        }
        return found;
    }

    private String friendlyName(String location) {
        try (Response response = http.newCall(new Request.Builder().url(location).build()).execute()) {
            ResponseBody body = response.body();
            if (body == null) {
                return null;
            }
            Matcher m = FRIENDLY_NAME.matcher(body.string());
            return m.find() ? m.group(1).trim() : null;
        } catch (IOException | IllegalArgumentException e) {
            return null;
        }
    }
}
