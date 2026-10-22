#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Gagaswara Teleprompter - Automated Android Native Sync & Patch Script
 *
 * This script ensures that whenever `npx cap sync android` or `npx cap add android`
 * is executed, all crucial native Android features are preserved and injected:
 * 1. FloatingPrompterService.java (Native floating window over TikTok/Camera)
 * 2. MainActivity.java (JavaScript bridge & auto-minimize to background)
 * 3. AndroidManifest.xml (SYSTEM_ALERT_WINDOW, FOREGROUND_SERVICE, Android 14 FGS property)
 * 4. gradlew & wrapper permissions (Eliminates "No such file or directory" error)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const androidDir = path.join(rootDir, 'android');
const appDir = path.join(androidDir, 'app');
const mainDir = path.join(appDir, 'src', 'main');
const javaPkgDir = path.join(mainDir, 'java', 'com', 'manuskrip', 'affiliatescript');
const manifestPath = path.join(mainDir, 'AndroidManifest.xml');
const templatesDir = path.join(__dirname, 'android-templates');

console.log('----------------------------------------------------');
console.log('🤖 Gagaswara Teleprompter: Android Native Sync Hook');
console.log('----------------------------------------------------');

if (!fs.existsSync(androidDir)) {
  console.log('ℹ️  Direktori android/ belum dibuat. Jalankan "npx cap add android" terlebih dahulu.');
  process.exit(0);
}

// 1. Ensure target Java package directory exists
if (!fs.existsSync(javaPkgDir)) {
  fs.mkdirSync(javaPkgDir, { recursive: true });
}

// 2. Ensure scripts/android-templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// 3. Synchronize FloatingPrompterService.java
const serviceDestPath = path.join(javaPkgDir, 'FloatingPrompterService.java');
const serviceTmplPath = path.join(templatesDir, 'FloatingPrompterService.java');

if (fs.existsSync(serviceTmplPath)) {
  fs.copyFileSync(serviceTmplPath, serviceDestPath);
  console.log('✅ FloatingPrompterService.java disinkronkan dari template.');
} else if (fs.existsSync(serviceDestPath)) {
  fs.copyFileSync(serviceDestPath, serviceTmplPath);
  console.log('💾 FloatingPrompterService.java dicadangkan ke template.');
} else {
  console.warn('⚠️ FloatingPrompterService.java tidak ditemukan di template maupun target!');
}

// 4. Synchronize MainActivity.java
const mainActivityDestPath = path.join(javaPkgDir, 'MainActivity.java');
const mainActivityTmplPath = path.join(templatesDir, 'MainActivity.java');

if (fs.existsSync(mainActivityTmplPath)) {
  fs.copyFileSync(mainActivityTmplPath, mainActivityDestPath);
  console.log('✅ MainActivity.java disinkronkan dari template (dengan AndroidFloatingBridge).');
} else if (fs.existsSync(mainActivityDestPath)) {
  fs.copyFileSync(mainActivityDestPath, mainActivityTmplPath);
  console.log('💾 MainActivity.java dicadangkan ke template.');
}

// 5. Patch AndroidManifest.xml
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  // Verify and inject required permissions
  const requiredPermissions = [
    '<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />',
    '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
    '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />',
    '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
    '<uses-permission android:name="android.permission.WAKE_LOCK" />',
  ];

  let addedPermissions = 0;
  for (const perm of requiredPermissions) {
    if (!manifest.includes(perm)) {
      manifest = manifest.replace(
        '<application',
        `    ${perm}\n    <application`
      );
      addedPermissions++;
    }
  }

  // Verify and inject FloatingPrompterService with Android 14 specialUse subtype property
  const serviceSnippet = `
        <!-- Layanan Native Floating Window (Always on Top di Android) -->
        <service
            android:name=".FloatingPrompterService"
            android:enabled="true"
            android:exported="false"
            android:stopWithTask="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating teleprompter window over camera and other apps" />
        </service>`;

  if (!manifest.includes('FloatingPrompterService')) {
    manifest = manifest.replace('</application>', `${serviceSnippet}\n    </application>`);
    console.log('✅ Layanan FloatingPrompterService diinjeksikan ke AndroidManifest.xml.');
  } else if (!manifest.includes('PROPERTY_SPECIAL_USE_FGS_SUBTYPE')) {
    // Upgrade existing service tag with Android 14 property
    manifest = manifest.replace(
      /<service[\s\S]*?FloatingPrompterService[\s\S]*?(\/>|<\/service>)/,
      serviceSnippet.trim()
    );
    console.log('✅ Ditambahkan PROPERTY_SPECIAL_USE_FGS_SUBTYPE untuk Android 14+ di AndroidManifest.xml.');
  }

  // Ensure usesCleartextTraffic is true for local communication
  if (!manifest.includes('android:usesCleartextTraffic="true"')) {
    manifest = manifest.replace('<application', '<application\n        android:usesCleartextTraffic="true"');
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✅ AndroidManifest.xml diperbarui dengan izin melayang & latar belakang.');
}

// 6. Ensure gradlew wrapper exists and is executable
const gradlewPath = path.join(androidDir, 'gradlew');
if (fs.existsSync(gradlewPath)) {
  try {
    fs.chmodSync(gradlewPath, 0o755);
    console.log('✅ Izin eksekusi gradlew dipastikan aktif (chmod +x).');
  } catch (err) {
    console.warn('ℹ️  Tidak dapat mengubah izin gradlew:', err.message);
  }
}

// Ensure gradle-wrapper.properties and gradle-wrapper.jar exist
const wrapperPropsDir = path.join(androidDir, 'gradle', 'wrapper');
const wrapperPropsPath = path.join(wrapperPropsDir, 'gradle-wrapper.properties');
const wrapperJarPath = path.join(wrapperPropsDir, 'gradle-wrapper.jar');
const templateJarPath = path.join(templatesDir, 'gradle-wrapper.jar');

if (!fs.existsSync(wrapperPropsDir)) {
  fs.mkdirSync(wrapperPropsDir, { recursive: true });
}

if (!fs.existsSync(wrapperPropsPath)) {
  const defaultProps = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  fs.writeFileSync(wrapperPropsPath, defaultProps, 'utf8');
  console.log('✅ gradle-wrapper.properties dibuat otomatis.');
}

// Synchronize gradle-wrapper.jar
if (!fs.existsSync(wrapperJarPath)) {
  if (fs.existsSync(templateJarPath)) {
    fs.copyFileSync(templateJarPath, wrapperJarPath);
    console.log('✅ gradle-wrapper.jar disinkronkan dari template.');
  } else {
    console.log('⏳ Mendownload gradle-wrapper.jar resmi...');
    try {
      const res = await fetch('https://raw.githubusercontent.com/gradle/gradle/v8.4.0/gradle/wrapper/gradle-wrapper.jar');
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(wrapperJarPath, buffer);
        fs.writeFileSync(templateJarPath, buffer);
        console.log('✅ gradle-wrapper.jar berhasil diunduh dan dipasang.');
      }
    } catch (err) {
      console.warn('⚠️ Gagal mengunduh gradle-wrapper.jar secara otomatis:', err.message);
    }
  }
} else if (!fs.existsSync(templateJarPath)) {
  fs.copyFileSync(wrapperJarPath, templateJarPath);
  console.log('💾 gradle-wrapper.jar dicadangkan ke template.');
}

// Auto-detect Android SDK location and configure local.properties if missing
const localPropsPath = path.join(androidDir, 'local.properties');
if (!fs.existsSync(localPropsPath)) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const possibleSdkPaths = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    homeDir ? path.join(homeDir, 'Library', 'Android', 'sdk') : null, // macOS default
    homeDir ? path.join(homeDir, 'Android', 'Sdk') : null, // Linux default
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null, // Windows default
    '/opt/homebrew/share/android-commandlinetools',
    '/usr/local/share/android-sdk'
  ].filter(Boolean);

  let detectedSdk = null;
  for (const candidate of possibleSdkPaths) {
    if (typeof candidate === 'string' && fs.existsSync(candidate)) {
      detectedSdk = candidate;
      break;
    }
  }

  if (detectedSdk) {
    const formattedPath = detectedSdk.replace(/\\/g, '/');
    fs.writeFileSync(
      localPropsPath,
      `## Auto-generated by Gagaswara build script\nsdk.dir=${formattedPath}\n`,
      'utf8'
    );
    console.log(`✅ File android/local.properties dibuat otomatis (SDK: ${detectedSdk}).`);
  }
}

// 7. Synchronize Gagaswara app launcher icons
const templateResDir = path.join(templatesDir, 'res');
const androidResDir = path.join(mainDir, 'res');
if (fs.existsSync(templateResDir)) {
  const folders = fs.readdirSync(templateResDir);
  for (const folder of folders) {
    const srcF = path.join(templateResDir, folder);
    const destF = path.join(androidResDir, folder);
    if (fs.statSync(srcF).isDirectory()) {
      if (!fs.existsSync(destF)) fs.mkdirSync(destF, { recursive: true });
      const files = fs.readdirSync(srcF);
      for (const file of files) {
        fs.copyFileSync(path.join(srcF, file), path.join(destF, file));
      }
    }
  }
  console.log('✅ Ikon launcher Android (Gagaswara) disinkronkan ke android/app/src/main/res.');
}

console.log('🎉 Integrasi native Android selesai! Proyek siap dibangun menjadi APK.');
console.log('----------------------------------------------------');

