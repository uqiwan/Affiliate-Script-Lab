package com.manuskrip.affiliatescript;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 1234;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Konfigurasi WebView untuk mendukung Google Auth, Cookies, dan antarmuka JavaScript bridge
        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
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
        public void startFloatingService(String scriptText, int speed, int fontSize) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(MainActivity.this)) {
                requestOverlayPermission();
                return;
            }

            Intent intent = new Intent(MainActivity.this, FloatingPrompterService.class);
            intent.putExtra("scriptText", scriptText);
            intent.putExtra("speed", speed);
            intent.putExtra("fontSize", fontSize);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
        }

        @JavascriptInterface
        public void stopFloatingService() {
            Intent intent = new Intent(MainActivity.this, FloatingPrompterService.class);
            stopService(intent);
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
