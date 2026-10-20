package com.manuskrip.affiliatescript;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;

public class FloatingPrompterService extends Service {
    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private WebView webView;

    private static final String CHANNEL_ID = "gagaswara_prompter_channel";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundServiceNotification();

        String scriptText = "Halo kreator! Naskah teleprompter melayang Gagaswara siap digunakan...";
        int initialSpeed = 3;
        int initialFontSize = 18;
        int initialOpacity = 85;
        String initialColor = "#FFFFFF";
        String initialPresetId = "standard_read";
        int initialRotation = 0;
        boolean isMirrored = false;
        boolean showFocusGuide = true;
        int focusPercent = 12;
        int countdownSec = 3;
        int windowWidth = 660;
        int windowHeight = 740;

        if (intent != null) {
            if (intent.hasExtra("scriptText") && intent.getStringExtra("scriptText") != null) {
                scriptText = intent.getStringExtra("scriptText");
            }
            if (intent.hasExtra("presetId") && intent.getStringExtra("presetId") != null) {
                initialPresetId = intent.getStringExtra("presetId");
            }
            initialRotation = intent.getIntExtra("rotation", 0);
            initialSpeed = intent.getIntExtra("speed", 3);
            initialFontSize = intent.getIntExtra("fontSize", 18);
            initialOpacity = intent.getIntExtra("opacity", 85);
            if (intent.hasExtra("textColorHex") && intent.getStringExtra("textColorHex") != null) {
                initialColor = intent.getStringExtra("textColorHex");
            }
            isMirrored = intent.getBooleanExtra("isMirrored", false);
            showFocusGuide = intent.getBooleanExtra("showFocusGuide", true);
            focusPercent = intent.getIntExtra("focusGuidePercent", 12);
            countdownSec = intent.getIntExtra("countdownSec", 3);
            windowWidth = intent.getIntExtra("windowWidth", 660);
            windowHeight = intent.getIntExtra("windowHeight", 740);
        }

        initFloatingWebView(
            scriptText,
            initialSpeed,
            initialFontSize,
            initialOpacity,
            initialColor,
            initialPresetId,
            initialRotation,
            isMirrored,
            showFocusGuide,
            focusPercent,
            countdownSec,
            windowWidth,
            windowHeight
        );
        return START_NOT_STICKY;
    }

    private void startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Gagaswara Teleprompter Melayang",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Gagaswara Teleprompter Melayang")
            .setContentText("Prompter melayang aktif di atas kamera & aplikasi lain.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build();

        startForeground(1001, notification);
    }

    private void initFloatingWebView(
        String scriptText,
        int speed,
        int fontSize,
        int opacity,
        String textColor,
        String presetId,
        int rotation,
        boolean isMirrored,
        boolean showFocusGuide,
        int focusPercent,
        int countdownSec,
        int wWidth,
        int wHeight
    ) {
        if (floatingView != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(dm);
        int maxW = Math.max(340, dm.widthPixels - 32);
        int maxH = Math.max(400, (int) (dm.heightPixels * 0.85f));

        int width = Math.min(Math.max(340, wWidth), maxW);
        int height = Math.min(Math.max(420, wHeight), maxH);

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
            width,
            height,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 20;
        params.y = 70;

        // Container View
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.TRANSPARENT);

        // Native Top Drag Strip Handle
        LinearLayout dragStrip = new LinearLayout(this);
        dragStrip.setOrientation(LinearLayout.HORIZONTAL);
        dragStrip.setGravity(Gravity.CENTER);
        dragStrip.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            26
        ));
        dragStrip.setBackgroundColor(Color.parseColor("#4D111827"));

        View handlePill = new View(this);
        LinearLayout.LayoutParams pillParams = new LinearLayout.LayoutParams(56, 5);
        handlePill.setLayoutParams(pillParams);
        handlePill.setBackgroundColor(Color.parseColor("#FFF59E0B"));
        dragStrip.addView(handlePill);

        // Drag touch listener
        dragStrip.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = Math.max(0, initialX + (int) (event.getRawX() - initialTouchX));
                        params.y = Math.max(0, initialY + (int) (event.getRawY() - initialTouchY));
                        try {
                            windowManager.updateViewLayout(floatingView, params);
                        } catch (Exception ignored) {}
                        return true;
                }
                return false;
            }
        });

        // WebView with exact Web Styling
        webView = new WebView(this);
        LinearLayout.LayoutParams webParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1.0f
        );
        webView.setLayoutParams(webParams);
        webView.setBackgroundColor(Color.TRANSPARENT);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setSupportZoom(false);
        ws.setDefaultTextEncodingName("UTF-8");

        webView.addJavascriptInterface(new PrompterBridge(), "AndroidPrompterBridge");

        String fullHtml = buildFloatingHtml(
            scriptText,
            speed,
            fontSize,
            opacity,
            textColor,
            presetId,
            rotation,
            isMirrored,
            showFocusGuide,
            focusPercent,
            countdownSec
        );

        webView.loadDataWithBaseURL("https://gagaswara.local", fullHtml, "text/html", "UTF-8", null);

        root.addView(dragStrip);
        root.addView(webView);

        floatingView = root;
        windowManager.addView(floatingView, params);
    }

    public class PrompterBridge {
        @JavascriptInterface
        public void closePrompter() {
            stopSelf();
        }

        @JavascriptInterface
        public void setWindowSize(int w, int h) {
            try {
                DisplayMetrics dm = new DisplayMetrics();
                windowManager.getDefaultDisplay().getMetrics(dm);
                int maxW = Math.max(320, dm.widthPixels - 24);
                int maxH = Math.max(380, (int) (dm.heightPixels * 0.85f));

                params.width = Math.min(Math.max(320, w), maxW);
                params.height = Math.min(Math.max(380, h), maxH);
                windowManager.updateViewLayout(floatingView, params);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void openFullApp() {
            try {
                Intent launchIntent = new Intent(FloatingPrompterService.this, MainActivity.class);
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(launchIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void showToast(String msg) {
            Toast.makeText(FloatingPrompterService.this, msg, Toast.LENGTH_SHORT).show();
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    private String buildFloatingHtml(
        String scriptText,
        int speed,
        int fontSize,
        int opacity,
        String textColor,
        String presetId,
        int rotation,
        boolean isMirrored,
        boolean showFocusGuide,
        int focusPercent,
        int countdownSec
    ) {
        String scriptJson = escapeJson(scriptText);
        String safePresetId = (presetId != null && !presetId.isEmpty()) ? presetId : "standard_read";

        return "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<head>\n" +
            "  <meta charset=\"UTF-8\" />\n" +
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\" />\n" +
            "  <style>\n" +
            "    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; margin: 0; padding: 0; }\n" +
            "    html, body {\n" +
            "      width: 100%; height: 100%; background: transparent; overflow: hidden;\n" +
            "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
            "    }\n" +
            "    #app-container {\n" +
            "      width: 100%; height: 100%; display: flex; flex-direction: column;\n" +
            "      border-radius: 18px; border: 1px solid rgba(255,255,255,0.18);\n" +
            "      box-shadow: 0 16px 40px rgba(0,0,0,0.65);\n" +
            "      overflow: hidden; position: relative;\n" +
            "      transition: background-color 0.2s ease;\n" +
            "    }\n" +
            "    #content-area {\n" +
            "      flex: 1; position: relative; overflow: hidden; cursor: pointer;\n" +
            "    }\n" +
            "    #focus-guide {\n" +
            "      position: absolute; left: 0; right: 0; z-index: 20; transform: translateY(-50%);\n" +
            "      display: flex; align-items: center; justify-content: space-between;\n" +
            "      padding: 0 8px; pointer-events: none;\n" +
            "    }\n" +
            "    #focus-line {\n" +
            "      flex: 1; height: 2px;\n" +
            "      background: linear-gradient(90deg, rgba(245,158,11,0.8), #FDE047, rgba(245,158,11,0.8));\n" +
            "      box-shadow: 0 0 8px rgba(245,158,11,0.8);\n" +
            "    }\n" +
            "    #focus-badge {\n" +
            "      font-size: 9px; font-weight: bold; color: #FDE047; font-family: monospace;\n" +
            "      padding-left: 6px; text-shadow: 0 1px 2px black;\n" +
            "    }\n" +
            "    #scroll-container {\n" +
            "      width: 100%; height: 100%; overflow-y: scroll; padding: 10px 14px 180px 14px;\n" +
            "      scrollbar-width: none;\n" +
            "    }\n" +
            "    #scroll-container::-webkit-scrollbar { display: none; }\n" +
            "    #script-content {\n" +
            "      transition: transform 0.2s ease;\n" +
            "    }\n" +
            "    .concept-header {\n" +
            "      display: inline-flex; align-items: center; gap: 6px;\n" +
            "      padding: 3px 8px; border-radius: 8px; margin: 10px 0 6px 0;\n" +
            "      background: rgba(31, 41, 55, 0.85); border: 1px solid rgba(55, 65, 81, 0.8);\n" +
            "      font-size: 11px; font-weight: bold; color: #F59E0B;\n" +
            "    }\n" +
            "    .concept-title {\n" +
            "      color: #E5E7EB; font-weight: 600;\n" +
            "    }\n" +
            "    .prompter-line {\n" +
            "      margin-bottom: 8px; transition: font-size 0.15s ease;\n" +
            "    }\n" +
            "    .highlight-word {\n" +
            "      font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em;\n" +
            "    }\n" +
            "    .pause-short { opacity: 0.6; margin: 0 4px; }\n" +
            "    .pause-long { opacity: 0.85; margin: 0 4px; font-weight: bold; }\n" +
            "    .line-focus-style {\n" +
            "      border-left: 4px solid #38BDF8 !important; padding-left: 10px !important;\n" +
            "      border-radius: 0 12px 12px 0 !important; background: rgba(15, 23, 42, 0.65) !important;\n" +
            "    }\n" +
            "    /* Hitung Mundur (Countdown) */\n" +
            "    #countdown-overlay {\n" +
            "      position: absolute; inset: 0; z-index: 40; background: rgba(0,0,0,0.85);\n" +
            "      display: none; flex-direction: column; align-items: center; justify-content: center;\n" +
            "    }\n" +
            "    #countdown-num {\n" +
            "      font-size: 72px; font-weight: 900; color: #F59E0B; text-shadow: 0 0 24px rgba(245,158,11,0.8);\n" +
            "      animation: bounce 0.8s infinite;\n" +
            "    }\n" +
            "    @keyframes bounce {\n" +
            "      0%, 100% { transform: scale(1); }\n" +
            "      50% { transform: scale(1.15); }\n" +
            "    }\n" +
            "    /* Tap Feedback Pulse */\n" +
            "    #tap-feedback {\n" +
            "      position: absolute; inset: 0; z-index: 35; pointer-events: none;\n" +
            "      display: none; align-items: center; justify-content: center;\n" +
            "    }\n" +
            "    .pulse-badge {\n" +
            "      width: 52px; height: 52px; border-radius: 50%;\n" +
            "      background: rgba(0,0,0,0.8); border: 2px solid #F59E0B;\n" +
            "      color: #F59E0B; font-size: 22px; display: flex; align-items: center; justify-content: center;\n" +
            "      box-shadow: 0 0 24px rgba(245,158,11,0.5); animation: pulseOut 0.4s ease forwards;\n" +
            "    }\n" +
            "    @keyframes pulseOut {\n" +
            "      0% { opacity: 1; transform: scale(0.85); }\n" +
            "      100% { opacity: 0; transform: scale(1.25); }\n" +
            "    }\n" +
            "    /* Bottom Dock Bar */\n" +
            "    #bottom-dock {\n" +
            "      height: 48px; background: rgba(17, 24, 39, 0.95);\n" +
            "      border-top: 1px solid rgba(255,255,255,0.1); padding: 0 8px;\n" +
            "      display: flex; align-items: center; justify-content: space-between; gap: 6px;\n" +
            "      z-index: 30; transition: transform 0.2s ease, opacity 0.2s ease;\n" +
            "    }\n" +
            "    .dock-btn {\n" +
            "      border: none; outline: none; border-radius: 10px;\n" +
            "      display: flex; align-items: center; justify-content: center;\n" +
            "      background: #1F2937; color: white; font-weight: bold; cursor: pointer;\n" +
            "      height: 34px; padding: 0 8px; font-size: 11px;\n" +
            "    }\n" +
            "    .dock-btn:active { transform: scale(0.95); }\n" +
            "    #hero-play {\n" +
            "      background: #F59E0B; color: black; font-weight: 800; font-size: 13px;\n" +
            "      flex: 1; max-width: 110px; height: 36px; border-radius: 12px;\n" +
            "      box-shadow: 0 4px 14px rgba(245,158,11,0.3);\n" +
            "    }\n" +
            "    /* Speed Stepper */\n" +
            "    .stepper-box {\n" +
            "      display: flex; align-items: center; background: #1F2937; border-radius: 10px;\n" +
            "      padding: 2px; border: 1px solid #374151;\n" +
            "    }\n" +
            "    .stepper-btn {\n" +
            "      width: 26px; height: 30px; border: none; background: transparent; color: white;\n" +
            "      font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center;\n" +
            "    }\n" +
            "    .stepper-label {\n" +
            "      padding: 0 6px; font-family: monospace; font-size: 12px; font-weight: bold; color: #FEF08A;\n" +
            "    }\n" +
            "    /* Settings Panel */\n" +
            "    #settings-panel {\n" +
            "      position: absolute; bottom: 52px; left: 6px; right: 6px; z-index: 50;\n" +
            "      background: rgba(10, 14, 23, 0.96); border: 1px solid #374151; border-radius: 16px;\n" +
            "      padding: 10px; display: none; flex-direction: column; gap: 8px; color: #E5E7EB;\n" +
            "      box-shadow: 0 16px 32px rgba(0,0,0,0.8); max-height: 80%; overflow-y: auto;\n" +
            "    }\n" +
            "    .tabs-row {\n" +
            "      display: flex; background: #111827; border-radius: 10px; padding: 2px; gap: 2px;\n" +
            "    }\n" +
            "    .tab-item {\n" +
            "      flex: 1; padding: 6px 0; text-align: center; font-size: 11px; font-weight: bold;\n" +
            "      border-radius: 8px; color: #9CA3AF; cursor: pointer;\n" +
            "    }\n" +
            "    .tab-item.active {\n" +
            "      background: #F59E0B; color: black;\n" +
            "    }\n" +
            "    .setting-group { display: flex; flex-direction: column; gap: 4px; }\n" +
            "    .setting-label { font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; align-items: center; }\n" +
            "    .slider-input { width: 100%; accent-color: #F59E0B; height: 5px; }\n" +
            "    .presets-container { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }\n" +
            "    .preset-row {\n" +
            "      display: flex; align-items: center; justify-content: space-between; padding: 6px 8px;\n" +
            "      border-radius: 10px; background: #1F2937; border: 1px solid #374151; cursor: pointer;\n" +
            "    }\n" +
            "    .preset-row.active {\n" +
            "      border-color: #F59E0B; background: rgba(245,158,11,0.2);\n" +
            "    }\n" +
            "    .preset-preview-box {\n" +
            "      padding: 2px 6px; border-radius: 4px; background: black; border: 1px solid #4B5563;\n" +
            "      font-size: 11px; font-weight: bold; margin-right: 8px;\n" +
            "    }\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <div id=\"app-container\" style=\"background-color: rgba(0,0,0," + (opacity / 100.0) + ");\">\n" +
            "    <!-- Reading Area -->\n" +
            "    <div id=\"content-area\" onclick=\"handleScreenTap()\">\n" +
            "      <!-- Focus Guide Line -->\n" +
            "      <div id=\"focus-guide\" style=\"top: " + focusPercent + "%; display: " + (showFocusGuide ? "flex" : "none") + ";\">\n" +
            "        <div id=\"focus-line\"></div>\n" +
            "        <span id=\"focus-badge\">" + focusPercent + "%</span>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Countdown Overlay -->\n" +
            "      <div id=\"countdown-overlay\" onclick=\"skipCountdown(event)\">\n" +
            "        <div id=\"countdown-num\">3</div>\n" +
            "        <div style=\"font-size:11px; color:#D1D5DB; margin-top:6px;\">Ketuk untuk langsung mulai</div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Tap Pulse Feedback -->\n" +
            "      <div id=\"tap-feedback\">\n" +
            "        <div id=\"pulse-badge\" class=\"pulse-badge\">▶</div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Scrolling text container -->\n" +
            "      <div id=\"scroll-container\">\n" +
            "        <div id=\"script-content\" style=\"transform: " + (rotation != 0 ? "rotate(" + rotation + "deg) " : "") + (isMirrored ? "scaleX(-1)" : "") + ";\">\n" +
            "        </div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <!-- In-Overlay Settings Panel (Tabs: Teks, Countdown, Layar) -->\n" +
            "    <div id=\"settings-panel\" onclick=\"event.stopPropagation()\">\n" +
            "      <div style=\"display:flex; justify-content:space-between; align-items:center;\">\n" +
            "        <span style=\"font-weight:bold; font-size:12px; color:#F59E0B;\">⚙️ Pengaturan Teleprompter</span>\n" +
            "        <button onclick=\"toggleSettings()\" style=\"background:transparent; border:none; color:#9CA3AF; font-size:15px; font-weight:bold; cursor:pointer;\">✕</button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Tabs -->\n" +
            "      <div class=\"tabs-row\">\n" +
            "        <div id=\"tab-teks\" class=\"tab-item active\" onclick=\"switchTab('teks')\">Teks</div>\n" +
            "        <div id=\"tab-countdown\" class=\"tab-item\" onclick=\"switchTab('countdown')\">Countdown</div>\n" +
            "        <div id=\"tab-layar\" class=\"tab-item\" onclick=\"switchTab('layar')\">Layar</div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Teks: Ukuran Font & 10 Gaya Subtitle -->\n" +
            "      <div id=\"panel-teks\" style=\"display:flex; flex-direction:column; gap:8px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Ukuran Font (Mulai dari 7px):</span>\n" +
            "            <span id=\"font-label\" style=\"color:#FEF08A; font-weight:bold;\">" + fontSize + "px</span>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"7\" max=\"48\" value=\"" + fontSize + "\" class=\"slider-input\" oninput=\"updateFontSize(this.value)\" />\n" +
            "        </div>\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\"><span>Pilih 10 Gaya Subtitle Siap Rekam:</span></div>\n" +
            "          <div id=\"presets-list\" class=\"presets-container\"></div>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Countdown -->\n" +
            "      <div id=\"panel-countdown\" style=\"display:none; flex-direction:column; gap:8px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Hitung Mundur (Countdown):</span>\n" +
            "            <button onclick=\"toggleCountdownEnabled()\" id=\"cd-toggle-btn\" style=\"background:#374151; border:none; border-radius:6px; color:white; font-size:10px; padding:2px 8px;\">" + (countdownSec > 0 ? "Aktif" : "Nonaktif") + "</button>\n" +
            "          </div>\n" +
            "          <div class=\"setting-label\" style=\"margin-top:4px;\">\n" +
            "            <span>Durasi:</span>\n" +
            "            <span id=\"cd-label\" style=\"color:#FEF08A; font-weight:bold;\">" + (countdownSec > 0 ? (countdownSec + " Detik") : "Langsung") + "</span>\n" +
            "          </div>\n" +
            "          <div style=\"display:flex; gap:6px; margin-top:2px;\">\n" +
            "            <button class=\"dock-btn\" style=\"flex:1;\" onclick=\"setCd(0)\">Langsung</button>\n" +
            "            <button class=\"dock-btn\" style=\"flex:1;\" onclick=\"setCd(3)\">3 Detik</button>\n" +
            "            <button class=\"dock-btn\" style=\"flex:1;\" onclick=\"setCd(5)\">5 Detik</button>\n" +
            "            <button class=\"dock-btn\" style=\"flex:1;\" onclick=\"setCd(10)\">10 Detik</button>\n" +
            "          </div>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Layar -->\n" +
            "      <div id=\"panel-layar\" style=\"display:none; flex-direction:column; gap:8px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Transparansi / Opasitas Latar:</span>\n" +
            "            <span id=\"op-label\" style=\"color:#FEF08A; font-weight:bold;\">" + opacity + "%</span>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"10\" max=\"100\" value=\"" + opacity + "\" class=\"slider-input\" oninput=\"updateOpacity(this.value)\" />\n" +
            "        </div>\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Garis Tatap Mata:</span>\n" +
            "            <button onclick=\"toggleFocusGuide()\" id=\"guide-toggle-btn\" style=\"background:#374151; border:none; border-radius:6px; color:white; font-size:10px; padding:2px 8px;\">" + (showFocusGuide ? "Aktif" : "Nonaktif") + "</button>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"5\" max=\"50\" value=\"" + focusPercent + "\" class=\"slider-input\" oninput=\"updateFocusPercent(this.value)\" />\n" +
            "        </div>\n" +
            "        <div style=\"display:flex; gap:6px; padding-top:4px;\">\n" +
            "          <button class=\"dock-btn\" style=\"flex:1;\" onclick=\"toggleMirror()\">Mirror Kaca</button>\n" +
            "          <button class=\"dock-btn\" style=\"flex:1; color:#FEF08A;\" onclick=\"cycleSize()\">Ukuran Jendela ⇲</button>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <!-- Bottom Dock -->\n" +
            "    <div id=\"bottom-dock\" onclick=\"event.stopPropagation()\">\n" +
            "      <button class=\"dock-btn\" onclick=\"rotateText()\" title=\"Rotasi Teks (0°, 90°, 180°, 270°)\">↻</button>\n" +
            "      <button class=\"dock-btn\" onclick=\"resetScroll()\" title=\"Reset ke Atas\">↺</button>\n" +
            "\n" +
            "      <!-- Speed Stepper -->\n" +
            "      <div class=\"stepper-box\">\n" +
            "        <button class=\"stepper-btn\" onclick=\"changeSpeed(-1)\">-</button>\n" +
            "        <span id=\"speed-stepper-label\" class=\"stepper-label\">" + speed + "x</span>\n" +
            "        <button class=\"stepper-btn\" onclick=\"changeSpeed(1)\">+</button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Hero Play / Pause -->\n" +
            "      <button id=\"hero-play\" onclick=\"togglePlay()\">▶ Mulai</button>\n" +
            "\n" +
            "      <!-- Full App Mode -->\n" +
            "      <button class=\"dock-btn\" onclick=\"openFullApp()\" title=\"Layar Penuh / Kembali ke Aplikasi\">⤢</button>\n" +
            "\n" +
            "      <!-- Settings Panel -->\n" +
            "      <button class=\"dock-btn\" onclick=\"toggleSettings()\" title=\"Pengaturan\">⚙</button>\n" +
            "\n" +
            "      <!-- Close -->\n" +
            "      <button class=\"dock-btn\" style=\"background:#DC2626; color:white;\" onclick=\"closePrompter()\" title=\"Tutup Teleprompter\">✕</button>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "\n" +
            "  <script>\n" +
            "    const RAW_SCRIPT = \"" + scriptJson + "\";\n" +
            "\n" +
            "    // Exact 10 Subtitle Presets matching SUBTITLE_PRESETS\n" +
            "    const SUBTITLE_PRESETS = [\n" +
            "      {\n" +
            "        id: 'standard_read',\n" +
            "        name: '1. Standard Read (Normal)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#FACC15',\n" +
            "        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '400',\n" +
            "        lineHeight: '1.5',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'large_text',\n" +
            "        name: '2. Large Text (Teks Besar)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#FEF08A',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '700',\n" +
            "        lineHeight: '1.45',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'high_contrast',\n" +
            "        name: '3. High Contrast (Kontras Tinggi)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#22D3EE',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '700',\n" +
            "        lineHeight: '1.45',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'daylight_read',\n" +
            "        name: '4. Daylight Read (Mode Terang)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#FB923C',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '700',\n" +
            "        lineHeight: '1.45',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'eye_comfort',\n" +
            "        name: '5. Eye Comfort (Nyaman di Mata)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#6EE7B7',\n" +
            "        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.9)',\n" +
            "        fontWeight: '400',\n" +
            "        lineHeight: '1.5',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'wide_spacing',\n" +
            "        name: '6. Wide Spacing (Spasi Lebar)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#F472B6',\n" +
            "        textShadow: '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '600',\n" +
            "        lineHeight: '1.65',\n" +
            "        letterSpacing: '0.06em',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'distance_max',\n" +
            "        name: '7. Distance Max (Jarak Jauh)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#FDE047',\n" +
            "        textShadow: '2.5px 2.5px 0 #000, -2.5px -2.5px 0 #000, 2.5px -2.5px 0 #000, -2.5px 2.5px 0 #000, 0 4px 8px rgba(0,0,0,1)',\n" +
            "        fontWeight: '800',\n" +
            "        lineHeight: '1.4',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'line_focus',\n" +
            "        name: '8. Line Focus (Fokus Baris)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#38BDF8',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '600',\n" +
            "        lineHeight: '1.5',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: true\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'speaker_mode',\n" +
            "        name: '9. Speaker Mode (Mode Pembicara)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#FB923C',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '600',\n" +
            "        lineHeight: '1.5',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      },\n" +
            "      {\n" +
            "        id: 'studio_pro',\n" +
            "        name: '10. Studio Pro (Profesional)',\n" +
            "        textColor: '#FFFFFF',\n" +
            "        highlightColor: '#EAB308',\n" +
            "        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.95)',\n" +
            "        fontWeight: '700',\n" +
            "        lineHeight: '1.5',\n" +
            "        letterSpacing: 'normal',\n" +
            "        isLineFocus: false\n" +
            "      }\n" +
            "    ];\n" +
            "\n" +
            "    let isPlaying = false;\n" +
            "    let isCountingDown = false;\n" +
            "    let currentSpeed = " + speed + ";\n" +
            "    let currentFontSize = " + fontSize + ";\n" +
            "    let currentOpacity = " + opacity + ";\n" +
            "    let currentPresetId = '" + safePresetId + "';\n" +
            "    let isMirrored = " + isMirrored + ";\n" +
            "    let showFocus = " + showFocusGuide + ";\n" +
            "    let focusPercent = " + focusPercent + ";\n" +
            "    let countdownSec = " + countdownSec + ";\n" +
            "    let currentRotation = " + rotation + ";\n" +
            "    let windowSizeIndex = 1;\n" +
            "\n" +
            "    const SPEED_PIXELS = [2.5, 4.5, 7.5, 11, 16, 23, 32, 43, 56, 72];\n" +
            "    let lastTimestamp = null;\n" +
            "    let scrollAccumulator = 0;\n" +
            "    let scrollAnimId = null;\n" +
            "\n" +
            "    const scrollContainer = document.getElementById('scroll-container');\n" +
            "    const scriptContent = document.getElementById('script-content');\n" +
            "    const heroPlay = document.getElementById('hero-play');\n" +
            "    const cdOverlay = document.getElementById('countdown-overlay');\n" +
            "    const cdNum = document.getElementById('countdown-num');\n" +
            "    const bottomDock = document.getElementById('bottom-dock');\n" +
            "    const settingsPanel = document.getElementById('settings-panel');\n" +
            "    const appContainer = document.getElementById('app-container');\n" +
            "    const tapFeedback = document.getElementById('tap-feedback');\n" +
            "    const pulseBadge = document.getElementById('pulse-badge');\n" +
            "\n" +
            "    function escapeHtml(t) {\n" +
            "      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\n" +
            "    }\n" +
            "\n" +
            "    function parseAndRenderScript() {\n" +
            "      const activePreset = SUBTITLE_PRESETS.find(p => p.id === currentPresetId) || SUBTITLE_PRESETS[0];\n" +
            "      const lines = RAW_SCRIPT.split('\\n');\n" +
            "      let html = '';\n" +
            "\n" +
            "      for (let i = 0; i < lines.length; i++) {\n" +
            "        let line = lines[i].trim();\n" +
            "        if (!line) continue;\n" +
            "\n" +
            "        if (line.startsWith('===') && line.endsWith('===')) {\n" +
            "          const title = line.replace(/===/g, '').trim();\n" +
            "          html += '<div class=\"concept-header\"><span class=\"concept-badge\">Konsep:</span><span class=\"concept-title\">' + escapeHtml(title) + '</span></div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "        if (line === '---') {\n" +
            "          html += '<div style=\"height:16px; border-bottom:1px dashed rgba(255,255,255,0.15); margin-bottom:12px;\"></div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "\n" +
            "        // Process words for emphasis / pause markers\n" +
            "        const words = line.split(/\\s+/);\n" +
            "        let formattedLine = '';\n" +
            "        for (let j = 0; j < words.length; j++) {\n" +
            "          const w = words[j];\n" +
            "          if (w === '//') {\n" +
            "            formattedLine += '<span class=\"pause-long\">//</span> ';\n" +
            "          } else if (w === '/') {\n" +
            "            formattedLine += '<span class=\"pause-short\">/</span> ';\n" +
            "          } else if (w.length >= 2 && w === w.toUpperCase() && /[A-Z]/.test(w)) {\n" +
            "            formattedLine += '<span class=\"highlight-word\" style=\"color:' + activePreset.highlightColor + ';\">' + escapeHtml(w) + '</span> ';\n" +
            "          } else {\n" +
            "            formattedLine += escapeHtml(w) + ' ';\n" +
            "          }\n" +
            "        }\n" +
            "\n" +
            "        const lineClass = 'prompter-line' + (activePreset.isLineFocus ? ' line-focus-style' : '');\n" +
            "        html += '<div class=\"' + lineClass + '\" style=\"font-size:' + currentFontSize + 'px; color:' + activePreset.textColor + '; text-shadow:' + activePreset.textShadow + '; font-weight:' + activePreset.fontWeight + '; line-height:' + activePreset.lineHeight + '; letter-spacing:' + activePreset.letterSpacing + ';\">' + formattedLine + '</div>';\n" +
            "      }\n" +
            "\n" +
            "      html += '<div style=\"height: 220px; display:flex; align-items:center; justify-content:center; color:#9CA3AF; font-size:11px;\">- Selesai Membaca -</div>';\n" +
            "      scriptContent.innerHTML = html;\n" +
            "    }\n" +
            "\n" +
            "    function renderPresetsList() {\n" +
            "      const container = document.getElementById('presets-list');\n" +
            "      let html = '';\n" +
            "      for (let i = 0; i < SUBTITLE_PRESETS.length; i++) {\n" +
            "        const p = SUBTITLE_PRESETS[i];\n" +
            "        const isActive = p.id === currentPresetId;\n" +
            "        html += '<div class=\"preset-row' + (isActive ? ' active' : '') + '\" onclick=\"selectPreset(\\'' + p.id + '\\')\">' +\n" +
            "                  '<div style=\"display:flex; align-items:center;\">' +\n" +
            "                    '<span class=\"preset-preview-box\" style=\"color:' + p.textColor + '; text-shadow:' + p.textShadow + '; font-weight:' + p.fontWeight + ';\">Aa</span>' +\n" +
            "                    '<span style=\"font-size:11px; font-weight:600; color:' + (isActive ? '#FEF08A' : '#E5E7EB') + ';\">' + p.name + '</span>' +\n" +
            "                  '</div>' +\n" +
            "                  (isActive ? '<span style=\"color:#F59E0B; font-weight:bold; font-size:12px;\">✓</span>' : '') +\n" +
            "                '</div>';\n" +
            "      }\n" +
            "      container.innerHTML = html;\n" +
            "    }\n" +
            "\n" +
            "    function selectPreset(id) {\n" +
            "      currentPresetId = id;\n" +
            "      renderPresetsList();\n" +
            "      parseAndRenderScript();\n" +
            "    }\n" +
            "\n" +
            "    function scrollStep(timestamp) {\n" +
            "      if (!lastTimestamp) lastTimestamp = timestamp;\n" +
            "      const dt = timestamp - lastTimestamp;\n" +
            "      lastTimestamp = timestamp;\n" +
            "\n" +
            "      if (isPlaying && scrollContainer) {\n" +
            "        const pxPerSec = SPEED_PIXELS[Math.max(1, Math.min(10, currentSpeed)) - 1];\n" +
            "        scrollAccumulator += (pxPerSec * dt) / 1000;\n" +
            "        if (scrollAccumulator >= 0.5) {\n" +
            "          const delta = Math.floor(scrollAccumulator);\n" +
            "          scrollContainer.scrollTop += delta;\n" +
            "          scrollAccumulator -= delta;\n" +
            "          if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight - 2) {\n" +
            "            pauseScrolling();\n" +
            "            return;\n" +
            "          }\n" +
            "        }\n" +
            "      }\n" +
            "      if (isPlaying) {\n" +
            "        scrollAnimId = requestAnimationFrame(scrollStep);\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function showTapPulse(isStarting) {\n" +
            "      pulseBadge.innerText = isStarting ? '▶' : '❚❚';\n" +
            "      tapFeedback.style.display = 'flex';\n" +
            "      setTimeout(() => {\n" +
            "        tapFeedback.style.display = 'none';\n" +
            "      }, 420);\n" +
            "    }\n" +
            "\n" +
            "    function startScrolling() {\n" +
            "      isPlaying = true;\n" +
            "      isCountingDown = false;\n" +
            "      cdOverlay.style.display = 'none';\n" +
            "      settingsPanel.style.display = 'none';\n" +
            "      bottomDock.style.display = 'none';\n" +
            "      heroPlay.innerText = '❚❚ Jeda';\n" +
            "      heroPlay.style.background = '#EF4444';\n" +
            "      heroPlay.style.color = '#FFFFFF';\n" +
            "      lastTimestamp = null;\n" +
            "      showTapPulse(true);\n" +
            "      scrollAnimId = requestAnimationFrame(scrollStep);\n" +
            "    }\n" +
            "\n" +
            "    function pauseScrolling() {\n" +
            "      isPlaying = false;\n" +
            "      isCountingDown = false;\n" +
            "      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);\n" +
            "      cdOverlay.style.display = 'none';\n" +
            "      bottomDock.style.display = 'flex';\n" +
            "      heroPlay.innerText = '▶ Mulai';\n" +
            "      heroPlay.style.background = '#F59E0B';\n" +
            "      heroPlay.style.color = '#000000';\n" +
            "      showTapPulse(false);\n" +
            "    }\n" +
            "\n" +
            "    function togglePlay() {\n" +
            "      if (isPlaying) {\n" +
            "        pauseScrolling();\n" +
            "      } else if (countdownSec > 0) {\n" +
            "        runCountdown();\n" +
            "      } else {\n" +
            "        startScrolling();\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function runCountdown() {\n" +
            "      isCountingDown = true;\n" +
            "      let remaining = countdownSec;\n" +
            "      cdNum.innerText = remaining;\n" +
            "      cdOverlay.style.display = 'flex';\n" +
            "      settingsPanel.style.display = 'none';\n" +
            "      const timer = setInterval(() => {\n" +
            "        if (!isCountingDown) { clearInterval(timer); return; }\n" +
            "        remaining--;\n" +
            "        if (remaining <= 0) {\n" +
            "          clearInterval(timer);\n" +
            "          startScrolling();\n" +
            "        } else {\n" +
            "          cdNum.innerText = remaining;\n" +
            "        }\n" +
            "      }, 1000);\n" +
            "    }\n" +
            "\n" +
            "    function skipCountdown(e) {\n" +
            "      if (e) e.stopPropagation();\n" +
            "      startScrolling();\n" +
            "    }\n" +
            "\n" +
            "    function handleScreenTap() {\n" +
            "      if (isPlaying) {\n" +
            "        pauseScrolling();\n" +
            "      } else if (isCountingDown) {\n" +
            "        startScrolling();\n" +
            "      } else {\n" +
            "        togglePlay();\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function resetScroll() {\n" +
            "      pauseScrolling();\n" +
            "      scrollAccumulator = 0;\n" +
            "      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });\n" +
            "    }\n" +
            "\n" +
            "    function changeSpeed(delta) {\n" +
            "      currentSpeed = Math.max(1, Math.min(10, currentSpeed + delta));\n" +
            "      document.getElementById('speed-stepper-label').innerText = currentSpeed + 'x';\n" +
            "    }\n" +
            "\n" +
            "    function toggleSettings() {\n" +
            "      if (settingsPanel.style.display === 'flex') {\n" +
            "        settingsPanel.style.display = 'none';\n" +
            "      } else {\n" +
            "        settingsPanel.style.display = 'flex';\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function switchTab(tab) {\n" +
            "      document.getElementById('tab-teks').className = 'tab-item' + (tab === 'teks' ? ' active' : '');\n" +
            "      document.getElementById('tab-countdown').className = 'tab-item' + (tab === 'countdown' ? ' active' : '');\n" +
            "      document.getElementById('tab-layar').className = 'tab-item' + (tab === 'layar' ? ' active' : '');\n" +
            "      document.getElementById('panel-teks').style.display = (tab === 'teks' ? 'flex' : 'none');\n" +
            "      document.getElementById('panel-countdown').style.display = (tab === 'countdown' ? 'flex' : 'none');\n" +
            "      document.getElementById('panel-layar').style.display = (tab === 'layar' ? 'flex' : 'none');\n" +
            "    }\n" +
            "\n" +
            "    function updateFontSize(val) {\n" +
            "      currentFontSize = val;\n" +
            "      document.getElementById('font-label').innerText = val + 'px';\n" +
            "      parseAndRenderScript();\n" +
            "    }\n" +
            "\n" +
            "    function updateOpacity(val) {\n" +
            "      currentOpacity = val;\n" +
            "      document.getElementById('op-label').innerText = val + '%';\n" +
            "      appContainer.style.backgroundColor = 'rgba(0,0,0,' + (val / 100) + ')';\n" +
            "    }\n" +
            "\n" +
            "    function setCd(sec) {\n" +
            "      countdownSec = sec;\n" +
            "      document.getElementById('cd-label').innerText = sec > 0 ? (sec + ' Detik') : 'Langsung';\n" +
            "      document.getElementById('cd-toggle-btn').innerText = sec > 0 ? 'Aktif' : 'Nonaktif';\n" +
            "    }\n" +
            "\n" +
            "    function toggleCountdownEnabled() {\n" +
            "      if (countdownSec > 0) {\n" +
            "        setCd(0);\n" +
            "      } else {\n" +
            "        setCd(3);\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function toggleMirror() {\n" +
            "      isMirrored = !isMirrored;\n" +
            "      updateTransform();\n" +
            "    }\n" +
            "\n" +
            "    function toggleFocusGuide() {\n" +
            "      showFocus = !showFocus;\n" +
            "      document.getElementById('focus-guide').style.display = showFocus ? 'flex' : 'none';\n" +
            "      document.getElementById('guide-toggle-btn').innerText = showFocus ? 'Aktif' : 'Nonaktif';\n" +
            "    }\n" +
            "\n" +
            "    function updateFocusPercent(val) {\n" +
            "      focusPercent = val;\n" +
            "      document.getElementById('focus-guide').style.top = val + '%';\n" +
            "      document.getElementById('focus-badge').innerText = val + '%';\n" +
            "    }\n" +
            "\n" +
            "    function rotateText() {\n" +
            "      currentRotation = (currentRotation + 90) % 360;\n" +
            "      updateTransform();\n" +
            "    }\n" +
            "\n" +
            "    function updateTransform() {\n" +
            "      let t = '';\n" +
            "      if (currentRotation !== 0) t += 'rotate(' + currentRotation + 'deg) ';\n" +
            "      if (isMirrored) t += 'scaleX(-1) ';\n" +
            "      scriptContent.style.transformOrigin = 'center center';\n" +
            "      scriptContent.style.transform = t.trim();\n" +
            "    }\n" +
            "\n" +
            "    function cycleSize() {\n" +
            "      windowSizeIndex = (windowSizeIndex + 1) % 3;\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.setWindowSize) {\n" +
            "        if (windowSizeIndex === 0) window.AndroidPrompterBridge.setWindowSize(340, 440);\n" +
            "        else if (windowSizeIndex === 1) window.AndroidPrompterBridge.setWindowSize(420, 580);\n" +
            "        else window.AndroidPrompterBridge.setWindowSize(500, 720);\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function openFullApp() {\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.openFullApp) {\n" +
            "        window.AndroidPrompterBridge.openFullApp();\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function closePrompter() {\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.closePrompter) {\n" +
            "        window.AndroidPrompterBridge.closePrompter();\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    // Initial Render\n" +
            "    renderPresetsList();\n" +
            "    parseAndRenderScript();\n" +
            "    updateTransform();\n" +
            "  </script>\n" +
            "</body>\n" +
            "</html>";
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) {
            try {
                webView.destroy();
            } catch (Exception ignored) {}
        }
        if (floatingView != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }
    }
}
