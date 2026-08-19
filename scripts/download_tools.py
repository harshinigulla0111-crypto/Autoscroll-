import os
import urllib.request
import zipfile
import io

import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

TOOLS_DIR = os.path.join(os.path.dirname(__file__), "tools")
os.makedirs(TOOLS_DIR, exist_ok=True)

AAPT2_EXE = os.path.join(TOOLS_DIR, "aapt2.exe")
R8_JAR = os.path.join(TOOLS_DIR, "r8.jar")
ANDROID_JAR = os.path.join(TOOLS_DIR, "android.jar")

def download_file(url, target_path, desc):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"[+] {desc} already exists ({os.path.getsize(target_path)} bytes).")
        return
    print(f"[*] Downloading {desc} from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with open(target_path, "wb") as f:
        f.write(data)
    print(f"[+] Saved {desc} ({len(data)} bytes).")

def download_aapt2():
    if os.path.exists(AAPT2_EXE):
        print(f"[+] aapt2.exe already exists.")
        return
    url = "https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/8.2.2-10154469/aapt2-8.2.2-10154469-windows.jar"
    print(f"[*] Downloading aapt2.exe from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        z.extract("aapt2.exe", TOOLS_DIR)
    print(f"[+] Extracted aapt2.exe to {AAPT2_EXE}")

if __name__ == "__main__":
    download_aapt2()
    download_file("https://dl.google.com/dl/android/maven2/com/android/tools/r8/8.2.42/r8-8.2.42.jar", R8_JAR, "R8/D8 Compiler Jar")
    
    # Try reliable android.jar mirrors
    urls = [
        "https://raw.githubusercontent.com/S-N-H/Android-SDK-JARs/main/android-33/android.jar",
        "https://raw.githubusercontent.com/alexey-pelykh/android-sdk-android-30/master/android.jar",
        "https://raw.githubusercontent.com/iBotPeaches/Apktool/master/brut.apktool/apktool-lib/src/main/resources/prebuilt/android-30.jar"
    ]
    for url in urls:
        try:
            download_file(url, ANDROID_JAR, "Android SDK Platform Jar")
            if os.path.exists(ANDROID_JAR) and os.path.getsize(ANDROID_JAR) > 100000:
                break
        except Exception as e:
            print(f"Notice: Mirror {url} failed: {e}")

