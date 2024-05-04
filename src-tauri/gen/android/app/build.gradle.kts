import com.android.build.gradle.internal.api.BaseVariantOutputImpl
import com.google.gson.Gson
import java.io.File
import java.nio.file.Paths
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

data class Package(val name: String, val version: String, val description: String)

val path = Paths.get("../package.json").normalize()
val file = File(path.toString())
val json = file.readText(Charsets.UTF_8)

val pkg = Gson().fromJson(json, Package::class.java)

val tauri =
    Properties().apply {
        val file = file("tauri.properties")
        if (file.exists()) {
            file.inputStream().use { load(it) }
        }
    }

// Load your keystore.properties file into the keystoreProperties object.
val keys =
    Properties().apply {
        val file = file("key.properties")
        if (file.exists()) {
            file.inputStream().use { load(it) }
        }
    }

android {
    compileSdk = 34
    namespace = "com.${pkg.name}.dev"
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "com.${pkg.name}.dev"
        minSdk = 24
        targetSdk = 34
        versionCode = tauri.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauri.getProperty("tauri.android.versionName", "1.0")
    }
    applicationVariants.all {
        val variant = this
        
        val build = variant.buildType.name
        var name = "${pkg.name}-${variant.versionName}-${variant.flavorName}"

        when (build) {
            "release" -> {
                // No change needed for release build
            }
            else -> {
                name = "$name-$build"
            }
        }

        variant.outputs.map { it as BaseVariantOutputImpl }.forEach { output ->
            val file = output.outputFile

            val filename =
                when {
                    file.name.endsWith(".apk") -> "$name.apk"
                    else -> file.name
                }

            output.outputFileName = filename
        }
    }
    signingConfigs {
        create("release") {
            keyAlias = keys["keyAlias"] as String
            keyPassword = keys["keyPassword"] as String
            storePassword = keys["storePassword"] as String
            storeFile = file(keys["storeFile"] as String)
        }
    }
    buildTypes {
        getByName("debug") {
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false

            packaging {
                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true

            signingConfig = signingConfigs.getByName("release")

            proguardFiles(
                *fileTree(".") { include("**/*.pro") }
                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))
                    .toList()
                    .toTypedArray()
            )
        }
    }
    kotlinOptions { jvmTarget = "1.8" }
}

rust { rootDirRel = "../../../" }

dependencies {
    implementation("androidx.webkit:webkit:1.6.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("com.google.android.material:material:1.8.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")
