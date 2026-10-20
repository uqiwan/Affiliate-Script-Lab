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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.core.app.NotificationCompat;

public class FloatingPrompterService extends Service {
    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private Handler scrollHandler;
    private boolean isPlaying = false;
    private int scrollSpeed = 3;
    private ScrollView scrollView;
    private LinearLayout bottomLayout;

    private static final String CHANNEL_ID = "floating_prompter_channel";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundServiceNotification();

        String scriptText = intent != null ? intent.getStringExtra("scriptText") : "Skrip Teleprompter Siap Rekam...";
        int speed = intent != null ? intent.getIntExtra("speed", 4) : 4;
        int fontSize = intent != null ? intent.getIntExtra("fontSize", 18) : 18;
        this.scrollSpeed = Math.max(1, speed);

        initFloatingView(scriptText, Math.max(7, fontSize));
        return START_NOT_STICKY;
    }

    private void startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Teleprompter Melayang Aktif",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Teleprompter Melayang Aktif")
            .setContentText("Prompter sedang melayang di atas aplikasi lain.")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .build();

        startForeground(1001, notification);
    }

    private void initFloatingView(String scriptText, int fontSize) {
        if (floatingView != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 40;
        params.y = 80;
        params.width = 650;
        params.height = 700;

        // Container utama widget melayang (Opasitas latar belakang 85%)
        LinearLayout rootLayout = new LinearLayout(this);
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setBackgroundColor(Color.parseColor("#D9000000")); // Hitam 85%
        rootLayout.setPadding(12, 4, 12, 12);

        // Strip drag handle tipis di paling atas (tanpa jeda, menempel di kamera)
        View topDragHandle = new View(this);
        LinearLayout.LayoutParams dragParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            16
        );
        topDragHandle.setLayoutParams(dragParams);
        topDragHandle.setBackgroundColor(Color.parseColor("#40F59E0B"));

        // ScrollView isi skrip (dimulai langsung di atas dekat kamera)
        scrollView = new ScrollView(this);
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1.0f
        );
        scrollView.setLayoutParams(scrollParams);

        TextView textContent = new TextView(this);
        textContent.setText(scriptText);
        textContent.setTextColor(Color.parseColor("#FEF08A")); // Kuning cerah subtitle
        textContent.setTextSize(Math.max(7, fontSize));
        textContent.setPadding(8, 4, 8, 120);
        textContent.setShadowLayer(4f, 2f, 2f, Color.BLACK);
        scrollView.addView(textContent);

        // Kontrol di BAGIAN BAWAH (Requirement 2 & 9)
        bottomLayout = new LinearLayout(this);
        bottomLayout.setOrientation(LinearLayout.HORIZONTAL);
        bottomLayout.setBackgroundColor(Color.parseColor("#F2111827"));
        bottomLayout.setPadding(12, 10, 12, 10);
        bottomLayout.setGravity(Gravity.CENTER_VERTICAL);

        Button resetBtn = new Button(this);
        resetBtn.setText("↺");
        resetBtn.setTextColor(Color.WHITE);
        resetBtn.setBackgroundColor(Color.parseColor("#374151"));

        Button playBtn = new Button(this);
        playBtn.setText("▶ Mulai");
        playBtn.setTextColor(Color.BLACK);
        playBtn.setBackgroundColor(Color.parseColor("#F59E0B"));
        LinearLayout.LayoutParams playParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        playParams.setMargins(8, 0, 8, 0);
        playBtn.setLayoutParams(playParams);

        Button closeBtn = new Button(this);
        closeBtn.setText("✕");
        closeBtn.setTextColor(Color.WHITE);
        closeBtn.setBackgroundColor(Color.parseColor("#DC2626"));

        bottomLayout.addView(resetBtn);
        bottomLayout.addView(playBtn);
        bottomLayout.addView(closeBtn);

        // Susun urutan: Drag handle tipis -> Teks scroll (Atas) -> Kontrol (Bawah)
        rootLayout.addView(topDragHandle);
        rootLayout.addView(scrollView);
        rootLayout.addView(bottomLayout);

        floatingView = rootLayout;

        // Touch listener untuk dragging widget via drag handle
        View.OnTouchListener dragListener = new View.OnTouchListener() {
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
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(floatingView, params);
                        return true;
                }
                return false;
            }
        };

        topDragHandle.setOnTouchListener(dragListener);

        // Animasi auto-scroll
        scrollHandler = new Handler(Looper.getMainLooper());
        final Runnable scrollRunnable = new Runnable() {
            @Override
            public void run() {
                if (isPlaying && scrollView != null) {
                    scrollView.smoothScrollBy(0, scrollSpeed);
                    scrollHandler.postDelayed(this, 50);
                }
            }
        };

        // Fungsi toggle play/pause
        final Runnable togglePlayPause = () -> {
            isPlaying = !isPlaying;
            if (isPlaying) {
                playBtn.setText("❚❚ Jeda");
                playBtn.setBackgroundColor(Color.parseColor("#EF4444"));
                playBtn.setTextColor(Color.WHITE);
                scrollHandler.post(scrollRunnable);
                // Sembunyikan kontrol saat teks jalan (Requirement 5)
                bottomLayout.setVisibility(View.GONE);
            } else {
                playBtn.setText("▶ Mulai");
                playBtn.setBackgroundColor(Color.parseColor("#F59E0B"));
                playBtn.setTextColor(Color.BLACK);
                scrollHandler.removeCallbacks(scrollRunnable);
                // Munculkan kembali kontrol saat di-pause (Requirement 5)
                bottomLayout.setVisibility(View.VISIBLE);
            }
        };

        playBtn.setOnClickListener(v -> togglePlayPause.run());

        // Tap layar untuk Mulai / Jeda (Requirement 4 & 5)
        textContent.setOnClickListener(v -> togglePlayPause.run());
        scrollView.setOnClickListener(v -> togglePlayPause.run());

        resetBtn.setOnClickListener(v -> {
            isPlaying = false;
            scrollHandler.removeCallbacks(scrollRunnable);
            playBtn.setText("▶ Mulai");
            playBtn.setBackgroundColor(Color.parseColor("#F59E0B"));
            playBtn.setTextColor(Color.BLACK);
            bottomLayout.setVisibility(View.VISIBLE);
            if (scrollView != null) {
                scrollView.scrollTo(0, 0);
            }
        });

        closeBtn.setOnClickListener(v -> stopSelf());

        windowManager.addView(floatingView, params);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isPlaying = false;
        if (scrollHandler != null) {
            scrollHandler.removeCallbacksAndMessages(null);
        }
        if (floatingView != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }
    }
}
