plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "com.example.ttlockwatch"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.example.ttlockwatch"   // debe ser igual en mobile y wear
        minSdk = 26; targetSdk = 34; versionCode = 1; versionName = "1.0"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation("com.google.android.gms:play-services-wearable:18.2.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    // SDK de TTLock: descarga el AAR en open.ttlock.com y colócalo en mobile/libs/
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.aar", "*.jar"))))
}
