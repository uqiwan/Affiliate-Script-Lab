package com.manuskrip.affiliatescript;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.DisplayMetrics;
import android.view.ContextThemeWrapper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;

/**
 * Foreground Service untuk Teleprompter Melayang (Always-on-Top Floating Window).
 * Beroperasi di atas kamera, TikTok, CapCut, dan aplikasi lain.
 * Tetap aktif saat aplikasi utama diminimalkan atau disapu dari Recent Apps.
 */
public class FloatingPrompterService extends Service {
    public static final String ACTION_STOP_PROMPTER = "com.manuskrip.affiliatescript.STOP_PROMPTER";
    public static final String ACTION_OPEN_APP = "com.manuskrip.affiliatescript.OPEN_APP";
    private static final String CHANNEL_ID = "gagaswara_prompter_channel";
    private static final int NOTIFICATION_ID = 1001;

    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private WebView webView;
    private PowerManager.WakeLock wakeLock;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private int minWindowWidth = 320;
    private int minWindowHeight = 360;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP_PROMPTER.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        acquireWakeLock();
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

        final String fScriptText = scriptText;
        final int fSpeed = initialSpeed;
        final int fFontSize = initialFontSize;
        final int fOpacity = initialOpacity;
        final String fColor = initialColor;
        final String fPresetId = initialPresetId;
        final int fRotation = initialRotation;
        final boolean fMirrored = isMirrored;
        final boolean fShowFocusGuide = showFocusGuide;
        final int fFocusPercent = focusPercent;
        final int fCountdownSec = countdownSec;
        final int fW = windowWidth;
        final int fH = windowHeight;

        mainHandler.post(() -> initFloatingWindow(
            fScriptText,
            fSpeed,
            fFontSize,
            fOpacity,
            fColor,
            fPresetId,
            fRotation,
            fMirrored,
            fShowFocusGuide,
            fFocusPercent,
            fCountdownSec,
            fW,
            fH
        ));

        return START_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        // Pertahankan Foreground Service agar jendela melayang TIDAK hilang saat MainActivity ditutup / diswipe
        startForegroundServiceNotification();
    }

    private void acquireWakeLock() {
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Gagaswara:FloatingPrompterWakeLock");
                    wakeLock.setReferenceCounted(false);
                }
            }
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire(15 * 60 * 1000L); // 15 menit batas aman
            }
        } catch (Exception ignored) {}
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {}
    }

    private void startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Gagaswara Teleprompter Melayang",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Layanan prompter melayang di atas kamera dan aplikasi lain");
            channel.setShowBadge(false);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        // Intent untuk membuka kembali MainActivity
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;
        PendingIntent pendingOpenApp = PendingIntent.getActivity(this, 0, openAppIntent, pendingFlags);

        // Intent untuk menutup floating prompter langsung dari notifikasi
        Intent stopServiceIntent = new Intent(this, FloatingPrompterService.class);
        stopServiceIntent.setAction(ACTION_STOP_PROMPTER);
        PendingIntent pendingStop = PendingIntent.getService(this, 1, stopServiceIntent, pendingFlags);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Gagaswara Teleprompter Melayang Aktif")
            .setContentText("Prompter melayang di atas aplikasi lain. Ketuk untuk kembali.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingOpenApp)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Tutup Prompter", pendingStop)
            .build();

        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MANIFEST);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void initFloatingWindow(
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
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
            floatingView = null;
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        if (windowManager == null) return;

        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(dm);
        int maxW = Math.max(320, dm.widthPixels - 24);
        int maxH = Math.max(380, (int) (dm.heightPixels * 0.88f));

        int width = Math.min(Math.max(minWindowWidth, wWidth), maxW);
        int height = Math.min(Math.max(minWindowHeight, wHeight), maxH);

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
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 24;
        params.y = 80;

        // Root Container: FrameLayout yang menampung konten kolom + Handle Resize Sudut Kanan Bawah
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.TRANSPARENT);

        // Kontainer Kolom (Drag Strip + WebView)
        LinearLayout columnContainer = new LinearLayout(this);
        columnContainer.setOrientation(LinearLayout.VERTICAL);
        columnContainer.setLayoutParams(new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        columnContainer.setBackgroundColor(Color.TRANSPARENT);

        // Native Top Drag Handle Strip
        LinearLayout dragStrip = new LinearLayout(this);
        dragStrip.setOrientation(LinearLayout.HORIZONTAL);
        dragStrip.setGravity(Gravity.CENTER);
        dragStrip.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            28
        ));
        dragStrip.setBackgroundColor(Color.parseColor("#3318181B")); // zinc-900 translusen

        View handlePill = new View(this);
        LinearLayout.LayoutParams pillParams = new LinearLayout.LayoutParams(64, 6);
        handlePill.setLayoutParams(pillParams);
        handlePill.setBackgroundColor(Color.parseColor("#EAB308")); // Amber-500
        dragStrip.addView(handlePill);

        // Native Drag listener pada strip atas
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

        // WebView dengan styling presisi web
        try {
            webView = new WebView(new ContextThemeWrapper(this, R.style.AppTheme));
        } catch (Exception e) {
            try {
                webView = new WebView(getApplicationContext());
            } catch (Exception e2) {
                webView = new WebView(this);
            }
        }

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
        ws.setDatabaseEnabled(true);
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

        columnContainer.addView(dragStrip);
        columnContainer.addView(webView);
        rootLayout.addView(columnContainer);

        // Native Resize Handle di Sudut Kanan Bawah (Menjamin resize 100% responsif tanpa lag)
        FrameLayout resizeHandle = new FrameLayout(this);
        FrameLayout.LayoutParams resizeParams = new FrameLayout.LayoutParams(48, 48);
        resizeParams.gravity = Gravity.BOTTOM | Gravity.END;
        resizeHandle.setLayoutParams(resizeParams);
        resizeHandle.setBackgroundColor(Color.TRANSPARENT);

        // Indikator visual segitiga titik-titik resize
        ImageView dotsIcon = new ImageView(this);
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(22, 22);
        iconParams.gravity = Gravity.BOTTOM | Gravity.END;
        iconParams.setMargins(0, 0, 4, 4);
        dotsIcon.setLayoutParams(iconParams);
        dotsIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        dotsIcon.setColorFilter(Color.parseColor("#EAB308"));
        dotsIcon.setAlpha(0.75f);
        resizeHandle.addView(dotsIcon);

        resizeHandle.setOnTouchListener(new View.OnTouchListener() {
            private int initialW;
            private int initialH;
            private float touchStartX;
            private float touchStartY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialW = params.width;
                        initialH = params.height;
                        touchStartX = event.getRawX();
                        touchStartY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int deltaW = (int) (event.getRawX() - touchStartX);
                        int deltaH = (int) (event.getRawY() - touchStartY);

                        DisplayMetrics currentMetrics = new DisplayMetrics();
                        windowManager.getDefaultDisplay().getMetrics(currentMetrics);
                        int screenMaxW = Math.max(300, currentMetrics.widthPixels - 16);
                        int screenMaxH = Math.max(360, (int) (currentMetrics.heightPixels * 0.90f));

                        params.width = Math.min(Math.max(minWindowWidth, initialW + deltaW), screenMaxW);
                        params.height = Math.min(Math.max(minWindowHeight, initialH + deltaH), screenMaxH);
                        try {
                            windowManager.updateViewLayout(floatingView, params);
                        } catch (Exception ignored) {}
                        return true;
                }
                return false;
            }
        });

        rootLayout.addView(resizeHandle);

        floatingView = rootLayout;
        try {
            windowManager.addView(floatingView, params);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * JavaScript Bridge yang dipanggil dari tampilan HTML prompter.
     * Menggunakan mainHandler.post(...) agar seluruh pembaruan View berjalan di Main UI Thread.
     */
    public class PrompterBridge {
        @JavascriptInterface
        public void closePrompter() {
            mainHandler.post(() -> stopSelf());
        }

        @JavascriptInterface
        public void setWindowSize(int w, int h) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);
                    int maxW = Math.max(300, dm.widthPixels - 20);
                    int maxH = Math.max(360, (int) (dm.heightPixels * 0.90f));

                    params.width = Math.min(Math.max(minWindowWidth, w), maxW);
                    params.height = Math.min(Math.max(minWindowHeight, h), maxH);
                    windowManager.updateViewLayout(floatingView, params);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void resizeDelta(int dw, int dh) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);
                    int maxW = Math.max(300, dm.widthPixels - 20);
                    int maxH = Math.max(360, (int) (dm.heightPixels * 0.90f));

                    params.width = Math.min(Math.max(minWindowWidth, params.width + dw), maxW);
                    params.height = Math.min(Math.max(minWindowHeight, params.height + dh), maxH);
                    windowManager.updateViewLayout(floatingView, params);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void moveDelta(int dx, int dy) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    params.x = Math.max(0, params.x + dx);
                    params.y = Math.max(0, params.y + dy);
                    windowManager.updateViewLayout(floatingView, params);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void openFullApp() {
            mainHandler.post(() -> {
                try {
                    Intent launchIntent = new Intent(FloatingPrompterService.this, MainActivity.class);
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    startActivity(launchIntent);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void showToast(String msg) {
            mainHandler.post(() -> Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show());
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

    /**
     * Membangun HTML Teleprompter Melayang dengan desain 100% identik dengan komponen React (FloatingTeleprompter.tsx).
     * Menggunakan Tailwind-matching color palette, vektor SVG Lucide crisp, 10 gaya subtitle, garis fokus mata, dan tab pengaturan.
     */
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
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />\n" +
            "  <style>\n" +
            "    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; margin: 0; padding: 0; }\n" +
            "    html, body {\n" +
            "      width: 100%; height: 100%; background: transparent; overflow: hidden;\n" +
            "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
            "    }\n" +
            "    #app-container {\n" +
            "      width: 100%; height: 100%; display: flex; flex-direction: column;\n" +
            "      border-radius: 18px; border: 1px solid rgba(63, 63, 70, 0.8);\n" +
            "      box-shadow: 0 20px 45px rgba(0,0,0,0.75);\n" +
            "      overflow: hidden; position: relative;\n" +
            "      transition: background-color 0.15s ease;\n" +
            "    }\n" +
            "    #content-area {\n" +
            "      flex: 1; position: relative; overflow: hidden; cursor: pointer;\n" +
            "    }\n" +
            "    #focus-guide {\n" +
            "      position: absolute; left: 0; right: 0; z-index: 20; transform: translateY(-50%);\n" +
            "      display: flex; align-items: center; justify-content: space-between;\n" +
            "      padding: 0 10px; pointer-events: none;\n" +
            "    }\n" +
            "    #focus-line {\n" +
            "      flex: 1; height: 2px;\n" +
            "      background: linear-gradient(90deg, rgba(245,158,11,0.8), #FDE047, rgba(245,158,11,0.8));\n" +
            "      box-shadow: 0 0 10px rgba(245,158,11,0.8);\n" +
            "    }\n" +
            "    #focus-badge {\n" +
            "      font-size: 10px; font-weight: bold; color: #FDE047; font-family: monospace;\n" +
            "      padding-left: 8px; text-shadow: 0 1px 3px black;\n" +
            "    }\n" +
            "    #scroll-container {\n" +
            "      width: 100%; height: 100%; overflow-y: scroll; padding: 6px 12px 180px 12px;\n" +
            "      scrollbar-width: none;\n" +
            "    }\n" +
            "    #scroll-container::-webkit-scrollbar { display: none; }\n" +
            "    #script-content {\n" +
            "      transition: transform 0.2s ease;\n" +
            "    }\n" +
            "    .concept-header {\n" +
            "      display: flex; align-items: center; justify-content: space-between; gap: 8px;\n" +
            "      padding: 8px 12px; border-radius: 12px; margin: 12px 0 10px 0;\n" +
            "      background: #FFFFFF; border: 2px solid #D4D4D8;\n" +
            "      font-size: 12px; font-weight: 900; color: #09090B;\n" +
            "      box-shadow: 0 4px 12px rgba(0,0,0,0.3); text-transform: uppercase;\n" +
            "    }\n" +
            "    .concept-title {\n" +
            "      color: #09090B; font-weight: 900; letter-spacing: -0.01em;\n" +
            "    }\n" +
            "    .prompter-line {\n" +
            "      margin-bottom: 16px; transition: font-size 0.15s ease;\n" +
            "    }\n" +
            "    .highlight-word {\n" +
            "      font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em;\n" +
            "    }\n" +
            "    .pause-short { color: #F59E0B; font-weight: bold; margin: 0 4px; opacity: 0.8; }\n" +
            "    .pause-long { display: block; height: 16px; }\n" +
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
            "      font-size: 72px; font-weight: 900; color: #F59E0B; text-shadow: 0 0 25px rgba(245,158,11,0.8);\n" +
            "      animation: bounce 0.8s infinite;\n" +
            "    }\n" +
            "    @keyframes bounce {\n" +
            "      0%, 100% { transform: scale(1); }\n" +
            "      50% { transform: scale(1.18); }\n" +
            "    }\n" +
            "    /* Tap Feedback Pulse */\n" +
            "    #tap-feedback {\n" +
            "      position: absolute; inset: 0; z-index: 35; pointer-events: none;\n" +
            "      display: none; align-items: center; justify-content: center;\n" +
            "    }\n" +
            "    .pulse-badge {\n" +
            "      width: 54px; height: 54px; border-radius: 50%;\n" +
            "      background: rgba(0,0,0,0.85); border: 2px solid #F59E0B;\n" +
            "      color: #F59E0B; display: flex; align-items: center; justify-content: center;\n" +
            "      box-shadow: 0 0 24px rgba(245,158,11,0.6); animation: pulseOut 0.4s ease forwards;\n" +
            "    }\n" +
            "    @keyframes pulseOut {\n" +
            "      0% { opacity: 1; transform: scale(0.85); }\n" +
            "      100% { opacity: 0; transform: scale(1.28); }\n" +
            "    }\n" +
            "    /* Bottom Dock Bar */\n" +
            "    #bottom-dock {\n" +
            "      height: 46px; background: rgba(9, 9, 11, 0.88);\n" +
            "      border-top: 1px solid rgba(39, 39, 42, 0.8); padding: 0 8px;\n" +
            "      display: flex; align-items: center; justify-content: space-between; gap: 6px;\n" +
            "      z-index: 30; transition: transform 0.25s ease, opacity 0.25s ease;\n" +
            "    }\n" +
            "    .dock-btn {\n" +
            "      border: 1px solid #27272A; outline: none; border-radius: 10px;\n" +
            "      display: flex; align-items: center; justify-content: center;\n" +
            "      background: #18181B; color: #D4D4D8; cursor: pointer;\n" +
            "      width: 32px; height: 32px;\n" +
            "      transition: background 0.15s, transform 0.1s;\n" +
            "    }\n" +
            "    .dock-btn:active { transform: scale(0.92); background: #27272A; }\n" +
            "    #hero-play {\n" +
            "      background: #F59E0B; color: black; font-weight: 800; font-size: 13px;\n" +
            "      width: 36px; height: 34px; border-radius: 12px; border: none;\n" +
            "      display: flex; align-items: center; justify-content: center;\n" +
            "      box-shadow: 0 4px 14px rgba(245,158,11,0.35);\n" +
            "    }\n" +
            "    #hero-play:active { transform: scale(0.92); }\n" +
            "    /* Speed Stepper */\n" +
            "    .stepper-box {\n" +
            "      display: flex; align-items: center; background: #18181B; border-radius: 10px;\n" +
            "      padding: 1px; border: 1px solid #27272A;\n" +
            "    }\n" +
            "    .stepper-btn {\n" +
            "      width: 24px; height: 30px; border: none; background: transparent; color: #A1A1AA;\n" +
            "      font-weight: 900; font-size: 13px; display: flex; align-items: center; justify-content: center;\n" +
            "      cursor: pointer;\n" +
            "    }\n" +
            "    .stepper-label {\n" +
            "      padding: 0 4px; font-family: monospace; font-size: 12px; font-weight: bold; color: #F59E0B;\n" +
            "      min-width: 24px; text-align: center;\n" +
            "    }\n" +
            "    /* Settings Panel */\n" +
            "    #settings-panel {\n" +
            "      position: absolute; bottom: 52px; left: 8px; right: 8px; z-index: 50;\n" +
            "      background: rgba(9, 9, 11, 0.96); border: 1px solid #3F3F46; border-radius: 16px;\n" +
            "      padding: 12px; display: none; flex-direction: column; gap: 10px; color: #D4D4D8;\n" +
            "      box-shadow: 0 20px 40px rgba(0,0,0,0.85); max-height: 75%; overflow-y: auto;\n" +
            "    }\n" +
            "    .tabs-row {\n" +
            "      display: flex; background: #18181B; border-radius: 12px; padding: 2px; gap: 2px;\n" +
            "      border: 1px solid #27272A;\n" +
            "    }\n" +
            "    .tab-item {\n" +
            "      flex: 1; padding: 6px 0; text-align: center; font-size: 11px; font-weight: 600;\n" +
            "      border-radius: 8px; color: #A1A1AA; cursor: pointer;\n" +
            "      display: flex; align-items: center; justify-content: center; gap: 4px;\n" +
            "    }\n" +
            "    .tab-item.active {\n" +
            "      background: #F59E0B; color: black; font-weight: bold;\n" +
            "    }\n" +
            "    .setting-group { display: flex; flex-direction: column; gap: 6px; }\n" +
            "    .setting-label { font-size: 11px; color: #A1A1AA; display: flex; justify-content: space-between; align-items: center; }\n" +
            "    .slider-input { width: 100%; accent-color: #F59E0B; height: 6px; border-radius: 4px; }\n" +
            "    .presets-container { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }\n" +
            "    .preset-row {\n" +
            "      display: flex; align-items: center; justify-content: space-between; padding: 6px 8px;\n" +
            "      border-radius: 10px; background: #18181B; border: 1px solid #27272A; cursor: pointer;\n" +
            "    }\n" +
            "    .preset-row.active {\n" +
            "      border-color: #F59E0B; background: rgba(245,158,11,0.2);\n" +
            "    }\n" +
            "    .preset-preview-box {\n" +
            "      padding: 2px 6px; border-radius: 4px; background: black; border: 1px solid #3F3F46;\n" +
            "      font-size: 11px; font-weight: bold; margin-right: 8px;\n" +
            "    }\n" +
            "    .pill-btn {\n" +
            "      padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: bold;\n" +
            "      border: 1px solid #27272A; background: #18181B; color: #D4D4D8; cursor: pointer;\n" +
            "    }\n" +
            "    .pill-btn.active {\n" +
            "      border-color: #F59E0B; background: #F59E0B; color: black;\n" +
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
            "        <div style=\"font-size:11px; color:#D4D4D8; margin-top:6px;\">Ketuk untuk langsung mulai</div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Tap Pulse Feedback -->\n" +
            "      <div id=\"tap-feedback\">\n" +
            "        <div id=\"pulse-badge\" class=\"pulse-badge\">\n" +
            "          <svg id=\"pulse-icon-play\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"currentColor\"><polygon points=\"6 3 20 12 6 21 6 3\"/></svg>\n" +
            "          <svg id=\"pulse-icon-pause\" style=\"display:none;\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"currentColor\"><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/></svg>\n" +
            "        </div>\n" +
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
            "        <span style=\"font-weight:bold; font-size:12px; color:#F59E0B; display:flex; align-items:center; gap:6px;\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"21\" y1=\"4\" x2=\"14\" y2=\"4\"/><line x1=\"10\" y1=\"4\" x2=\"3\" y2=\"4\"/><line x1=\"21\" y1=\"12\" x2=\"12\" y2=\"12\"/><line x1=\"8\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"20\" x2=\"16\" y2=\"20\"/><line x1=\"12\" y1=\"20\" x2=\"3\" y2=\"20\"/><line x1=\"14\" y1=\"2\" x2=\"14\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"8\" y2=\"14\"/><line x1=\"16\" y1=\"18\" x2=\"16\" y2=\"22\"/></svg>\n" +
            "          <span>Pengaturan Teleprompter</span>\n" +
            "        </span>\n" +
            "        <button onclick=\"toggleSettings()\" style=\"background:transparent; border:none; color:#A1A1AA; cursor:pointer;\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n" +
            "        </button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Tabs -->\n" +
            "      <div class=\"tabs-row\">\n" +
            "        <div id=\"tab-teks\" class=\"tab-item active\" onclick=\"switchTab('teks')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/></svg>\n" +
            "          <span>Teks</span>\n" +
            "        </div>\n" +
            "        <div id=\"tab-countdown\" class=\"tab-item\" onclick=\"switchTab('countdown')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"10\" y1=\"2\" x2=\"14\" y2=\"2\"/><line x1=\"12\" y1=\"14\" x2=\"15\" y2=\"11\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/></svg>\n" +
            "          <span>Countdown</span>\n" +
            "        </div>\n" +
            "        <div id=\"tab-layar\" class=\"tab-item\" onclick=\"switchTab('layar')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>\n" +
            "          <span>Layar</span>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Teks: Ukuran Font & 10 Gaya Subtitle -->\n" +
            "      <div id=\"panel-teks\" style=\"display:flex; flex-direction:column; gap:8px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Ukuran Font (Mulai dari 7px):</span>\n" +
            "            <span id=\"font-label\" style=\"color:#F59E0B; font-weight:bold; font-family:monospace;\">" + fontSize + "px</span>\n" +
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
            "            <button onclick=\"toggleCountdownEnabled()\" id=\"cd-toggle-btn\" class=\"pill-btn " + (countdownSec > 0 ? "active" : "") + "\">" + (countdownSec > 0 ? "Aktif" : "Nonaktif") + "</button>\n" +
            "          </div>\n" +
            "          <div class=\"setting-label\" style=\"margin-top:4px;\">\n" +
            "            <span>Durasi:</span>\n" +
            "            <span id=\"cd-label\" style=\"color:#F59E0B; font-weight:bold;\">" + (countdownSec > 0 ? (countdownSec + " Detik") : "Langsung") + "</span>\n" +
            "          </div>\n" +
            "          <div style=\"display:flex; gap:6px; margin-top:2px;\">\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(0)\">Langsung</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(3)\">3 Detik</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(5)\">5 Detik</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(10)\">10 Detik</button>\n" +
            "          </div>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Layar -->\n" +
            "      <div id=\"panel-layar\" style=\"display:none; flex-direction:column; gap:8px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Transparansi / Opasitas Latar:</span>\n" +
            "            <span id=\"op-label\" style=\"color:#F59E0B; font-weight:bold; font-family:monospace;\">" + opacity + "%</span>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"10\" max=\"100\" value=\"" + opacity + "\" class=\"slider-input\" oninput=\"updateOpacity(this.value)\" />\n" +
            "        </div>\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Garis Panduan Kamera:</span>\n" +
            "            <button onclick=\"toggleFocusGuide()\" id=\"guide-toggle-btn\" class=\"pill-btn " + (showFocusGuide ? "active" : "") + "\">" + (showFocusGuide ? "Aktif" : "Off") + "</button>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"5\" max=\"50\" value=\"" + focusPercent + "\" class=\"slider-input\" oninput=\"updateFocusPercent(this.value)\" />\n" +
            "        </div>\n" +
            "        <div style=\"display:flex; gap:6px; padding-top:4px;\">\n" +
            "          <button class=\"pill-btn\" style=\"flex:1; display:flex; align-items:center; justify-content:center; gap:4px;\" onclick=\"toggleMirror()\">\n" +
            "            <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m3 7 5 5-5 5V7\"/><path d=\"m21 7-5 5 5 5V7\"/><path d=\"M12 20v2\"/><path d=\"M12 14v2\"/><path d=\"M12 8v2\"/><path d=\"M12 2v2\"/></svg>\n" +
            "            <span>Mirror Kaca</span>\n" +
            "          </button>\n" +
            "          <button class=\"pill-btn\" style=\"flex:1; color:#F59E0B; font-weight:bold;\" onclick=\"cycleSize()\">Ukuran Jendela ⇲</button>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <!-- Bottom Dock -->\n" +
            "    <div id=\"bottom-dock\" onclick=\"event.stopPropagation()\">\n" +
            "      <button class=\"dock-btn\" onclick=\"rotateText()\" title=\"Rotasi Teks (0°, 90°, 180°, 270°)\" style=\"position:relative;\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/></svg>\n" +
            "        <span id=\"rot-badge\" style=\"display:none; position:absolute; top:-3px; right:-3px; background:#F59E0B; color:black; font-size:8px; font-weight:bold; border-radius:6px; padding:0 3px;\">0°</span>\n" +
            "      </button>\n" +
            "      <button class=\"dock-btn\" onclick=\"resetScroll()\" title=\"Reset ke Atas\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></svg>\n" +
            "      </button>\n" +
            "\n" +
            "      <!-- Speed Stepper -->\n" +
            "      <div class=\"stepper-box\">\n" +
            "        <button class=\"stepper-btn\" onclick=\"changeSpeed(-1)\">−</button>\n" +
            "        <span id=\"speed-stepper-label\" class=\"stepper-label\">" + speed + "x</span>\n" +
            "        <button class=\"stepper-btn\" onclick=\"changeSpeed(1)\">+</button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Hero Play / Pause -->\n" +
            "      <button id=\"hero-play\" onclick=\"togglePlay()\" title=\"Mulai / Jeda\">\n" +
            "        <svg id=\"hero-icon-play\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"black\"><polygon points=\"6 3 20 12 6 21 6 3\"/></svg>\n" +
            "        <svg id=\"hero-icon-pause\" style=\"display:none;\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"white\"><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/></svg>\n" +
            "      </button>\n" +
            "\n" +
            "      <!-- Full App Mode -->\n" +
            "      <button class=\"dock-btn\" onclick=\"openFullApp()\" title=\"Layar Penuh / Kembali ke Aplikasi\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/></svg>\n" +
            "      </button>\n" +
            "\n" +
            "      <!-- Settings Panel -->\n" +
            "      <button class=\"dock-btn\" onclick=\"toggleSettings()\" title=\"Pengaturan\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"21\" y1=\"4\" x2=\"14\" y2=\"4\"/><line x1=\"10\" y1=\"4\" x2=\"3\" y2=\"4\"/><line x1=\"21\" y1=\"12\" x2=\"12\" y2=\"12\"/><line x1=\"8\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"20\" x2=\"16\" y2=\"20\"/><line x1=\"12\" y1=\"20\" x2=\"3\" y2=\"20\"/><line x1=\"14\" y1=\"2\" x2=\"14\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"8\" y2=\"14\"/><line x1=\"16\" y1=\"18\" x2=\"16\" y2=\"22\"/></svg>\n" +
            "      </button>\n" +
            "\n" +
            "      <!-- Close -->\n" +
            "      <button class=\"dock-btn\" style=\"background:rgba(220,38,38,0.2); border-color:rgba(220,38,38,0.4); color:#EF4444;\" onclick=\"closePrompter()\" title=\"Tutup Teleprompter\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n" +
            "      </button>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "\n" +
            "  <script>\n" +
            "    const RAW_SCRIPT = \"" + scriptJson + "\";\n" +
            "\n" +
            "    // 10 Preset Subtitle Resmi Gagaswara\n" +
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
            "    // Kurva kecepatan identik dengan web (Speed 1 sangat santai: 2.5 px/detik)\n" +
            "    const SPEED_PIXELS = [2.5, 4.5, 7.5, 11, 16, 23, 32, 43, 56, 72];\n" +
            "    let lastTimestamp = null;\n" +
            "    let scrollAccumulator = 0;\n" +
            "    let scrollAnimId = null;\n" +
            "\n" +
            "    const scrollContainer = document.getElementById('scroll-container');\n" +
            "    const scriptContent = document.getElementById('script-content');\n" +
            "    const heroPlay = document.getElementById('hero-play');\n" +
            "    const heroIconPlay = document.getElementById('hero-icon-play');\n" +
            "    const heroIconPause = document.getElementById('hero-icon-pause');\n" +
            "    const cdOverlay = document.getElementById('countdown-overlay');\n" +
            "    const cdNum = document.getElementById('countdown-num');\n" +
            "    const bottomDock = document.getElementById('bottom-dock');\n" +
            "    const settingsPanel = document.getElementById('settings-panel');\n" +
            "    const appContainer = document.getElementById('app-container');\n" +
            "    const tapFeedback = document.getElementById('tap-feedback');\n" +
            "    const pulseIconPlay = document.getElementById('pulse-icon-play');\n" +
            "    const pulseIconPause = document.getElementById('pulse-icon-pause');\n" +
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
            "          let title = line.replace(/===/g, '').trim();\n" +
            "          title = title.replace(/^konsep\\s*#?\\d+\\s*[:\\-–—]?\\s*/i, '').trim();\n" +
            "          html += '<div class=\"concept-header\"><div style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:7px;height:7px;border-radius:50%;background:#F59E0B;display:inline-block;\"></span><span class=\"concept-title\">' + escapeHtml(title) + '</span></div></div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "        if (line === '---') {\n" +
            "          html += '<div style=\"height:16px; border-bottom:1px dashed rgba(255,255,255,0.15); margin-bottom:12px;\"></div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "\n" +
            "        // Format kata penekanan (Uppercase / Hook) & jeda bicara\n" +
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
            "      html += '<div style=\"height: 220px; display:flex; align-items:center; justify-content:center; color:#71717A; font-size:11px; font-weight:600;\">- Selesai Membaca -</div>';\n" +
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
            "                    '<span style=\"font-size:11px; font-weight:600; color:' + (isActive ? '#FEF08A' : '#D4D4D8') + ';\">' + p.name + '</span>' +\n" +
            "                  '</div>' +\n" +
            "                  (isActive ? '<span style=\"color:#F59E0B; font-weight:bold; font-size:13px;\">✓</span>' : '') +\n" +
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
            "      pulseIconPlay.style.display = isStarting ? 'block' : 'none';\n" +
            "      pulseIconPause.style.display = isStarting ? 'none' : 'block';\n" +
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
            "      bottomDock.style.opacity = '0';\n" +
            "      bottomDock.style.pointerEvents = 'none';\n" +
            "      bottomDock.style.transform = 'translateY(48px)';\n" +
            "      heroIconPlay.style.display = 'none';\n" +
            "      heroIconPause.style.display = 'block';\n" +
            "      heroPlay.style.background = '#EF4444';\n" +
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
            "      bottomDock.style.opacity = '1';\n" +
            "      bottomDock.style.pointerEvents = 'auto';\n" +
            "      bottomDock.style.transform = 'translateY(0)';\n" +
            "      heroIconPlay.style.display = 'block';\n" +
            "      heroIconPause.style.display = 'none';\n" +
            "      heroPlay.style.background = '#F59E0B';\n" +
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
            "      document.getElementById('cd-toggle-btn').className = 'pill-btn ' + (sec > 0 ? 'active' : '');\n" +
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
            "      document.getElementById('guide-toggle-btn').innerText = showFocus ? 'Aktif' : 'Off';\n" +
            "      document.getElementById('guide-toggle-btn').className = 'pill-btn ' + (showFocus ? 'active' : '');\n" +
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
            "      const badge = document.getElementById('rot-badge');\n" +
            "      if (currentRotation !== 0) {\n" +
            "        badge.style.display = 'block';\n" +
            "        badge.innerText = currentRotation + '°';\n" +
            "      } else {\n" +
            "        badge.style.display = 'none';\n" +
            "      }\n" +
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
            "        else if (windowSizeIndex === 1) window.AndroidPrompterBridge.setWindowSize(460, 600);\n" +
            "        else window.AndroidPrompterBridge.setWindowSize(600, 780);\n" +
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
        releaseWakeLock();
        if (webView != null) {
            try {
                webView.destroy();
            } catch (Exception ignored) {}
        }
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }
    }
}
