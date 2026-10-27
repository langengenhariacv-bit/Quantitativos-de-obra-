package br.lang.controletv;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Tela do controle (HTML em assets) ligada ao Wi-Fi da LG e ao infravermelho do celular. */
public class MainActivity extends Activity {

    private WebView web;
    private LgTv tv;
    private IrBlaster ir;
    private TvFinder finder;
    private SharedPreferences prefs;
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#111111"));
        getWindow().setNavigationBarColor(Color.parseColor("#111111"));

        prefs = getSharedPreferences("controle_tv", Context.MODE_PRIVATE);
        ir = new IrBlaster(this);
        finder = new TvFinder(this);
        tv = new LgTv(prefs, readAsset("pairing.json"), this::onTvState);
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#111111"));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "TV");
        web.loadUrl("file:///android_asset/index.html");

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#111111"));
        root.addView(web);
        if (Build.VERSION.SDK_INT >= 35) {
            // A partir do Android 15 o app ocupa a tela inteira; afasta o conteúdo das barras.
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        setContentView(root);
    }

    @Override
    protected void onResume() {
        super.onResume();
        tv.reconnectIfNeeded();
    }

    @Override
    protected void onDestroy() {
        tv.close();
        web.destroy();
        super.onDestroy();
    }

    private void onTvState(String state, String detail) {
        web.evaluateJavascript("window.tvState && window.tvState("
                + JSONObject.quote(state) + "," + JSONObject.quote(detail) + ")", null);
    }

    private void onTvsFound(Map<String, String> tvs) {
        JSONArray list = new JSONArray();
        for (Map.Entry<String, String> tv : tvs.entrySet()) {
            JSONObject item = new JSONObject();
            try {
                item.put("ip", tv.getKey());
                item.put("name", tv.getValue());
            } catch (JSONException ignored) {
                continue;
            }
            list.put(item);
        }
        runOnUiThread(() -> web.evaluateJavascript("window.tvFound && window.tvFound(" + list + ")", null));
    }

    private String readAsset(String name) {
        try (InputStream in = getAssets().open(name)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int n;
            while ((n = in.read(buffer)) > 0) {
                out.write(buffer, 0, n);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Métodos chamados pelo JavaScript da tela (objeto window.TV). */
    private final class Bridge {
        @JavascriptInterface
        public boolean hasIr() {
            return ir.available();
        }

        @JavascriptInterface
        public boolean ir(String name) {
            return ir.send(name);
        }

        @JavascriptInterface
        public boolean connected() {
            return tv.isConnected();
        }

        @JavascriptInterface
        public void connect(String ip) {
            tv.connect(ip.trim());
        }

        @JavascriptInterface
        public void findTv() {
            finder.search(MainActivity.this::onTvsFound);
        }

        @JavascriptInterface
        public void forget() {
            tv.forget();
        }

        @JavascriptInterface
        public boolean request(String uri, String payload) {
            return tv.request(uri, payload);
        }

        @JavascriptInterface
        public boolean key(String name) {
            return tv.key(name);
        }

        @JavascriptInterface
        public String getPref(String name) {
            return prefs.getString("ui_" + name, "");
        }

        @JavascriptInterface
        public void setPref(String name, String value) {
            prefs.edit().putString("ui_" + name, value).apply();
        }

        @JavascriptInterface
        public String savedIp() {
            return prefs.getString("ip", "");
        }

        @JavascriptInterface
        public void vibrate() {
            if (vibrator == null || !vibrator.hasVibrator()) {
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(12);
            }
        }
    }
}
