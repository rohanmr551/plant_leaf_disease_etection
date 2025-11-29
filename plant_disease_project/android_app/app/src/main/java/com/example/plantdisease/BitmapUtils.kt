package com.example.plantdisease

import android.content.Context
import android.content.res.Configuration
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import java.util.Locale
import kotlin.math.min

fun Bitmap.centerCropSquare(): Bitmap {
    val size = min(width, height)
    val offsetX = (width - size) / 2
    val offsetY = (height - size) / 2
    return Bitmap.createBitmap(this, offsetX, offsetY, size, size)
}

fun Bitmap.preprocessForModel(targetSize: Int = 224): Bitmap {
    val cropped = centerCropSquare()
    return Bitmap.createScaledBitmap(cropped, targetSize, targetSize, true)
}

fun Context.loadBitmapFromUri(uri: Uri): Bitmap {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        val source = ImageDecoder.createSource(contentResolver, uri)
        ImageDecoder.decodeBitmap(source)
    } else {
        @Suppress("DEPRECATION")
        MediaStore.Images.Media.getBitmap(contentResolver, uri)
    }
}

fun Context.localizedResources(languageCode: String): Resources {
    val config = Configuration(resources.configuration)
    val locale = Locale(languageCode)
    Locale.setDefault(locale)
    config.setLocale(locale)
    return createConfigurationContext(config).resources
}
