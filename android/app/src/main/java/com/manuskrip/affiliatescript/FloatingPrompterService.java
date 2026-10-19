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

    private static final String CHANNEL_ID = "floating_prompter_channel";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundServiceNotification();

        String scriptText = intent != null ? intent.getStringExtra("scriptText") : "Skrip Affiliator Siap Rekam...";
        int speed = intent != null ? intent.getIntExtra("speed", 4) : 4;
        int fontSize = intent != null ? intent.getIntExtra("fontSize", 20) : 20;
        this.scrollSpeed = Math.max(1, speed);

        initFloatingView(scriptText, fontSize);
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
        params.x = 80;
        params.y = 120;
        params.width = 650;
        params.height = 700;

        // Container utama widget melayang
        LinearLayout rootLayout = new LinearLayout(this);
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setBackgroundColor(Color.parseColor("#E6000000")); // Hitam 90%
        rootLayout.setPadding(16, 12, 16, 12);

        // Header Drag Handle
        LinearLayout headerLayout = new LinearLayout(this);
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        headerLayout.setBackgroundColor(Color.parseColor("#333333"));
        headerLayout.setPadding(12, 8, 12, 8);

        TextView title = new TextView(this);
        title.setText("⠿ Teleprompter Melayang");
        title.setTextColor(Color.parseColor("#F59E0B"));
        title.setTextSize(12);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        title.setLayoutParams(titleParams);

        Button playBtn = new Button(this);
        playBtn.setText("▶");
        playBtn.setTextColor(Color.WHITE);
        playBtn.setBackgroundColor(Color.parseColor("#059669"));

        Button closeBtn = new Button(this);
        closeBtn.setText("✕");
        closeBtn.setTextColor(Color.WHITE);
        closeBtn.setBackgroundColor(Color.parseColor("#DC2626"));

        headerLayout.addView(title);
        headerLayout.addView(playBtn);
        headerLayout.addView(closeBtn);

        // Scrollview isi skrip
        scrollView = new ScrollView(this);
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1.0f
        );
        scrollView.setLayoutParams(scrollParams);

        TextView textContent = new TextView(this);
        textContent.setText(scriptText);
        textContent.setTextColor(Color.WHITE);
        textContent.setTextSize(fontSize);
        textContent.setPadding(8, 16, 8, 30);
        scrollView.addView(textContent);

        rootLayout.addView(headerLayout);
        rootLayout.addView(scrollView);

        floatingView = rootLayout;

        // Touch listener untuk dragging widget
        headerLayout.setOnTouchListener(new View.OnTouchListener() {
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
        });

        // Kontrol Play / Pause
        scrollHandler = new Handler(Looper.getMainLooper());
        final Runnable scrollRunnable = new Runnable() {
            @Override
            public void run() {
                if (isPlaying && scrollView != null) {
                    scrollView.smoothScrollBy(0, scrollSpeed);
                    scrollHandler.postDelayed(this, 60);
                }
            }
        };

        playBtn.setOnClickListener(v -> {
            isPlaying = !isPlaying;
            if (isPlaying) {
                playBtn.setText("❚❚");
                playBtn.setBackgroundColor(Color.parseColor("#D97706"));
                scrollHandler.post(scrollRunnable);
            } else {
                playBtn.setText("▶");
                playBtn.setBackgroundColor(Color.parseColor("#059669"));
                scrollHandler.removeCallbacks(scrollRunnable);
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
