package com.manuskrip.affiliatescript;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
 * Menghadirkan:
 * 1. Tombol Geser (drag & move) yang dapat digeser bebas ke arah manapun oleh user.
 * 2. Penyimpanan otomatis & restorasi setelan terakhir (posisi, ukuran, kecepatan, font, tema, rotasi).
 * 3. Dukungan 3 Tema Utama (Dark Pro, Soft Comfort, Light Clean).
 * 4. Rotasi teleprompter (0°, 90°, 180°, 270°) dengan penyesuaian otomatis agar tidak melebihi layar HP.
 * 5. Menu Gabungan 3/4 sisi kanan bergaya web app dengan ikon minimalis.
 * 6. Skala tombol dan menu responsif dalam ukuran teleprompter apapun.
 */
public class FloatingPrompterService extends Service {
    public static final String ACTION_STOP_PROMPTER = "com.manuskrip.affiliatescript.STOP_PROMPTER";
    public static final String ACTION_OPEN_APP = "com.manuskrip.affiliatescript.OPEN_APP";
    private static final String CHANNEL_ID = "gagaswara_prompter_channel";
    private static final int NOTIFICATION_ID = 1001;
    private static final String PREFS_NAME = "gagaswara_prompter_prefs";

    private WindowManager windowManager;
    private View floatingView;
    private LinearLayout dragStrip;
    private FrameLayout resizeHandle;
    private WindowManager.LayoutParams params;
    private WebView webView;
    private PowerManager.WakeLock wakeLock;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private int minWindowWidth = 260;
    private int minWindowHeight = 300;
    private int lastExpandedWidth = 660;
    private int lastExpandedHeight = 740;
    private int currentPositionState = 0; // 0: Atas, 1: Tengah, 2: Bawah
    private boolean isMinimized = false;

    // Setelan tersimpan yang dipersistensikan
    private int currentSavedSpeed = 3;
    private int currentSavedFontSize = 18;
    private int currentSavedOpacity = 85;
    private String currentSavedThemeId = "dark_pro";
    private String currentSavedPresetId = "standard_read";
    private int currentSavedRotation = 0;
    private boolean currentSavedMirrored = false;
    private boolean currentSavedShowFocusGuide = true;
    private int currentSavedFocusPercent = 12;
    private int currentSavedCountdownSec = 3;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void savePrompterState() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            if (params != null && !isMinimized) {
                editor.putInt("pos_x", params.x);
                editor.putInt("pos_y", params.y);
                editor.putInt("window_width", params.width);
                editor.putInt("window_height", params.height);
            }
            editor.putInt("speed", currentSavedSpeed);
            editor.putInt("font_size", currentSavedFontSize);
            editor.putInt("opacity", currentSavedOpacity);
            editor.putString("theme_id", currentSavedThemeId);
            editor.putString("preset_id", currentSavedPresetId);
            editor.putInt("rotation", currentSavedRotation);
            editor.putBoolean("is_mirrored", currentSavedMirrored);
            editor.putBoolean("show_focus_guide", currentSavedShowFocusGuide);
            editor.putInt("focus_percent", currentSavedFocusPercent);
            editor.putInt("countdown_sec", currentSavedCountdownSec);
            editor.apply();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP_PROMPTER.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        acquireWakeLock();
        startForegroundServiceNotification();

        // 1. Muat setelan terakhir dari SharedPreferences sebagai default
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        currentSavedSpeed = prefs.getInt("speed", 3);
        currentSavedFontSize = prefs.getInt("font_size", 18);
        currentSavedOpacity = prefs.getInt("opacity", 85);
        currentSavedThemeId = prefs.getString("theme_id", "dark_pro");
        currentSavedPresetId = prefs.getString("preset_id", "standard_read");
        currentSavedRotation = prefs.getInt("rotation", 0);
        currentSavedMirrored = prefs.getBoolean("is_mirrored", false);
        currentSavedShowFocusGuide = prefs.getBoolean("show_focus_guide", true);
        currentSavedFocusPercent = prefs.getInt("focus_percent", 12);
        currentSavedCountdownSec = prefs.getInt("countdown_sec", 3);

        String scriptText = "Halo kreator! Naskah teleprompter melayang Gagaswara siap digunakan...";
        String conceptsJson = "";

        int speed = currentSavedSpeed;
        int fontSize = currentSavedFontSize;
        int opacity = currentSavedOpacity;
        String textColor = "#FFFFFF";
        String presetId = currentSavedPresetId;
        String themeId = currentSavedThemeId;
        String bgColor = "#000000";
        String highlightColor = "#FACC15";
        int rotation = currentSavedRotation;
        boolean isMirrored = currentSavedMirrored;
        boolean showFocusGuide = currentSavedShowFocusGuide;
        int focusPercent = currentSavedFocusPercent;
        int countdownSec = currentSavedCountdownSec;
        int windowWidth = prefs.getInt("window_width", 660);
        int windowHeight = prefs.getInt("window_height", 740);

        // 2. Jika intent membawa parameter khusus, update setelan
        if (intent != null) {
            if (intent.hasExtra("scriptText") && intent.getStringExtra("scriptText") != null) {
                scriptText = intent.getStringExtra("scriptText");
            }
            if (intent.hasExtra("conceptsJson") && intent.getStringExtra("conceptsJson") != null) {
                conceptsJson = intent.getStringExtra("conceptsJson");
            }
            if (intent.hasExtra("presetId") && intent.getStringExtra("presetId") != null) {
                presetId = intent.getStringExtra("presetId");
                currentSavedPresetId = presetId;
            }
            if (intent.hasExtra("themeId") && intent.getStringExtra("themeId") != null) {
                themeId = intent.getStringExtra("themeId");
                currentSavedThemeId = themeId;
            }
            if (intent.hasExtra("backgroundColorHex") && intent.getStringExtra("backgroundColorHex") != null) {
                bgColor = intent.getStringExtra("backgroundColorHex");
            }
            if (intent.hasExtra("highlightColorHex") && intent.getStringExtra("highlightColorHex") != null) {
                highlightColor = intent.getStringExtra("highlightColorHex");
            }
            if (intent.hasExtra("rotation")) {
                rotation = intent.getIntExtra("rotation", rotation);
                currentSavedRotation = rotation;
            }
            if (intent.hasExtra("speed")) {
                speed = intent.getIntExtra("speed", speed);
                currentSavedSpeed = speed;
            }
            if (intent.hasExtra("fontSize")) {
                fontSize = intent.getIntExtra("fontSize", fontSize);
                currentSavedFontSize = fontSize;
            }
            if (intent.hasExtra("opacity")) {
                opacity = intent.getIntExtra("opacity", opacity);
                currentSavedOpacity = opacity;
            }
            if (intent.hasExtra("textColorHex") && intent.getStringExtra("textColorHex") != null) {
                textColor = intent.getStringExtra("textColorHex");
            }
            if (intent.hasExtra("isMirrored")) {
                isMirrored = intent.getBooleanExtra("isMirrored", isMirrored);
                currentSavedMirrored = isMirrored;
            }
            if (intent.hasExtra("showFocusGuide")) {
                showFocusGuide = intent.getBooleanExtra("showFocusGuide", showFocusGuide);
                currentSavedShowFocusGuide = showFocusGuide;
            }
            if (intent.hasExtra("focusGuidePercent")) {
                focusPercent = intent.getIntExtra("focusGuidePercent", focusPercent);
                currentSavedFocusPercent = focusPercent;
            }
            if (intent.hasExtra("countdownSec")) {
                countdownSec = intent.getIntExtra("countdownSec", countdownSec);
                currentSavedCountdownSec = countdownSec;
            }
            if (intent.hasExtra("windowWidth")) {
                windowWidth = intent.getIntExtra("windowWidth", windowWidth);
            }
            if (intent.hasExtra("windowHeight")) {
                windowHeight = intent.getIntExtra("windowHeight", windowHeight);
            }
        }

        final String fScriptText = scriptText;
        final String fConceptsJson = conceptsJson;
        final int fSpeed = speed;
        final int fFontSize = fontSize;
        final int fOpacity = opacity;
        final String fColor = textColor;
        final String fPresetId = presetId;
        final String fThemeId = themeId;
        final String fBgColor = bgColor;
        final String fHighlightColor = highlightColor;
        final int fRotation = rotation;
        final boolean fMirrored = isMirrored;
        final boolean fShowFocusGuide = showFocusGuide;
        final int fFocusPercent = focusPercent;
        final int fCountdownSec = countdownSec;
        final int fW = windowWidth;
        final int fH = windowHeight;

        mainHandler.post(() -> initFloatingWindow(
            fScriptText,
            fConceptsJson,
            fSpeed,
            fFontSize,
            fOpacity,
            fColor,
            fPresetId,
            fThemeId,
            fBgColor,
            fHighlightColor,
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
        savePrompterState();
        startForegroundServiceNotification();
    }

    @Override
    public void onDestroy() {
        savePrompterState();
        releaseWakeLock();
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
            floatingView = null;
        }
        super.onDestroy();
    }

    private void acquireWakeLock() {
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Gagaswara:FloatingPrompterWakeLock");
                    wakeLock.acquire(15 * 60 * 1000L); // 15 menit
                }
            }
        } catch (Exception ignored) {}
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                wakeLock = null;
            }
        } catch (Exception ignored) {}
    }

    private void startForegroundServiceNotification() {
        createNotificationChannel();

        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpenApp = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent stopIntent = new Intent(this, FloatingPrompterService.class);
        stopIntent.setAction(ACTION_STOP_PROMPTER);
        PendingIntent pendingStop = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Teleprompter Melayang Aktif")
            .setContentText("Menampilkan naskah video di atas kamera & aplikasi lain")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .setContentIntent(pendingOpenApp)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Tutup Prompter", pendingStop);

        Notification notification = builder.build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Layanan Teleprompter Melayang",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Menjaga Teleprompter Melayang tetap aktif di atas kamera");
            channel.setSound(null, null);
            channel.enableVibration(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void initFloatingWindow(
        String scriptText,
        String conceptsJson,
        int speed,
        int fontSize,
        int opacity,
        String textColor,
        String presetId,
        String themeId,
        String backgroundColorHex,
        String highlightColorHex,
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
            floatingView = null;
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        if (windowManager == null) return;

        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(dm);
        int maxW = Math.max(minWindowWidth, dm.widthPixels - 16);
        int maxH = Math.max(minWindowHeight, (int) (dm.heightPixels * 0.88f));

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int savedW = prefs.getInt("window_width", -1);
        int savedH = prefs.getInt("window_height", -1);
        int savedX = prefs.getInt("pos_x", -1);
        int savedY = prefs.getInt("pos_y", -1);

        int width = (savedW > 0) ? savedW : Math.min(Math.max(minWindowWidth, wWidth), maxW);
        int height = (savedH > 0) ? savedH : Math.min(Math.max(minWindowHeight, wHeight), maxH);
        width = Math.min(Math.max(minWindowWidth, width), maxW);
        height = Math.min(Math.max(minWindowHeight, height), maxH);

        // Jika orientasi rotasi horizontal (90 atau 270), sesuaikan ukuran agar pas dalam batas layar HP
        if (rotation == 90 || rotation == 270) {
            int swapW = Math.min(Math.max(height, 500), dm.widthPixels - 16);
            int swapH = Math.min(Math.max(width, 320), (int)(dm.heightPixels * 0.85f));
            width = swapW;
            height = swapH;
        }

        lastExpandedWidth = width;
        lastExpandedHeight = height;

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
        params.x = (savedX >= 0) ? Math.min(savedX, dm.widthPixels - width) : Math.max(0, (dm.widthPixels - width) / 2);
        params.y = (savedY >= 0) ? Math.min(savedY, dm.heightPixels - height) : 80;

        // Root Container
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

        // Native Top Drag Handle Strip (Dapat digeser dengan sentuhan)
        dragStrip = new LinearLayout(this);
        dragStrip.setOrientation(LinearLayout.HORIZONTAL);
        dragStrip.setGravity(Gravity.CENTER);
        dragStrip.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            24
        ));
        dragStrip.setBackgroundColor(Color.parseColor("#4018181B")); // zinc-900 translusen

        View handlePill = new View(this);
        LinearLayout.LayoutParams pillParams = new LinearLayout.LayoutParams(54, 5);
        handlePill.setLayoutParams(pillParams);
        handlePill.setBackgroundColor(Color.parseColor("#EAB308")); // Amber-500
        dragStrip.addView(handlePill);

        // Drag listener pada strip atas
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
                    case MotionEvent.ACTION_UP:
                        savePrompterState();
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
            conceptsJson,
            speed,
            fontSize,
            opacity,
            textColor,
            presetId,
            themeId,
            backgroundColorHex,
            highlightColorHex,
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

        // Native Resize Handle di Sudut Kanan Bawah
        resizeHandle = new FrameLayout(this);
        int resizePx = (int) (18 * dm.density);
        FrameLayout.LayoutParams resizeParams = new FrameLayout.LayoutParams(resizePx, resizePx);
        resizeParams.gravity = Gravity.BOTTOM | Gravity.END;
        resizeHandle.setLayoutParams(resizeParams);
        resizeHandle.setBackgroundColor(Color.TRANSPARENT);

        ImageView dotsIcon = new ImageView(this);
        int iconPx = (int) (12 * dm.density);
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(iconPx, iconPx);
        iconParams.gravity = Gravity.BOTTOM | Gravity.END;
        iconParams.setMargins(0, 0, 2, 2);
        dotsIcon.setLayoutParams(iconParams);
        dotsIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        dotsIcon.setColorFilter(Color.parseColor("#EAB308"));
        dotsIcon.setAlpha(0.6f);
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
                        int screenMaxW = Math.max(minWindowWidth, currentMetrics.widthPixels - 16);
                        int screenMaxH = Math.max(minWindowHeight, (int) (currentMetrics.heightPixels * 0.90f));

                        params.width = Math.min(Math.max(minWindowWidth, initialW + deltaW), screenMaxW);
                        params.height = Math.min(Math.max(minWindowHeight, initialH + deltaH), screenMaxH);
                        lastExpandedWidth = params.width;
                        lastExpandedHeight = params.height;
                        try {
                            windowManager.updateViewLayout(floatingView, params);
                        } catch (Exception ignored) {}
                        return true;
                    case MotionEvent.ACTION_UP:
                        savePrompterState();
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
     */
    public class PrompterBridge {
        @JavascriptInterface
        public void closePrompter() {
            mainHandler.post(() -> {
                savePrompterState();
                stopSelf();
            });
        }

        @JavascriptInterface
        public void setMinimized(boolean minimized) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    isMinimized = minimized;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);

                    if (minimized) {
                        lastExpandedWidth = params.width;
                        lastExpandedHeight = params.height;
                        int pillW = Math.min((int)(dm.density * 260), dm.widthPixels - 32);
                        int pillH = (int)(dm.density * 54);
                        params.width = pillW;
                        params.height = pillH;
                        if (dragStrip != null) dragStrip.setVisibility(View.GONE);
                        if (resizeHandle != null) resizeHandle.setVisibility(View.GONE);
                    } else {
                        params.width = lastExpandedWidth > 0 ? lastExpandedWidth : 660;
                        params.height = lastExpandedHeight > 0 ? lastExpandedHeight : 740;
                        if (dragStrip != null) dragStrip.setVisibility(View.VISIBLE);
                        if (resizeHandle != null) resizeHandle.setVisibility(View.VISIBLE);
                    }
                    windowManager.updateViewLayout(floatingView, params);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void cyclePosition() {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);
                    int screenH = dm.heightPixels;
                    int screenW = dm.widthPixels;

                    currentPositionState = (currentPositionState + 1) % 3;
                    if (currentPositionState == 0) { // Posisi Atas
                        params.y = (int)(dm.density * 36);
                        params.x = Math.max(0, (screenW - params.width) / 2);
                    } else if (currentPositionState == 1) { // Posisi Tengah
                        params.y = Math.max(0, (screenH - params.height) / 2);
                        params.x = Math.max(0, (screenW - params.width) / 2);
                    } else { // Posisi Bawah
                        params.y = Math.max(0, screenH - params.height - (int)(dm.density * 50));
                        params.x = Math.max(0, (screenW - params.width) / 2);
                    }
                    windowManager.updateViewLayout(floatingView, params);
                    savePrompterState();
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void moveDelta(int dx, int dy) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);
                    int screenW = dm.widthPixels;
                    int screenH = dm.heightPixels;

                    params.x = Math.max(0, Math.min(screenW - 50, params.x + dx));
                    params.y = Math.max(0, Math.min(screenH - 50, params.y + dy));
                    windowManager.updateViewLayout(floatingView, params);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void saveCurrentPosition() {
            mainHandler.post(() -> savePrompterState());
        }

        @JavascriptInterface
        public void setPrompterRotation(int degrees) {
            mainHandler.post(() -> {
                try {
                    if (windowManager == null || floatingView == null || params == null) return;
                    currentSavedRotation = degrees;
                    DisplayMetrics dm = new DisplayMetrics();
                    windowManager.getDefaultDisplay().getMetrics(dm);
                    int screenW = dm.widthPixels;
                    int screenH = dm.heightPixels;

                    // Bila rotasi 90 atau 270 (posisi horizontal/landscape)
                    if (degrees == 90 || degrees == 270) {
                        int targetW = Math.max(lastExpandedHeight, 500);
                        int targetH = Math.max(lastExpandedWidth, 340);
                        // Otomatis mengecil agar tidak melebihi batas layar HP
                        params.width = Math.min(targetW, screenW - 16);
                        params.height = Math.min(targetH, (int)(screenH * 0.85f));
                    } else {
                        // Rotasi 0 atau 180 (posisi vertikal/portrait)
                        int targetW = Math.max(lastExpandedWidth, 340);
                        int targetH = Math.max(lastExpandedHeight, 520);
                        params.width = Math.min(targetW, screenW - 16);
                        params.height = Math.min(targetH, (int)(screenH * 0.88f));
                    }

                    // Pastikan tidak keluar layar
                    if (params.x + params.width > screenW) {
                        params.x = Math.max(0, screenW - params.width - 8);
                    }
                    if (params.y + params.height > screenH) {
                        params.y = Math.max(0, screenH - params.height - 8);
                    }

                    windowManager.updateViewLayout(floatingView, params);
                    savePrompterState();
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void saveTheme(String themeId, String bgRgb, String highlightColor) {
            mainHandler.post(() -> {
                try {
                    currentSavedThemeId = themeId;
                    savePrompterState();
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void savePrompterSettings(
            int speed,
            int fontSize,
            int opacity,
            String themeId,
            String presetId,
            int rotation,
            boolean isMirrored,
            boolean showFocusGuide,
            int focusPercent,
            int countdownSec
        ) {
            mainHandler.post(() -> {
                try {
                    currentSavedSpeed = speed;
                    currentSavedFontSize = fontSize;
                    currentSavedOpacity = opacity;
                    currentSavedThemeId = themeId;
                    currentSavedPresetId = presetId;
                    currentSavedRotation = rotation;
                    currentSavedMirrored = isMirrored;
                    currentSavedShowFocusGuide = showFocusGuide;
                    currentSavedFocusPercent = focusPercent;
                    currentSavedCountdownSec = countdownSec;
                    savePrompterState();
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void openFullApp() {
            mainHandler.post(() -> {
                try {
                    savePrompterState();
                    Intent launchIntent = new Intent(FloatingPrompterService.this, MainActivity.class);
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    launchIntent.putExtra("open_full_prompter", true);
                    startActivity(launchIntent);
                    // HENTIKAN FloatingPrompterService agar TIDAK ada 2 teleprompter yang muncul bersamaan
                    stopSelf();
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
     */
    private String buildFloatingHtml(
        String scriptText,
        String conceptsJson,
        int speed,
        int fontSize,
        int opacity,
        String textColor,
        String presetId,
        String themeId,
        String backgroundColorHex,
        String highlightColorHex,
        int rotation,
        boolean isMirrored,
        boolean showFocusGuide,
        int focusPercent,
        int countdownSec
    ) {
        String scriptJson = escapeJson(scriptText);
        String safePresetId = (presetId != null && !presetId.isEmpty()) ? presetId : "standard_read";
        String conceptsJsonEscaped = (conceptsJson != null && !conceptsJson.isEmpty()) ? escapeJson(conceptsJson) : "";

        String safeThemeId = (themeId != null && !themeId.isEmpty()) ? themeId : "dark_pro";
        String resolvedBgRgb = "0, 0, 0";
        String resolvedText = "#FFFFFF";
        String resolvedHighlight = "#FACC15";
        String resolvedCardBg = "#18181B";
        String resolvedCardBorder = "#27272A";
        String resolvedCardText = "#FFFFFF";
        String resolvedDockBg = "rgba(9, 9, 11, 0.96)";
        String resolvedDockBorder = "#27272A";

        if ("soft_comfort".equals(safeThemeId)) {
            resolvedBgRgb = "24, 24, 27";
            resolvedText = "#FAF9F6";
            resolvedHighlight = "#34D399";
            resolvedCardBg = "#27272A";
            resolvedCardBorder = "#3F3F46";
            resolvedCardText = "#FAF9F6";
            resolvedDockBg = "rgba(24, 24, 27, 0.96)";
            resolvedDockBorder = "#3F3F46";
        } else if ("light_clean".equals(safeThemeId)) {
            resolvedBgRgb = "255, 255, 255";
            resolvedText = "#18181B";
            resolvedHighlight = "#2563EB";
            resolvedCardBg = "#F4F4F5";
            resolvedCardBorder = "#E4E4E7";
            resolvedCardText = "#18181B";
            resolvedDockBg = "rgba(244, 244, 245, 0.96)";
            resolvedDockBorder = "#E4E4E7";
        }

        if (highlightColorHex != null && !highlightColorHex.isEmpty()) {
            resolvedHighlight = highlightColorHex;
        }
        if (textColor != null && !textColor.isEmpty() && !"#FFFFFF".equals(textColor)) {
            resolvedText = textColor;
        }

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
            "      background-color: rgba(" + resolvedBgRgb + ", " + (opacity / 100.0) + ");\n" +
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
            "      background: linear-gradient(90deg, " + resolvedHighlight + "cc, " + resolvedHighlight + ", " + resolvedHighlight + "cc);\n" +
            "      box-shadow: 0 0 10px " + resolvedHighlight + ";\n" +
            "    }\n" +
            "    #focus-badge {\n" +
            "      font-size: 10px; font-weight: bold; color: " + resolvedHighlight + "; font-family: monospace;\n" +
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
            "    /* Header Pemisah Konsep Sesuai Tema */\n" +
            "    .concept-header {\n" +
            "      display: flex; align-items: center; justify-content: space-between; gap: 8px;\n" +
            "      padding: 8px 12px; border-radius: 12px; margin: 10px 0 8px 0;\n" +
            "      background: " + resolvedCardBg + "; border: 2px solid " + resolvedCardBorder + ";\n" +
            "      font-size: 12px; font-weight: 900; color: " + resolvedCardText + ";\n" +
            "      box-shadow: 0 4px 12px rgba(0,0,0,0.3); text-transform: uppercase;\n" +
            "    }\n" +
            "    .concept-title {\n" +
            "      color: " + resolvedCardText + "; font-weight: 900; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n" +
            "    }\n" +
            "    .duration-badge {\n" +
            "      font-size: 10px; font-weight: bold; color: " + resolvedHighlight + "; background: rgba(0,0,0,0.2);\n" +
            "      padding: 2px 6px; border-radius: 6px; border: 1px solid " + resolvedCardBorder + "; flex-shrink: 0;\n" +
            "    }\n" +
            "    .prompter-line {\n" +
            "      margin-bottom: 14px; transition: font-size 0.15s ease; color: " + resolvedText + ";\n" +
            "    }\n" +
            "    /* Kata Penekanan / Huruf Kapital Berwarna Cerah Sesuai Tema */\n" +
            "    .highlight-word {\n" +
            "      font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: " + resolvedHighlight + ";\n" +
            "    }\n" +
            "    /* Garis Bantu Jeda Intonasi (/ dan //) */\n" +
            "    .pause-short {\n" +
            "      color: " + resolvedHighlight + "; font-weight: bold; margin: 0 3px; opacity: 0.9; user-select: none;\n" +
            "    }\n" +
            "    .pause-long {\n" +
            "      color: " + resolvedHighlight + "; font-weight: 900; margin: 0 4px; opacity: 0.95; user-select: none;\n" +
            "    }\n" +
            "    .line-focus-style {\n" +
            "      border-left: 4px solid " + resolvedHighlight + " !important; padding-left: 10px !important;\n" +
            "      border-radius: 0 12px 12px 0 !important; background: rgba(15, 23, 42, 0.65) !important;\n" +
            "    }\n" +
            "    /* Hitung Mundur (Countdown) */\n" +
            "    #countdown-overlay {\n" +
            "      position: absolute; inset: 0; z-index: 40; background: rgba(0,0,0,0.85);\n" +
            "      display: none; flex-direction: column; align-items: center; justify-content: center;\n" +
            "    }\n" +
            "    #countdown-num {\n" +
            "      font-size: 72px; font-weight: 900; color: " + resolvedHighlight + "; text-shadow: 0 0 25px " + resolvedHighlight + ";\n" +
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
            "      width: 52px; height: 52px; border-radius: 50%;\n" +
            "      background: rgba(0,0,0,0.85); border: 2px solid " + resolvedHighlight + ";\n" +
            "      color: " + resolvedHighlight + "; display: flex; align-items: center; justify-content: center;\n" +
            "      box-shadow: 0 0 24px " + resolvedHighlight + "88; animation: pulseOut 0.4s ease forwards;\n" +
            "    }\n" +
            "    @keyframes pulseOut {\n" +
            "      0% { opacity: 1; transform: scale(0.85); }\n" +
            "      100% { opacity: 0; transform: scale(1.28); }\n" +
            "    }\n" +
            "\n" +
            "    /* Bottom Dock Bar - Responsif, Sejajar, Simetris, Rapi */\n" +
            "    :root {\n" +
            "      --dock-btn-size: 26px;\n" +
            "      --dock-icon-size: 12px;\n" +
            "    }\n" +
            "    #bottom-dock {\n" +
            "      height: calc(var(--dock-btn-size) + 8px); background: " + resolvedDockBg + ";\n" +
            "      border-top: 1px solid " + resolvedDockBorder + "; padding: 0 3px;\n" +
            "      display: flex; align-items: center; justify-content: space-between; gap: 2px;\n" +
            "      z-index: 30; width: 100%; box-sizing: border-box; overflow: hidden;\n" +
            "      transition: opacity 0.2s ease;\n" +
            "    }\n" +
            "    .dock-btn {\n" +
            "      border: 1px solid #3F3F46; outline: none; border-radius: 7px;\n" +
            "      display: flex; align-items: center; justify-content: center;\n" +
            "      background: #18181B; color: #D4D4D8; cursor: pointer;\n" +
            "      width: var(--dock-btn-size); height: var(--dock-btn-size); min-width: 0; flex-shrink: 1;\n" +
            "      transition: background 0.15s, transform 0.1s;\n" +
            "      touch-action: none;\n" +
            "    }\n" +
            "    .dock-btn svg { width: var(--dock-icon-size); height: var(--dock-icon-size); }\n" +
            "    .dock-btn:active { transform: scale(0.92); background: #27272A; }\n" +
            "\n" +
            "    /* Tombol Geser (Move Handle) */\n" +
            "    #move-btn {\n" +
            "      border: 1px solid #F59E0B !important;\n" +
            "      background: rgba(245, 158, 11, 0.2) !important;\n" +
            "      color: #F59E0B !important;\n" +
            "      cursor: grab;\n" +
            "    }\n" +
            "    #move-btn:active { cursor: grabbing; background: #F59E0B !important; color: black !important; }\n" +
            "\n" +
            "    /* Tombol Tutup Kontras Tinggi (Merah Bersih, Selalu Terlihat Jelas) */\n" +
            "    .dock-btn-close {\n" +
            "      border: 1px solid rgba(239, 68, 68, 0.6) !important;\n" +
            "      background: rgba(239, 68, 68, 0.25) !important;\n" +
            "      color: #F87171 !important;\n" +
            "    }\n" +
            "    .dock-btn-close:active {\n" +
            "      background: #EF4444 !important; color: #FFFFFF !important;\n" +
            "    }\n" +
            "    #hero-play {\n" +
            "      background: #F59E0B; color: black; font-weight: 800;\n" +
            "      width: calc(var(--dock-btn-size) * 1.15); height: var(--dock-btn-size);\n" +
            "      border-radius: 7px; border: none;\n" +
            "      display: flex; align-items: center; justify-content: center;\n" +
            "      box-shadow: 0 4px 14px rgba(245,158,11,0.35); flex-shrink: 0;\n" +
            "    }\n" +
            "    #hero-play svg { width: var(--dock-icon-size); height: var(--dock-icon-size); }\n" +
            "    #hero-play:active { transform: scale(0.92); }\n" +
            "    /* Speed Stepper */\n" +
            "    .stepper-box {\n" +
            "      display: flex; align-items: center; background: #18181B; border-radius: 7px;\n" +
            "      padding: 0 1px; border: 1px solid #3F3F46; height: var(--dock-btn-size); flex-shrink: 1; min-width: 0;\n" +
            "    }\n" +
            "    .stepper-btn {\n" +
            "      width: calc(var(--dock-btn-size) * 0.7); height: 100%; border: none; background: transparent; color: #A1A1AA;\n" +
            "      font-weight: 900; font-size: calc(var(--dock-btn-size) * 0.42); display: flex; align-items: center; justify-content: center;\n" +
            "      cursor: pointer;\n" +
            "    }\n" +
            "    .stepper-label {\n" +
            "      padding: 0 2px; font-family: monospace; font-size: calc(var(--dock-btn-size) * 0.38); font-weight: bold; color: #F59E0B;\n" +
            "      min-width: 16px; text-align: center;\n" +
            "    }\n" +
            "\n" +
            "    /* Settings Panel: Menu Gabungan 3/4 Sebelah Kanan (Sesuai Web App) */\n" +
            "    #settings-panel {\n" +
            "      position: absolute; bottom: calc(var(--dock-btn-size) + 12px); right: 4px; left: auto;\n" +
            "      width: 75%; max-width: 320px; z-index: 50;\n" +
            "      background: rgba(24, 24, 27, 0.96); border: 1px solid rgba(113, 113, 122, 0.6);\n" +
            "      border-radius: 16px; padding: 10px; display: none; flex-direction: column;\n" +
            "      gap: 8px; color: #E4E4E7;\n" +
            "      box-shadow: 0 16px 36px rgba(0,0,0,0.85); max-height: 80%; overflow-y: auto;\n" +
            "      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);\n" +
            "    }\n" +
            "    .tabs-row {\n" +
            "      display: flex; background: #18181B; border-radius: 10px; padding: 2px; gap: 2px;\n" +
            "      border: 1px solid #27272A;\n" +
            "    }\n" +
            "    .tab-item {\n" +
            "      flex: 1; padding: 5px 0; text-align: center; font-size: 10px; font-weight: 600;\n" +
            "      border-radius: 7px; color: #A1A1AA; cursor: pointer;\n" +
            "      display: flex; align-items: center; justify-content: center; gap: 3px;\n" +
            "    }\n" +
            "    .tab-item.active {\n" +
            "      background: #F59E0B; color: black; font-weight: bold;\n" +
            "    }\n" +
            "    .setting-group { display: flex; flex-direction: column; gap: 5px; }\n" +
            "    .setting-label { font-size: 10px; color: #A1A1AA; display: flex; justify-content: space-between; align-items: center; }\n" +
            "    .slider-input { width: 100%; accent-color: #F59E0B; height: 5px; border-radius: 3px; }\n" +
            "    .presets-container { display: flex; flex-direction: column; gap: 4px; max-height: 140px; overflow-y: auto; }\n" +
            "    .preset-row {\n" +
            "      display: flex; align-items: center; justify-content: space-between; padding: 5px 7px;\n" +
            "      border-radius: 8px; background: #18181B; border: 1px solid #27272A; cursor: pointer;\n" +
            "    }\n" +
            "    .preset-row.active {\n" +
            "      border-color: #F59E0B; background: rgba(245,158,11,0.2);\n" +
            "    }\n" +
            "    .preset-preview-box {\n" +
            "      padding: 2px 5px; border-radius: 4px; background: black; border: 1px solid #3F3F46;\n" +
            "      font-size: 10px; font-weight: bold; margin-right: 6px;\n" +
            "    }\n" +
            "    .pill-btn {\n" +
            "      padding: 3px 8px; border-radius: 7px; font-size: 10px; font-weight: bold;\n" +
            "      border: 1px solid #27272A; background: #18181B; color: #D4D4D8; cursor: pointer;\n" +
            "    }\n" +
            "    .pill-btn.active {\n" +
            "      border-color: #F59E0B; background: #F59E0B; color: black;\n" +
            "    }\n" +
            "\n" +
            "    /* Mode Minimized Pill (Identik Web) */\n" +
            "    #minimized-pill {\n" +
            "      display: none; width: 100%; height: 100%;\n" +
            "      background: rgba(24, 24, 27, 0.96); border: 2px solid #F59E0B; border-radius: 9999px;\n" +
            "      align-items: center; justify-content: space-between; padding: 0 10px;\n" +
            "      box-shadow: 0 10px 25px rgba(0,0,0,0.85); cursor: pointer;\n" +
            "    }\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <!-- Pill Mode Minimized -->\n" +
            "  <div id=\"minimized-pill\" onclick=\"toggleMinimize()\">\n" +
            "    <div style=\"display:flex; align-items:center; gap:8px;\">\n" +
            "      <span style=\"width:8px; height:8px; border-radius:50%; background:#34D399; box-shadow:0 0 6px #34D399; flex-shrink:0;\"></span>\n" +
            "      <span style=\"font-size:11px; font-weight:bold; color:#FDE047; letter-spacing:0.02em;\">teleprompter Gagaswara</span>\n" +
            "    </div>\n" +
            "    <div style=\"display:flex; align-items:center; gap:6px;\" onclick=\"event.stopPropagation()\">\n" +
            "      <button onclick=\"togglePlay()\" style=\"width:22px; height:22px; border-radius:50%; background:#F59E0B; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;\">\n" +
            "        <svg id=\"pill-icon-play\" viewBox=\"0 0 24 24\" width=\"11\" height=\"11\" fill=\"black\"><polygon points=\"6 3 20 12 6 21 6 3\"/></svg>\n" +
            "        <svg id=\"pill-icon-pause\" style=\"display:none;\" viewBox=\"0 0 24 24\" width=\"11\" height=\"11\" fill=\"black\"><rect x=\"6\" y=\"4\" width=\"3\" height=\"16\"/><rect x=\"15\" y=\"4\" width=\"3\" height=\"16\"/></svg>\n" +
            "      </button>\n" +
            "      <button onclick=\"closePrompter()\" style=\"width:22px; height:22px; border-radius:50%; background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.5); color:#F87171; display:flex; align-items:center; justify-content:center; cursor:pointer;\">\n" +
            "        <svg viewBox=\"0 0 24 24\" width=\"11\" height=\"11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n" +
            "      </button>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "\n" +
            "  <!-- Normal Window Container -->\n" +
            "  <div id=\"app-container\">\n" +
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
            "        <div id=\"script-content\" style=\"transform: " + (isMirrored ? "scaleX(-1)" : "none") + ";\">\n" +
            "        </div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <!-- Settings Panel (Menu Gabungan 3/4 Sebelah Kanan Sesuai Web) -->\n" +
            "    <div id=\"settings-panel\" onclick=\"event.stopPropagation()\">\n" +
            "      <div style=\"display:flex; justify-content:space-between; align-items:center;\">\n" +
            "        <span style=\"font-weight:bold; font-size:11px; color:#F59E0B; display:flex; align-items:center; gap:5px;\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"21\" y1=\"4\" x2=\"14\" y2=\"4\"/><line x1=\"10\" y1=\"4\" x2=\"3\" y2=\"4\"/><line x1=\"21\" y1=\"12\" x2=\"12\" y2=\"12\"/><line x1=\"8\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"20\" x2=\"16\" y2=\"20\"/><line x1=\"12\" y1=\"20\" x2=\"3\" y2=\"20\"/><line x1=\"14\" y1=\"2\" x2=\"14\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"8\" y2=\"14\"/><line x1=\"16\" y1=\"18\" x2=\"16\" y2=\"22\"/></svg>\n" +
            "          <span>Pengaturan Teleprompter</span>\n" +
            "        </span>\n" +
            "        <button onclick=\"toggleSettings()\" style=\"background:transparent; border:none; color:#A1A1AA; cursor:pointer;\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n" +
            "        </button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Tabs Teks, Countdown, Layar -->\n" +
            "      <div class=\"tabs-row\">\n" +
            "        <div id=\"tab-teks\" class=\"tab-item active\" onclick=\"switchTab('teks')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/></svg>\n" +
            "          <span>Teks</span>\n" +
            "        </div>\n" +
            "        <div id=\"tab-countdown\" class=\"tab-item\" onclick=\"switchTab('countdown')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"10\" y1=\"2\" x2=\"14\" y2=\"2\"/><line x1=\"12\" y1=\"14\" x2=\"15\" y2=\"11\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/></svg>\n" +
            "          <span>Countdown</span>\n" +
            "        </div>\n" +
            "        <div id=\"tab-layar\" class=\"tab-item\" onclick=\"switchTab('layar')\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>\n" +
            "          <span>Layar</span>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Teks: 3 Preset Tema, Ukuran Font & 10 Gaya Subtitle -->\n" +
            "      <div id=\"panel-teks\" style=\"display:flex; flex-direction:column; gap:7px;\">\n" +
            "        <!-- 3 PRESET TEMA TELEPROMPTER -->\n" +
            "        <div class=\"setting-group\" style=\"background:rgba(0,0,0,0.35); padding:6px; border-radius:10px; border:1px solid #27272A;\">\n" +
            "          <div class=\"setting-label\" style=\"margin-bottom:4px;\">\n" +
            "            <span style=\"color:#E4E4E7; font-weight:bold;\">Pilihan Tema Teleprompter:</span>\n" +
            "          </div>\n" +
            "          <div style=\"display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px;\" id=\"theme-buttons-container\">\n" +
            "            <button type=\"button\" onclick=\"selectTheme('dark_pro')\" id=\"btn-theme-dark_pro\" class=\"pill-btn\" style=\"display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 2px;\">\n" +
            "              <span style=\"width:16px; height:16px; border-radius:50%; background:#000000; border:1px solid #4B5563; display:inline-block; position:relative;\"><span style=\"position:absolute; bottom:0; right:0; width:5px; height:5px; border-radius:50%; background:#FACC15;\"></span></span>\n" +
            "              <span style=\"font-size:9px; font-weight:bold;\">Dark Pro</span>\n" +
            "            </button>\n" +
            "            <button type=\"button\" onclick=\"selectTheme('soft_comfort')\" id=\"btn-theme-soft_comfort\" class=\"pill-btn\" style=\"display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 2px;\">\n" +
            "              <span style=\"width:16px; height:16px; border-radius:50%; background:#18181B; border:1px solid #4B5563; display:inline-block; position:relative;\"><span style=\"position:absolute; bottom:0; right:0; width:5px; height:5px; border-radius:50%; background:#34D399;\"></span></span>\n" +
            "              <span style=\"font-size:9px; font-weight:bold;\">Comfort</span>\n" +
            "            </button>\n" +
            "            <button type=\"button\" onclick=\"selectTheme('light_clean')\" id=\"btn-theme-light_clean\" class=\"pill-btn\" style=\"display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 2px;\">\n" +
            "              <span style=\"width:16px; height:16px; border-radius:50%; background:#FFFFFF; border:1px solid #9CA3AF; display:inline-block; position:relative;\"><span style=\"position:absolute; bottom:0; right:0; width:5px; height:5px; border-radius:50%; background:#2563EB;\"></span></span>\n" +
            "              <span style=\"font-size:9px; font-weight:bold;\">Light</span>\n" +
            "            </button>\n" +
            "          </div>\n" +
            "        </div>\n" +
            "\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Ukuran Font (Mulai dari 7px):</span>\n" +
            "            <span id=\"font-label\" style=\"color:#F59E0B; font-weight:bold; font-family:monospace;\">" + fontSize + "px</span>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"7\" max=\"48\" value=\"" + fontSize + "\" class=\"slider-input\" oninput=\"updateFontSize(this.value)\" />\n" +
            "        </div>\n" +
            "\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\"><span>Pilih 10 Gaya Subtitle Siap Rekam:</span></div>\n" +
            "          <div id=\"presets-list\" class=\"presets-container\"></div>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Countdown -->\n" +
            "      <div id=\"panel-countdown\" style=\"display:none; flex-direction:column; gap:7px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Hitung Mundur (Countdown):</span>\n" +
            "            <button onclick=\"toggleCountdownEnabled()\" id=\"cd-toggle-btn\" class=\"pill-btn " + (countdownSec > 0 ? "active" : "") + "\">" + (countdownSec > 0 ? "Aktif" : "Nonaktif") + "</button>\n" +
            "          </div>\n" +
            "          <div class=\"setting-label\" style=\"margin-top:3px;\">\n" +
            "            <span>Durasi:</span>\n" +
            "            <span id=\"cd-label\" style=\"color:#F59E0B; font-weight:bold;\">" + (countdownSec > 0 ? (countdownSec + " Detik") : "Langsung") + "</span>\n" +
            "          </div>\n" +
            "          <div style=\"display:flex; gap:4px; margin-top:2px;\">\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(0)\">Langsung</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(3)\">3 Detik</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(5)\">5 Detik</button>\n" +
            "            <button class=\"pill-btn\" style=\"flex:1;\" onclick=\"setCd(10)\">10 Detik</button>\n" +
            "          </div>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- Subtab Layar -->\n" +
            "      <div id=\"panel-layar\" style=\"display:none; flex-direction:column; gap:7px;\">\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Transparansi Latar Belakang:</span>\n" +
            "            <span id=\"op-label\" style=\"color:#F59E0B; font-weight:bold; font-family:monospace;\">" + opacity + "%</span>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"10\" max=\"100\" value=\"" + opacity + "\" class=\"slider-input\" oninput=\"updateOpacity(this.value)\" />\n" +
            "        </div>\n" +
            "        <div class=\"setting-group\">\n" +
            "          <div class=\"setting-label\">\n" +
            "            <span>Garis Panduan Kamera:</span>\n" +
            "            <button onclick=\"toggleFocusGuide()\" id=\"guide-toggle-btn\" class=\"pill-btn " + (showFocusGuide ? "active" : "") + "\">" + (showFocusGuide ? "Aktif" : "Off") + "</button>\n" +
            "          </div>\n" +
            "          <input type=\"range\" min=\"5\" max=\"75\" value=\"" + focusPercent + "\" class=\"slider-input\" oninput=\"updateFocusPercent(this.value)\" />\n" +
            "        </div>\n" +
            "        <div style=\"display:flex; gap:4px; padding-top:2px;\">\n" +
            "          <button class=\"pill-btn\" style=\"flex:1; display:flex; align-items:center; justify-content:center; gap:3px;\" onclick=\"toggleMirror()\">\n" +
            "            <svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m3 7 5 5-5 5V7\"/><path d=\"m21 7-5 5 5 5V7\"/><path d=\"M12 20v2\"/><path d=\"M12 14v2\"/><path d=\"M12 8v2\"/><path d=\"M12 2v2\"/></svg>\n" +
            "            <span>Mirror Kaca</span>\n" +
            "          </button>\n" +
            "          <button class=\"pill-btn\" style=\"flex:1; display:flex; align-items:center; justify-content:center; gap:3px;\" onclick=\"rotatePrompter()\">\n" +
            "            <svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/></svg>\n" +
            "            <span id=\"panel-rot-label\">Rotasi: 0°</span>\n" +
            "          </button>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <!-- Bottom Dock: Sejajar, Simetris, Lengkap dengan Menu Geser Aktif, Rotasi, Minimize & Tutup Merah Jelas -->\n" +
            "    <div id=\"bottom-dock\" onclick=\"event.stopPropagation()\">\n" +
            "      <!-- SISI KIRI: GESER (PALING KIRI), ROTASI, RESET -->\n" +
            "      <div style=\"display:flex; align-items:center; gap:2px;\">\n" +
            "        <!-- 1. Tombol Geser (Dapat Ditekan & Digeser Bebas ke Arah Mana Saja) -->\n" +
            "        <button id=\"move-btn\" class=\"dock-btn\" title=\"Geser Posisi Teleprompter (Tekan & Geser Bebas, atau Ketuk untuk Pindah Posisi)\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"5 9 2 12 5 15\"/><polyline points=\"9 5 12 2 15 5\"/><polyline points=\"15 19 12 22 9 19\"/><polyline points=\"19 9 22 12 19 15\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"22\"/></svg>\n" +
            "        </button>\n" +
            "        <!-- 2. Tombol Rotasi Orientasi Teleprompter (0°, 90°, 180°, 270°) -->\n" +
            "        <button id=\"rot-btn\" class=\"dock-btn\" onclick=\"rotatePrompter()\" title=\"Ubah Orientasi Rotasi Teleprompter (0°, 90°, 180°, 270°)\" style=\"position:relative;\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/></svg>\n" +
            "          <span id=\"rot-badge\" style=\"display:none; position:absolute; top:-3px; right:-3px; background:#F59E0B; color:black; font-size:7px; font-weight:bold; border-radius:5px; padding:0 2px;\">0°</span>\n" +
            "        </button>\n" +
            "        <!-- 3. Tombol Reset ke Paling Atas -->\n" +
            "        <button class=\"dock-btn\" onclick=\"resetScroll()\" title=\"Kembalikan Naskah ke Awal (Reset)\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></svg>\n" +
            "        </button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- TENGAH: SPEED STEPPER, MULAI / JEDA & FULL -->\n" +
            "      <div style=\"display:flex; align-items:center; gap:2px;\">\n" +
            "        <!-- Speed Stepper -->\n" +
            "        <div class=\"stepper-box\">\n" +
            "          <button class=\"stepper-btn\" onclick=\"changeSpeed(-1)\">−</button>\n" +
            "          <span id=\"speed-stepper-label\" class=\"stepper-label\">" + speed + "x</span>\n" +
            "          <button class=\"stepper-btn\" onclick=\"changeSpeed(1)\">+</button>\n" +
            "        </div>\n" +
            "\n" +
            "        <!-- Hero Play / Pause -->\n" +
            "        <button id=\"hero-play\" onclick=\"togglePlay()\" title=\"Mulai / Jeda\">\n" +
            "          <svg id=\"hero-icon-play\" viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"black\"><polygon points=\"6 3 20 12 6 21 6 3\"/></svg>\n" +
            "          <svg id=\"hero-icon-pause\" style=\"display:none;\" viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"black\"><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/></svg>\n" +
            "        </button>\n" +
            "\n" +
            "        <!-- Full App Mode -->\n" +
            "        <button class=\"dock-btn\" onclick=\"openFullApp()\" title=\"Kembali ke Mode Teleprompter Layar Penuh (Full)\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/></svg>\n" +
            "        </button>\n" +
            "      </div>\n" +
            "\n" +
            "      <!-- SISI KANAN: PENGATURAN, MINIMIZE (-) & TUTUP (X) -->\n" +
            "      <div style=\"display:flex; align-items:center; gap:2px;\">\n" +
            "        <!-- Settings Panel -->\n" +
            "        <button class=\"dock-btn\" onclick=\"toggleSettings()\" title=\"Menu Pengaturan\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"21\" y1=\"4\" x2=\"14\" y2=\"4\"/><line x1=\"10\" y1=\"4\" x2=\"3\" y2=\"4\"/><line x1=\"21\" y1=\"12\" x2=\"12\" y2=\"12\"/><line x1=\"8\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"20\" x2=\"16\" y2=\"20\"/><line x1=\"12\" y1=\"20\" x2=\"3\" y2=\"20\"/><line x1=\"14\" y1=\"2\" x2=\"14\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"8\" y2=\"14\"/><line x1=\"16\" y1=\"18\" x2=\"16\" y2=\"22\"/></svg>\n" +
            "        </button>\n" +
            "\n" +
            "        <!-- Minimize (-) -->\n" +
            "        <button class=\"dock-btn\" onclick=\"toggleMinimize()\" title=\"Minimize Teleprompter (-)\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>\n" +
            "        </button>\n" +
            "\n" +
            "        <!-- Tutup (X) Merah Jelas, Kontras Tinggi & Tidak Terhalang -->\n" +
            "        <button class=\"dock-btn dock-btn-close\" onclick=\"closePrompter()\" title=\"Tutup Teleprompter\">\n" +
            "          <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n" +
            "        </button>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "\n" +
            "  <script>\n" +
            "    const RAW_SCRIPT = \"" + scriptJson + "\";\n" +
            "    const RAW_CONCEPTS_JSON = \"" + conceptsJsonEscaped + "\";\n" +
            "\n" +
            "    // 10 Preset Subtitle Resmi Gagaswara\n" +
            "    const SUBTITLE_PRESETS = [\n" +
            "      { id: 'standard_read', name: '1. Standard Read', textColor: '#FFFFFF', highlightColor: '#FACC15', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.95)', fontWeight: '400', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'large_text', name: '2. Large Text', textColor: '#FFFFFF', highlightColor: '#FEF08A', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '700', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'high_contrast', name: '3. High Contrast', textColor: '#FFFFFF', highlightColor: '#22D3EE', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '700', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'daylight_read', name: '4. Daylight Read', textColor: '#FFFFFF', highlightColor: '#FB923C', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '700', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'eye_comfort', name: '5. Eye Comfort', textColor: '#FFFFFF', highlightColor: '#6EE7B7', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.9)', fontWeight: '400', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'wide_spacing', name: '6. Wide Spacing', textColor: '#FFFFFF', highlightColor: '#F472B6', textShadow: '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '600', lineHeight: '1.65', letterSpacing: '0.06em', isLineFocus: false },\n" +
            "      { id: 'distance_max', name: '7. Distance Max', textColor: '#FFFFFF', highlightColor: '#FDE047', textShadow: '2.5px 2.5px 0 #000, -2.5px -2.5px 0 #000, 2.5px -2.5px 0 #000, -2.5px 2.5px 0 #000, 0 4px 8px rgba(0,0,0,1)', fontWeight: '800', lineHeight: '1.4', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'line_focus', name: '8. Line Focus', textColor: '#FFFFFF', highlightColor: '#38BDF8', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '600', lineHeight: '1.5', letterSpacing: 'normal', isLineFocus: true },\n" +
            "      { id: 'speaker_mode', name: '9. Speaker Mode', textColor: '#FFFFFF', highlightColor: '#FB923C', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)', fontWeight: '600', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false },\n" +
            "      { id: 'studio_pro', name: '10. Studio Pro', textColor: '#FFFFFF', highlightColor: '#EAB308', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.95)', fontWeight: '700', lineHeight: '1.45', letterSpacing: 'normal', isLineFocus: false }\n" +
            "    ];\n" +
            "\n" +
            "    const BENEFIT_WORDS = new Set([\n" +
            "      'GRATIS', 'HEMAT', 'ASLI', 'ORIGINAL', 'TERBUKTI', 'PRAKTIS', 'PREMIUM',\n" +
            "      'TERBAIK', 'REKOMENDASI', 'SOLUSI', 'AMPUH', 'WAJIB', 'JUARA', 'RAHASIA',\n" +
            "      'GAMPANG', 'VIRAL', 'FAVORIT', 'AWET', 'RINGAN', 'NYAMAN', 'CEPAT',\n" +
            "      'BERSIH', 'MUDAH', 'LANGSUNG', 'BEDA', 'KEREN', 'MANTAP', 'BAGUS',\n" +
            "      'OTENTIK', 'GARANSI', 'BERGARANSI', 'AMAN', 'BPOM', 'HALAL'\n" +
            "    ]);\n" +
            "    const PROMO_WORDS = new Set([\n" +
            "      'DISKON', 'PROMO', 'MURAH', 'CASHBACK', 'POTONGAN', 'ONGKIR',\n" +
            "      'VOUCHER', 'FLASH', 'SALE', 'CUMA', 'HANYA', 'RP', 'RIBU',\n" +
            "      'TERJANGKAU', 'SPESIAL', 'BONUS'\n" +
            "    ]);\n" +
            "    const CTA_WORDS = new Set(['CHECKOUT', 'KERANJANG', 'KUNING', 'BAWAH', 'BELI', 'PESAN', 'CO', 'ORDER']);\n" +
            "\n" +
            "    let isPlaying = false;\n" +
            "    let isCountingDown = false;\n" +
            "    let isMinimized = false;\n" +
            "    let currentSpeed = " + speed + ";\n" +
            "    let currentFontSize = " + fontSize + ";\n" +
            "    let currentOpacity = " + opacity + ";\n" +
            "    let currentPresetId = '" + safePresetId + "';\n" +
            "    let currentThemeId = '" + safeThemeId + "';\n" +
            "    let currentBgRgb = '" + resolvedBgRgb + "';\n" +
            "    let currentTextColor = '" + resolvedText + "';\n" +
            "    let currentHighlightColor = '" + resolvedHighlight + "';\n" +
            "    let isMirrored = " + isMirrored + ";\n" +
            "    let showFocus = " + showFocusGuide + ";\n" +
            "    let focusPercent = " + focusPercent + ";\n" +
            "    let countdownSec = " + countdownSec + ";\n" +
            "    let currentRotation = " + rotation + ";\n" +
            "\n" +
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
            "    const minimizedPill = document.getElementById('minimized-pill');\n" +
            "    const tapFeedback = document.getElementById('tap-feedback');\n" +
            "    const pulseIconPlay = document.getElementById('pulse-icon-play');\n" +
            "    const pulseIconPause = document.getElementById('pulse-icon-pause');\n" +
            "    const pillIconPlay = document.getElementById('pill-icon-play');\n" +
            "    const pillIconPause = document.getElementById('pill-icon-pause');\n" +
            "\n" +
            "    function escapeHtml(t) {\n" +
            "      return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\n" +
            "    }\n" +
            "\n" +
            "    function tokenizeSentenceText(sentence) {\n" +
            "      let text = String(sentence || '').trim();\n" +
            "      text = text.replace(/^(hook|problem|masalah|demo|solusi|value|cta|voiceover|narasi):\\s*/gi, '');\n" +
            "      text = text.replace(/\\s*,\\s*/g, ' / ');\n" +
            "      const rawWords = text.split(/\\s+/);\n" +
            "      const tokens = [];\n" +
            "      for (let w of rawWords) {\n" +
            "        if (!w) continue;\n" +
            "        if (w === '/') {\n" +
            "          tokens.push({ text: '/', type: 'pause-short' });\n" +
            "          continue;\n" +
            "        }\n" +
            "        if (w === '//') {\n" +
            "          tokens.push({ text: '//', type: 'pause-long' });\n" +
            "          continue;\n" +
            "        }\n" +
            "        const stripped = w.replace(/[^\\w]/g, '').toUpperCase();\n" +
            "        const alphaOnly = w.replace(/[^a-zA-Z]/g, '');\n" +
            "        const isCapital = alphaOnly.length >= 2 && alphaOnly === alphaOnly.toUpperCase();\n" +
            "        if (CTA_WORDS.has(stripped)) {\n" +
            "          tokens.push({ text: w.toUpperCase(), type: 'cta' });\n" +
            "        } else if (PROMO_WORDS.has(stripped) || stripped.startsWith('DISKON') || stripped.startsWith('PROMO') || stripped.startsWith('RP')) {\n" +
            "          tokens.push({ text: w.toUpperCase(), type: 'promo' });\n" +
            "        } else if (BENEFIT_WORDS.has(stripped) || isCapital) {\n" +
            "          tokens.push({ text: w, type: 'emphasis' });\n" +
            "        } else {\n" +
            "          tokens.push({ text: w, type: 'normal' });\n" +
            "        }\n" +
            "      }\n" +
            "      tokens.push({ text: '//', type: 'pause-long' });\n" +
            "      return tokens;\n" +
            "    }\n" +
            "\n" +
            "    function parseAndRenderScript() {\n" +
            "      const activePreset = SUBTITLE_PRESETS.find(p => p.id === currentPresetId) || SUBTITLE_PRESETS[0];\n" +
            "      let html = '';\n" +
            "\n" +
            "      if (RAW_CONCEPTS_JSON) {\n" +
            "        try {\n" +
            "          const parsedConcepts = JSON.parse(RAW_CONCEPTS_JSON);\n" +
            "          if (Array.isArray(parsedConcepts) && parsedConcepts.length > 0) {\n" +
            "            for (let c of parsedConcepts) {\n" +
            "              html += '<div class=\"concept-header\">' +\n" +
            "                        '<div style=\"display:flex;align-items:center;gap:6px;min-width:0;\">' +\n" +
            "                          '<span style=\"width:7px;height:7px;border-radius:50%;background:' + currentHighlightColor + ';flex-shrink:0;\"></span>' +\n" +
            "                          '<span class=\"concept-title\">' + escapeHtml(c.title || 'Skrip Affiliate') + '</span>' +\n" +
            "                        '</div>' +\n" +
            "                        '<span class=\"duration-badge\">±' + (c.estimatedDuration || 30) + 's</span>' +\n" +
            "                      '</div>';\n" +
            "\n" +
            "              if (Array.isArray(c.lines)) {\n" +
            "                for (let line of c.lines) {\n" +
            "                  const lineClass = 'prompter-line' + (activePreset.isLineFocus ? ' line-focus-style' : '');\n" +
            "                  html += '<div class=\"' + lineClass + '\" style=\"font-size:' + currentFontSize + 'px; color:' + currentTextColor + '; text-shadow:' + (currentThemeId === 'light_clean' ? 'none' : activePreset.textShadow) + '; font-weight:' + activePreset.fontWeight + '; line-height:' + activePreset.lineHeight + '; letter-spacing:' + activePreset.letterSpacing + ';\">';\n" +
            "                  if (Array.isArray(line.tokens)) {\n" +
            "                    for (let token of line.tokens) {\n" +
            "                      if (token.type === 'emphasis' || token.type === 'promo' || token.type === 'cta') {\n" +
            "                        html += '<span class=\"highlight-word\" style=\"color:' + currentHighlightColor + ';\">' + escapeHtml(token.text) + ' </span>';\n" +
            "                      } else if (token.type === 'pause-short') {\n" +
            "                        html += '<span class=\"pause-short\" style=\"color:' + currentHighlightColor + ';\" title=\"Jeda Intonasi\">/ </span>';\n" +
            "                      } else if (token.type === 'pause-long') {\n" +
            "                        html += '<span class=\"pause-long\" style=\"color:' + currentHighlightColor + ';\" title=\"Jeda Intonasi Panjang\">// </span>';\n" +
            "                      } else {\n" +
            "                        html += '<span>' + escapeHtml(token.text) + ' </span>';\n" +
            "                      }\n" +
            "                    }\n" +
            "                  } else {\n" +
            "                    html += escapeHtml(line.rawText || '');\n" +
            "                  }\n" +
            "                  html += '</div>';\n" +
            "                }\n" +
            "              }\n" +
            "            }\n" +
            "            html += '<div style=\"height:240px; display:flex; align-items:center; justify-content:center; color:#71717A; font-size:11px; font-weight:600;\">- Selesai Membaca -</div>';\n" +
            "            scriptContent.innerHTML = html;\n" +
            "            return;\n" +
            "          }\n" +
            "        } catch (e) {\n" +
            "          console.warn('Fallback parsing conceptsJson:', e);\n" +
            "        }\n" +
            "      }\n" +
            "\n" +
            "      const lines = RAW_SCRIPT.split('\\n');\n" +
            "      for (let i = 0; i < lines.length; i++) {\n" +
            "        let line = lines[i].trim();\n" +
            "        if (!line) continue;\n" +
            "\n" +
            "        if (line.startsWith('===') && line.endsWith('===')) {\n" +
            "          let title = line.replace(/===/g, '').trim();\n" +
            "          html += '<div class=\"concept-header\">' +\n" +
            "                    '<div style=\"display:flex;align-items:center;gap:6px;min-width:0;\">' +\n" +
            "                      '<span style=\"width:7px;height:7px;border-radius:50%;background:' + currentHighlightColor + ';flex-shrink:0;\"></span>' +\n" +
            "                      '<span class=\"concept-title\">' + escapeHtml(title) + '</span>' +\n" +
            "                    '</div>' +\n" +
            "                    '<span class=\"duration-badge\">±30s</span>' +\n" +
            "                  '</div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "        if (line === '---') {\n" +
            "          html += '<div style=\"height:16px; border-bottom:1px dashed rgba(255,255,255,0.15); margin-bottom:12px;\"></div>';\n" +
            "          continue;\n" +
            "        }\n" +
            "\n" +
            "        const tokens = tokenizeSentenceText(line);\n" +
            "        const lineClass = 'prompter-line' + (activePreset.isLineFocus ? ' line-focus-style' : '');\n" +
            "        html += '<div class=\"' + lineClass + '\" style=\"font-size:' + currentFontSize + 'px; color:' + currentTextColor + '; text-shadow:' + (currentThemeId === 'light_clean' ? 'none' : activePreset.textShadow) + '; font-weight:' + activePreset.fontWeight + '; line-height:' + activePreset.lineHeight + '; letter-spacing:' + activePreset.letterSpacing + ';\">';\n" +
            "        for (let token of tokens) {\n" +
            "          if (token.type === 'emphasis' || token.type === 'promo' || token.type === 'cta') {\n" +
            "            html += '<span class=\"highlight-word\" style=\"color:' + currentHighlightColor + ';\">' + escapeHtml(token.text) + ' </span>';\n" +
            "          } else if (token.type === 'pause-short') {\n" +
            "            html += '<span class=\"pause-short\" style=\"color:' + currentHighlightColor + ';\" title=\"Jeda Intonasi\">/ </span>';\n" +
            "          } else if (token.type === 'pause-long') {\n" +
            "            html += '<span class=\"pause-long\" style=\"color:' + currentHighlightColor + ';\" title=\"Jeda Intonasi Panjang\">// </span>';\n" +
            "          } else {\n" +
            "            html += '<span>' + escapeHtml(token.text) + ' </span>';\n" +
            "          }\n" +
            "        }\n" +
            "        html += '</div>';\n" +
            "      }\n" +
            "\n" +
            "      html += '<div style=\"height: 240px; display:flex; align-items:center; justify-content:center; color:#71717A; font-size:11px; font-weight:600;\">- Selesai Membaca -</div>';\n" +
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
            "                    '<span style=\"font-size:10px; font-weight:600; color:' + (isActive ? '#FEF08A' : '#D4D4D8') + ';\">' + p.name + '</span>' +\n" +
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
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function selectTheme(themeId) {\n" +
            "      currentThemeId = themeId;\n" +
            "      let bgRgb = '0, 0, 0';\n" +
            "      let textCol = '#FFFFFF';\n" +
            "      let hlCol = '#FACC15';\n" +
            "      let cardBg = '#18181B';\n" +
            "      let cardBorder = '#27272A';\n" +
            "      let cardText = '#FFFFFF';\n" +
            "      let dockBg = 'rgba(9, 9, 11, 0.96)';\n" +
            "      let dockBorder = '#27272A';\n" +
            "\n" +
            "      if (themeId === 'soft_comfort') {\n" +
            "        bgRgb = '24, 24, 27';\n" +
            "        textCol = '#FAF9F6';\n" +
            "        hlCol = '#34D399';\n" +
            "        cardBg = '#27272A';\n" +
            "        cardBorder = '#3F3F46';\n" +
            "        cardText = '#FAF9F6';\n" +
            "        dockBg = 'rgba(24, 24, 27, 0.96)';\n" +
            "        dockBorder = '#3F3F46';\n" +
            "      } else if (themeId === 'light_clean') {\n" +
            "        bgRgb = '255, 255, 255';\n" +
            "        textCol = '#18181B';\n" +
            "        hlCol = '#2563EB';\n" +
            "        cardBg = '#F4F4F5';\n" +
            "        cardBorder = '#E4E4E7';\n" +
            "        cardText = '#18181B';\n" +
            "        dockBg = 'rgba(244, 244, 245, 0.96)';\n" +
            "        dockBorder = '#E4E4E7';\n" +
            "      }\n" +
            "\n" +
            "      currentBgRgb = bgRgb;\n" +
            "      currentTextColor = textCol;\n" +
            "      currentHighlightColor = hlCol;\n" +
            "\n" +
            "      if (appContainer) {\n" +
            "        appContainer.style.backgroundColor = 'rgba(' + bgRgb + ',' + (currentOpacity / 100.0) + ')';\n" +
            "      }\n" +
            "      const focusLine = document.getElementById('focus-line');\n" +
            "      const focusBadge = document.getElementById('focus-badge');\n" +
            "      if (focusLine) focusLine.style.background = 'linear-gradient(90deg, ' + hlCol + 'cc, ' + hlCol + ', ' + hlCol + 'cc)';\n" +
            "      if (focusBadge) focusBadge.style.color = hlCol;\n" +
            "\n" +
            "      if (bottomDock) {\n" +
            "        bottomDock.style.background = dockBg;\n" +
            "        bottomDock.style.borderTopColor = dockBorder;\n" +
            "      }\n" +
            "\n" +
            "      renderThemeButtonsActive();\n" +
            "      parseAndRenderScript();\n" +
            "\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.saveTheme) {\n" +
            "        window.AndroidPrompterBridge.saveTheme(themeId, bgRgb, hlCol);\n" +
            "      }\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function renderThemeButtonsActive() {\n" +
            "      ['dark_pro', 'soft_comfort', 'light_clean'].forEach(id => {\n" +
            "        const b = document.getElementById('btn-theme-' + id);\n" +
            "        if (b) {\n" +
            "          b.className = 'pill-btn' + (currentThemeId === id ? ' active' : '');\n" +
            "        }\n" +
            "      });\n" +
            "    }\n" +
            "\n" +
            "    function saveAllSettings() {\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.savePrompterSettings) {\n" +
            "        window.AndroidPrompterBridge.savePrompterSettings(\n" +
            "          currentSpeed,\n" +
            "          currentFontSize,\n" +
            "          currentOpacity,\n" +
            "          currentThemeId,\n" +
            "          currentPresetId,\n" +
            "          currentRotation,\n" +
            "          isMirrored,\n" +
            "          showFocus,\n" +
            "          focusPercent,\n" +
            "          countdownSec\n" +
            "        );\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function scrollStep(timestamp) {\n" +
            "      if (!lastTimestamp) lastTimestamp = timestamp;\n" +
            "      const dt = timestamp - lastTimestamp;\n" +
            "      lastTimestamp = timestamp;\n" +
            "\n" +
            "      if (isPlaying && scrollContainer) {\n" +
            "        const pxPerSec = SPEED_PIXELS[Math.max(1, Math.min(10, currentSpeed)) - 1];\n" +
            "        const delta = (pxPerSec * dt) / 1000.0;\n" +
            "        scrollAccumulator += delta;\n" +
            "\n" +
            "        if (scrollAccumulator >= 0.5) {\n" +
            "          const scrollDelta = Math.floor(scrollAccumulator);\n" +
            "          scrollContainer.scrollTop += scrollDelta;\n" +
            "          scrollAccumulator -= scrollDelta;\n" +
            "\n" +
            "          const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;\n" +
            "          if (scrollContainer.scrollTop >= maxScroll - 2) {\n" +
            "            stopPlaying();\n" +
            "            return;\n" +
            "          }\n" +
            "        }\n" +
            "        scrollAnimId = requestAnimationFrame(scrollStep);\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function showTapPulse(type) {\n" +
            "      if (pulseIconPlay && pulseIconPause && tapFeedback) {\n" +
            "        pulseIconPlay.style.display = type === 'play' ? 'block' : 'none';\n" +
            "        pulseIconPause.style.display = type === 'pause' ? 'block' : 'none';\n" +
            "        tapFeedback.style.display = 'flex';\n" +
            "        setTimeout(() => { tapFeedback.style.display = 'none'; }, 400);\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function startPlaying() {\n" +
            "      isPlaying = true;\n" +
            "      heroIconPlay.style.display = 'none';\n" +
            "      heroIconPause.style.display = 'block';\n" +
            "      if (pillIconPlay && pillIconPause) {\n" +
            "        pillIconPlay.style.display = 'none';\n" +
            "        pillIconPause.style.display = 'block';\n" +
            "      }\n" +
            "      bottomDock.style.opacity = '0.35';\n" +
            "      bottomDock.style.pointerEvents = 'auto';\n" +
            "      settingsPanel.style.display = 'none';\n" +
            "      showTapPulse('play');\n" +
            "\n" +
            "      lastTimestamp = null;\n" +
            "      scrollAccumulator = 0;\n" +
            "      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);\n" +
            "      scrollAnimId = requestAnimationFrame(scrollStep);\n" +
            "    }\n" +
            "\n" +
            "    function stopPlaying() {\n" +
            "      isPlaying = false;\n" +
            "      heroIconPlay.style.display = 'block';\n" +
            "      heroIconPause.style.display = 'none';\n" +
            "      if (pillIconPlay && pillIconPause) {\n" +
            "        pillIconPlay.style.display = 'block';\n" +
            "        pillIconPause.style.display = 'none';\n" +
            "      }\n" +
            "      bottomDock.style.opacity = '1';\n" +
            "      bottomDock.style.pointerEvents = 'auto';\n" +
            "      showTapPulse('pause');\n" +
            "      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);\n" +
            "    }\n" +
            "\n" +
            "    function togglePlay() {\n" +
            "      if (isCountingDown) {\n" +
            "        isCountingDown = false;\n" +
            "        cdOverlay.style.display = 'none';\n" +
            "        startPlaying();\n" +
            "        return;\n" +
            "      }\n" +
            "      if (isPlaying) {\n" +
            "        stopPlaying();\n" +
            "      } else {\n" +
            "        if (countdownSec > 0 && scrollContainer.scrollTop < 10) {\n" +
            "          runCountdown();\n" +
            "        } else {\n" +
            "          startPlaying();\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function runCountdown() {\n" +
            "      isCountingDown = true;\n" +
            "      cdOverlay.style.display = 'flex';\n" +
            "      let count = countdownSec;\n" +
            "      cdNum.innerText = count;\n" +
            "\n" +
            "      const timer = setInterval(() => {\n" +
            "        count--;\n" +
            "        if (count > 0) {\n" +
            "          cdNum.innerText = count;\n" +
            "        } else {\n" +
            "          clearInterval(timer);\n" +
            "          isCountingDown = false;\n" +
            "          cdOverlay.style.display = 'none';\n" +
            "          startPlaying();\n" +
            "        }\n" +
            "      }, 1000);\n" +
            "    }\n" +
            "\n" +
            "    function skipCountdown(e) {\n" +
            "      e.stopPropagation();\n" +
            "      isCountingDown = false;\n" +
            "      cdOverlay.style.display = 'none';\n" +
            "      startPlaying();\n" +
            "    }\n" +
            "\n" +
            "    function handleScreenTap() {\n" +
            "      if (settingsPanel.style.display === 'flex') {\n" +
            "        settingsPanel.style.display = 'none';\n" +
            "        return;\n" +
            "      }\n" +
            "      togglePlay();\n" +
            "    }\n" +
            "\n" +
            "    function resetScroll() {\n" +
            "      if (scrollContainer) scrollContainer.scrollTop = 0;\n" +
            "      scrollAccumulator = 0;\n" +
            "      stopPlaying();\n" +
            "    }\n" +
            "\n" +
            "    function changeSpeed(delta) {\n" +
            "      currentSpeed = Math.max(1, Math.min(10, currentSpeed + delta));\n" +
            "      document.getElementById('speed-stepper-label').innerText = currentSpeed + 'x';\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function rotatePrompter() {\n" +
            "      currentRotation = (currentRotation + 90) % 360;\n" +
            "      const badge = document.getElementById('rot-badge');\n" +
            "      const rotLabel = document.getElementById('panel-rot-label');\n" +
            "      if (currentRotation !== 0) {\n" +
            "        badge.style.display = 'inline-block';\n" +
            "        badge.innerText = currentRotation + '°';\n" +
            "      } else {\n" +
            "        badge.style.display = 'none';\n" +
            "      }\n" +
            "      if (rotLabel) rotLabel.innerText = 'Rotasi: ' + currentRotation + '°';\n" +
            "\n" +
            "      // Rotasikan seluruh orientasi jendela teleprompter via bridge ke Android WindowManager\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.setPrompterRotation) {\n" +
            "        window.AndroidPrompterBridge.setPrompterRotation(currentRotation);\n" +
            "      }\n" +
            "      if (currentRotation === 180) {\n" +
            "        appContainer.style.transform = 'rotate(180deg)';\n" +
            "      } else {\n" +
            "        appContainer.style.transform = 'none';\n" +
            "      }\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function updateResponsiveDock() {\n" +
            "      var w = window.innerWidth || document.documentElement.clientWidth;\n" +
            "      var targetBtnSize = Math.floor((w - 20) / 10.6);\n" +
            "      var btnSize = Math.max(16, Math.min(30, targetBtnSize));\n" +
            "      var iconSize = Math.max(8, Math.min(14, Math.floor(btnSize * 0.48)));\n" +
            "      document.documentElement.style.setProperty('--dock-btn-size', btnSize + 'px');\n" +
            "      document.documentElement.style.setProperty('--dock-icon-size', iconSize + 'px');\n" +
            "      var dockEl = document.getElementById('bottom-dock');\n" +
            "      if (dockEl) dockEl.style.height = (btnSize + 8) + 'px';\n" +
            "    }\n" +
            "    window.addEventListener('resize', updateResponsiveDock);\n" +
            "    window.addEventListener('orientationchange', updateResponsiveDock);\n" +
            "    setTimeout(updateResponsiveDock, 50);\n" +
            "\n" +
            "    function cycleMovePosition() {\n" +
            "      if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.cyclePosition) {\n" +
            "        window.AndroidPrompterBridge.cyclePosition();\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    // Setup fitur tombol geser interaktif (drag touch bebas ke segala arah)\n" +
            "    function setupMoveButtonDrag() {\n" +
            "      const moveBtn = document.getElementById('move-btn');\n" +
            "      if (!moveBtn) return;\n" +
            "\n" +
            "      let isMoveDragging = false;\n" +
            "      let startTouchX = 0;\n" +
            "      let startTouchY = 0;\n" +
            "      let totalDelta = 0;\n" +
            "\n" +
            "      moveBtn.addEventListener('touchstart', function(e) {\n" +
            "        if (e.touches && e.touches.length > 0) {\n" +
            "          isMoveDragging = true;\n" +
            "          totalDelta = 0;\n" +
            "          startTouchX = e.touches[0].screenX;\n" +
            "          startTouchY = e.touches[0].screenY;\n" +
            "          e.preventDefault();\n" +
            "          e.stopPropagation();\n" +
            "        }\n" +
            "      }, { passive: false });\n" +
            "\n" +
            "      moveBtn.addEventListener('touchmove', function(e) {\n" +
            "        if (!isMoveDragging || !e.touches || e.touches.length === 0) return;\n" +
            "        const curX = e.touches[0].screenX;\n" +
            "        const curY = e.touches[0].screenY;\n" +
            "        const dx = Math.round(curX - startTouchX);\n" +
            "        const dy = Math.round(curY - startTouchY);\n" +
            "        totalDelta += Math.abs(dx) + Math.abs(dy);\n" +
            "\n" +
            "        if (dx !== 0 || dy !== 0) {\n" +
            "          startTouchX = curX;\n" +
            "          startTouchY = curY;\n" +
            "          if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.moveDelta) {\n" +
            "            window.AndroidPrompterBridge.moveDelta(dx, dy);\n" +
            "          }\n" +
            "        }\n" +
            "        e.preventDefault();\n" +
            "        e.stopPropagation();\n" +
            "      }, { passive: false });\n" +
            "\n" +
            "      moveBtn.addEventListener('touchend', function(e) {\n" +
            "        if (isMoveDragging) {\n" +
            "          isMoveDragging = false;\n" +
            "          if (totalDelta < 6) {\n" +
            "            // Ketukan tanpa geser: pindahkan posisi (Atas, Tengah, Bawah)\n" +
            "            cycleMovePosition();\n" +
            "          } else {\n" +
            "            if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.saveCurrentPosition) {\n" +
            "              window.AndroidPrompterBridge.saveCurrentPosition();\n" +
            "            }\n" +
            "          }\n" +
            "          e.preventDefault();\n" +
            "          e.stopPropagation();\n" +
            "        }\n" +
            "      }, { passive: false });\n" +
            "    }\n" +
            "\n" +
            "    function toggleMinimize() {\n" +
            "      isMinimized = !isMinimized;\n" +
            "      if (isMinimized) {\n" +
            "        appContainer.style.display = 'none';\n" +
            "        minimizedPill.style.display = 'flex';\n" +
            "        if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.setMinimized) {\n" +
            "          window.AndroidPrompterBridge.setMinimized(true);\n" +
            "        }\n" +
            "      } else {\n" +
            "        minimizedPill.style.display = 'none';\n" +
            "        appContainer.style.display = 'flex';\n" +
            "        if (window.AndroidPrompterBridge && window.AndroidPrompterBridge.setMinimized) {\n" +
            "          window.AndroidPrompterBridge.setMinimized(false);\n" +
            "        }\n" +
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
            "    function toggleSettings() {\n" +
            "      if (settingsPanel.style.display === 'flex') {\n" +
            "        settingsPanel.style.display = 'none';\n" +
            "      } else {\n" +
            "        settingsPanel.style.display = 'flex';\n" +
            "      }\n" +
            "    }\n" +
            "\n" +
            "    function switchTab(tabId) {\n" +
            "      document.getElementById('tab-teks').className = 'tab-item' + (tabId === 'teks' ? ' active' : '');\n" +
            "      document.getElementById('tab-countdown').className = 'tab-item' + (tabId === 'countdown' ? ' active' : '');\n" +
            "      document.getElementById('tab-layar').className = 'tab-item' + (tabId === 'layar' ? ' active' : '');\n" +
            "\n" +
            "      document.getElementById('panel-teks').style.display = tabId === 'teks' ? 'flex' : 'none';\n" +
            "      document.getElementById('panel-countdown').style.display = tabId === 'countdown' ? 'flex' : 'none';\n" +
            "      document.getElementById('panel-layar').style.display = tabId === 'layar' ? 'flex' : 'none';\n" +
            "    }\n" +
            "\n" +
            "    function updateFontSize(val) {\n" +
            "      currentFontSize = Number(val);\n" +
            "      document.getElementById('font-label').innerText = currentFontSize + 'px';\n" +
            "      parseAndRenderScript();\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function toggleCountdownEnabled() {\n" +
            "      countdownSec = countdownSec > 0 ? 0 : 3;\n" +
            "      const btn = document.getElementById('cd-toggle-btn');\n" +
            "      btn.innerText = countdownSec > 0 ? 'Aktif' : 'Nonaktif';\n" +
            "      btn.className = 'pill-btn ' + (countdownSec > 0 ? 'active' : '');\n" +
            "      document.getElementById('cd-label').innerText = countdownSec > 0 ? countdownSec + ' Detik' : 'Langsung';\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function setCd(sec) {\n" +
            "      countdownSec = sec;\n" +
            "      const btn = document.getElementById('cd-toggle-btn');\n" +
            "      btn.innerText = countdownSec > 0 ? 'Aktif' : 'Nonaktif';\n" +
            "      btn.className = 'pill-btn ' + (countdownSec > 0 ? 'active' : '');\n" +
            "      document.getElementById('cd-label').innerText = countdownSec > 0 ? countdownSec + ' Detik' : 'Langsung';\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function updateOpacity(val) {\n" +
            "      currentOpacity = Number(val);\n" +
            "      document.getElementById('op-label').innerText = currentOpacity + '%';\n" +
            "      if (appContainer) {\n" +
            "        appContainer.style.backgroundColor = 'rgba(' + currentBgRgb + ',' + (currentOpacity / 100.0) + ')';\n" +
            "      }\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function toggleFocusGuide() {\n" +
            "      showFocus = !showFocus;\n" +
            "      document.getElementById('focus-guide').style.display = showFocus ? 'flex' : 'none';\n" +
            "      const btn = document.getElementById('guide-toggle-btn');\n" +
            "      btn.innerText = showFocus ? 'Aktif' : 'Off';\n" +
            "      btn.className = 'pill-btn ' + (showFocus ? 'active' : '');\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function updateFocusPercent(val) {\n" +
            "      focusPercent = Number(val);\n" +
            "      const guide = document.getElementById('focus-guide');\n" +
            "      guide.style.top = focusPercent + '%';\n" +
            "      document.getElementById('focus-badge').innerText = focusPercent + '%';\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    function toggleMirror() {\n" +
            "      isMirrored = !isMirrored;\n" +
            "      scriptContent.style.transform = isMirrored ? 'scaleX(-1)' : 'none';\n" +
            "      saveAllSettings();\n" +
            "    }\n" +
            "\n" +
            "    // Booting Initialization\n" +
            "    renderThemeButtonsActive();\n" +
            "    renderPresetsList();\n" +
            "    parseAndRenderScript();\n" +
            "    setupMoveButtonDrag();\n" +
            "    updateResponsiveDock();\n" +
            "  </script>\n" +
            "</body>\n" +
            "</html>";
    }
}
