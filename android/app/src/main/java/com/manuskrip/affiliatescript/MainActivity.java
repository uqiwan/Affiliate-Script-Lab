package com.manuskrip.affiliatescript;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity untuk Gagaswara Teleprompter berbasis Capacitor.
 * Menyediakan antarmuka komunikasi (bridge) antara Web App dan layanan native Android
 * (FloatingPrompterService, Izin Overlay SYSTEM_ALERT_WINDOW, Papan Klip, Notifikasi).
 */
public class MainActivity extends BridgeActivity {
    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 1234;
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 5678;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupWebBridge();
        checkAndRequestNotificationPermission();
        handlePrompterIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handlePrompterIntent(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        setupWebBridge();
        handlePrompterIntent(getIntent());
    }

    private void handlePrompterIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("open_full_prompter", false)) {
            intent.removeExtra("open_full_prompter");
            try {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    this.bridge.getWebView().evaluateJavascript(
                        "if (window.__openFullPrompterFromNative) { window.__openFullPrompterFromNative(); }",
                        null
                    );
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void setupWebBridge() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                android.webkit.WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setJavaScriptEnabled(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(true);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
                    cookieManager.setAcceptCookie(true);
                    cookieManager.setAcceptThirdPartyCookies(webView, true);
                }

                webView.addJavascriptInterface(new AndroidFloatingBridge(), "AndroidFloatingBridge");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void checkAndRequestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                );
            }
        }
    }

    public class AndroidFloatingBridge {
        @JavascriptInterface
        public boolean checkOverlayPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                return Settings.canDrawOverlays(MainActivity.this);
            }
            return true;
        }

        @JavascriptInterface
        public void requestOverlayPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(MainActivity.this)) {
                    Intent intent = new Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName())
                    );
                    startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
                } else {
                    Toast.makeText(MainActivity.this, "Izin Melayang sudah aktif!", Toast.LENGTH_SHORT).show();
                }
            }
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                runOnUiThread(() -> checkAndRequestNotificationPermission());
            }
        }

        @JavascriptInterface
        public String getClipboardText() {
            try {
                android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(android.content.Context.CLIPBOARD_SERVICE);
                if (clipboard != null && clipboard.hasPrimaryClip()) {
                    android.content.ClipData clip = clipboard.getPrimaryClip();
                    if (clip != null && clip.getItemCount() > 0) {
                        CharSequence text = clip.getItemAt(0).coerceToText(MainActivity.this);
                        if (text != null) {
                            return text.toString().trim();
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return "";
        }

        @JavascriptInterface
        public void copyToClipboard(String text) {
            try {
                android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(android.content.Context.CLIPBOARD_SERVICE);
                if (clipboard != null) {
                    android.content.ClipData clip = android.content.ClipData.newPlainText("Manuskrip Teleprompter", text);
                    clipboard.setPrimaryClip(clip);
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Teks berhasil disalin ke papan klip!", Toast.LENGTH_SHORT).show());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void startFloatingService(String scriptText, int speed, int fontSize) {
            startFloatingServiceDetailed(scriptText, speed, fontSize, 85, "#FFFFFF", false, true, 12, 3, 660, 740);
        }

        @JavascriptInterface
        public void startFloatingServiceDetailed(
            String scriptText,
            int speed,
            int fontSize,
            int opacity,
            String textColorHex,
            boolean isMirrored,
            boolean showFocusGuide,
            int focusGuidePercent,
            int countdownSec,
            int windowWidth,
            int windowHeight
        ) {
            startFloatingServiceFull(
                scriptText,
                speed,
                fontSize,
                opacity,
                textColorHex,
                "standard_read",
                0,
                isMirrored,
                showFocusGuide,
                focusGuidePercent,
                countdownSec,
                windowWidth,
                windowHeight
            );
        }

        @JavascriptInterface
        public void startFloatingServiceFull(
            String scriptText,
            String conceptsJson,
            int speed,
            int fontSize,
            int opacity,
            String textColorHex,
            String presetId,
            int rotation,
            boolean isMirrored,
            boolean showFocusGuide,
            int focusGuidePercent,
            int countdownSec,
            int windowWidth,
            int windowHeight
        ) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(MainActivity.this)) {
                requestOverlayPermission();
                return;
            }

            Intent intent = new Intent(MainActivity.this, FloatingPrompterService.class);
            intent.putExtra("scriptText", scriptText);
            intent.putExtra("conceptsJson", conceptsJson != null ? conceptsJson : "");
            intent.putExtra("speed", speed);
            intent.putExtra("fontSize", fontSize);
            intent.putExtra("opacity", opacity);
            intent.putExtra("textColorHex", textColorHex);
            intent.putExtra("presetId", presetId != null ? presetId : "standard_read");
            intent.putExtra("rotation", rotation);
            intent.putExtra("isMirrored", isMirrored);
            intent.putExtra("showFocusGuide", showFocusGuide);
            intent.putExtra("focusGuidePercent", focusGuidePercent);
            intent.putExtra("countdownSec", countdownSec);
            intent.putExtra("windowWidth", windowWidth);
            intent.putExtra("windowHeight", windowHeight);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }

            // Otomatis minimalkan MainActivity ke latar belakang agar prompter melayang langsung tampil di atas layar/kamera
            try {
                runOnUiThread(() -> moveTaskToBack(true));
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void startFloatingServiceFull(
            String scriptText,
            int speed,
            int fontSize,
            int opacity,
            String textColorHex,
            String presetId,
            int rotation,
            boolean isMirrored,
            boolean showFocusGuide,
            int focusGuidePercent,
            int countdownSec,
            int windowWidth,
            int windowHeight
        ) {
            startFloatingServiceFull(
                scriptText,
                "",
                speed,
                fontSize,
                opacity,
                textColorHex,
                presetId,
                rotation,
                isMirrored,
                showFocusGuide,
                focusGuidePercent,
                countdownSec,
                windowWidth,
                windowHeight
            );
        }

        @JavascriptInterface
        public void startFloatingServiceWithJson(String configJson) {
            try {
                org.json.JSONObject obj = new org.json.JSONObject(configJson);
                String scriptText = obj.optString("scriptText", "Skrip Teleprompter");
                String conceptsJson = obj.optString("conceptsJson", "");
                int speed = obj.optInt("speed", 3);
                int fontSize = obj.optInt("fontSize", 18);
                int opacity = obj.optInt("opacity", 85);
                String textColorHex = obj.optString("textColorHex", "#FFFFFF");
                String presetId = obj.optString("presetId", "standard_read");
                String themeId = obj.optString("themeId", "dark_pro");
                String backgroundColorHex = obj.optString("backgroundColorHex", "");
                String highlightColorHex = obj.optString("highlightColorHex", "");
                int rotation = obj.optInt("rotation", 0);
                boolean isMirrored = obj.optBoolean("isMirrored", false);
                boolean showFocusGuide = obj.optBoolean("showFocusGuide", true);
                int focusGuidePercent = obj.optInt("focusGuidePercent", 12);
                int countdownSec = obj.optInt("countdownSec", 3);
                int windowWidth = obj.optInt("windowWidth", 660);
                int windowHeight = obj.optInt("windowHeight", 740);

                Intent intent = new Intent(MainActivity.this, FloatingPrompterService.class);
                intent.putExtra("scriptText", scriptText);
                intent.putExtra("conceptsJson", conceptsJson != null ? conceptsJson : "");
                intent.putExtra("speed", speed);
                intent.putExtra("fontSize", fontSize);
                intent.putExtra("opacity", opacity);
                intent.putExtra("textColorHex", textColorHex);
                intent.putExtra("presetId", presetId != null ? presetId : "standard_read");
                intent.putExtra("themeId", themeId);
                intent.putExtra("backgroundColorHex", backgroundColorHex);
                intent.putExtra("highlightColorHex", highlightColorHex);
                intent.putExtra("rotation", rotation);
                intent.putExtra("isMirrored", isMirrored);
                intent.putExtra("showFocusGuide", showFocusGuide);
                intent.putExtra("focusGuidePercent", focusGuidePercent);
                intent.putExtra("countdownSec", countdownSec);
                intent.putExtra("windowWidth", windowWidth);
                intent.putExtra("windowHeight", windowHeight);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent);
                } else {
                    startService(intent);
                }

                try {
                    runOnUiThread(() -> moveTaskToBack(true));
                } catch (Exception ignored) {}
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void stopFloatingService() {
            Intent intent = new Intent(MainActivity.this, FloatingPrompterService.class);
            stopService(intent);
        }

        @JavascriptInterface
        public void minimizeApp() {
            try {
                runOnUiThread(() -> moveTaskToBack(true));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public String getSavedFloatingPrompterSettings() {
            try {
                android.content.SharedPreferences prefs = getSharedPreferences("gagaswara_prompter_prefs", android.content.Context.MODE_PRIVATE);
                org.json.JSONObject obj = new org.json.JSONObject();
                if (prefs.contains("speed")) obj.put("speed", prefs.getInt("speed", 3));
                if (prefs.contains("font_size")) obj.put("fontSize", prefs.getInt("font_size", 18));
                if (prefs.contains("opacity")) obj.put("opacity", prefs.getInt("opacity", 85));
                if (prefs.contains("theme_id")) obj.put("themeId", prefs.getString("theme_id", "dark_pro"));
                if (prefs.contains("preset_id")) obj.put("presetId", prefs.getString("preset_id", "standard_read"));
                if (prefs.contains("rotation")) obj.put("rotation", prefs.getInt("rotation", 0));
                if (prefs.contains("is_mirrored")) obj.put("isMirrored", prefs.getBoolean("is_mirrored", false));
                if (prefs.contains("show_focus_guide")) obj.put("showFocusGuide", prefs.getBoolean("show_focus_guide", true));
                if (prefs.contains("focus_percent")) obj.put("focusGuidePercent", prefs.getInt("focus_percent", 12));
                if (prefs.contains("countdown_sec")) obj.put("countdownSec", prefs.getInt("countdown_sec", 3));
                if (prefs.contains("window_width")) obj.put("windowWidth", prefs.getInt("window_width", 660));
                if (prefs.contains("window_height")) obj.put("windowHeight", prefs.getInt("window_height", 740));
                return obj.toString();
            } catch (Exception e) {
                e.printStackTrace();
                return "";
            }
        }

        @JavascriptInterface
        public void openAppDetailsSettings() {
            try {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == OVERLAY_PERMISSION_REQUEST_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Settings.canDrawOverlays(this)) {
                    Toast.makeText(this, "Izin Melayang (SYSTEM_ALERT_WINDOW) berhasil diberikan!", Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(this, "Izin diperlukan untuk menampilkan Teleprompter di atas aplikasi lain.", Toast.LENGTH_LONG).show();
                }
            }
        }
    }
}
