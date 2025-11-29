package com.example.plantdisease

import android.net.Uri
import android.os.Bundle
import android.content.res.Resources
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.res.stringResource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    private lateinit var classifier: TFLitePlantDiseaseClassifier

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        classifier = TFLitePlantDiseaseClassifier(this)
        setContent {
            MaterialTheme {
                PlantDoctorScreen(classifier = classifier)
            }
        }
    }

    override fun onDestroy() {
        classifier.close()
        super.onDestroy()
    }
}

enum class SupportedLanguage(val code: String, val labelRes: Int) {
    EN("en", R.string.lang_en),
    HI("hi", R.string.lang_local),
}

@Composable
fun PlantDoctorScreen(classifier: TFLitePlantDiseaseClassifier) {
    val context = LocalContext.current
    var selectedLanguage by remember { mutableStateOf(SupportedLanguage.EN) }
    var selectedCropIndex by remember { mutableStateOf(0) }
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var diagnosisResult by remember { mutableStateOf<DiagnosisResult?>(null) }
    var isDiagnosing by remember { mutableStateOf(false) }
    val localizedResources = remember(selectedLanguage) {
        context.localizedResources(selectedLanguage.code)
    }
    val cropOptions = localizedResources.getStringArray(R.array.crop_options)
    val diseaseLabels = localizedResources.getStringArray(R.array.disease_labels)
    val severityLabels = localizedResources.getStringArray(R.array.severity_labels)

    val imageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        imageUri = uri
    }

    val scope = rememberCoroutineScope()
    val bitmapState = remember { mutableStateOf<android.graphics.Bitmap?>(null) }

    LaunchedEffect(imageUri) {
        bitmapState.value = imageUri?.let { context.loadBitmapFromUri(it) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        LanguageSelector(
            selected = selectedLanguage,
            onLanguageSelected = { selectedLanguage = it },
            localizedResources = localizedResources
        )

        CropDropdown(
            label = localizedResources.getString(R.string.select_crop),
            options = cropOptions,
            selectedIndex = selectedCropIndex,
            onSelect = { selectedCropIndex = it }
        )

        Button(onClick = { imageLauncher.launch("image/*") }) {
            Text(localizedResources.getString(R.string.pick_image))
        }

        bitmapState.value?.let { bitmap ->
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .clip(RoundedCornerShape(12.dp))
            )
        }

        Button(
            onClick = {
                bitmapState.value?.let { bitmap ->
                    isDiagnosing = true
                    scope.launch {
                        val result = withContext(Dispatchers.Default) {
                            classifier.classify(bitmap)
                        }
                        diagnosisResult = result
                        isDiagnosing = false
                    }
                }
            },
            enabled = bitmapState.value != null && !isDiagnosing
        ) {
            Text(localizedResources.getString(R.string.diagnose_button))
        }

        diagnosisResult?.let { result ->
            DiagnosisCard(
                disease = diseaseLabels.getOrElse(result.diseaseIndex) { result.diseaseName },
                severity = severityLabels.getOrElse(result.severityIndex) { result.severityName },
                severityIndex = result.severityIndex,
                confidence = result.confidence,
                uncertainty = result.uncertainty,
                localizedResources = localizedResources,
            )
        }

        Text(
            text = localizedResources.getString(R.string.note_low_confidence),
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = 12.dp)
        )
    }
}

@Composable
fun LanguageSelector(
    selected: SupportedLanguage,
    onLanguageSelected: (SupportedLanguage) -> Unit,
    localizedResources: Resources,
) {
    val context = LocalContext.current
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text(text = localizedResources.getString(R.string.language_label), fontWeight = FontWeight.SemiBold)
        OutlinedTextField(
            value = localizedResources.getString(selected.labelRes),
            onValueChange = {},
            readOnly = true,
            modifier = Modifier.fillMaxWidth(),
            trailingIcon = {
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(Icons.Filled.ArrowDropDown, contentDescription = null)
                }
            }
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            SupportedLanguage.values().forEach { language ->
                DropdownMenuItem(
                    text = { Text(context.resources.getString(language.labelRes)) },
                    onClick = {
                        onLanguageSelected(language)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun CropDropdown(label: String, options: Array<String>, selectedIndex: Int, onSelect: (Int) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text(text = label, fontWeight = FontWeight.Medium)
        OutlinedTextField(
            value = options.getOrNull(selectedIndex) ?: "",
            onValueChange = {},
            modifier = Modifier.fillMaxWidth(),
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                }
            }
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEachIndexed { index, crop ->
                DropdownMenuItem(text = { Text(crop) }, onClick = {
                    onSelect(index)
                    expanded = false
                })
            }
        }
    }
}

@Composable
fun DiagnosisCard(
    disease: String,
    severity: String,
    severityIndex: Int,
    confidence: Float,
    uncertainty: Float,
    localizedResources: Resources,
) {
    val (icon, color) = when (severityIndex) {
        0 -> "✅" to Color(0xFF2E7D32)
        1 -> "⚠️" to Color(0xFFFDD835)
        2 -> "⚠️" to Color(0xFFFFA000)
        else -> "❌" to Color(0xFFC62828)
    }
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.15f))
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "$icon ${localizedResources.getString(R.string.disease_label)}: $disease",
                fontWeight = FontWeight.Bold
            )
            Text(text = "${localizedResources.getString(R.string.severity_label)}: $severity")
            Text(text = "${localizedResources.getString(R.string.confidence_label)}: ${(confidence * 100).toInt()}%")
            Text(text = localizedResources.getString(R.string.recommendation_title), fontWeight = FontWeight.SemiBold)
            val recommendation = when (severityIndex) {
                0 -> localizedResources.getString(R.string.healthy_recommendation)
                1 -> localizedResources.getString(R.string.mild_recommendation)
                2 -> localizedResources.getString(R.string.moderate_recommendation)
                else -> localizedResources.getString(R.string.severe_recommendation)
            }
            Text(text = recommendation)
            if (confidence < 0.5f) {
                Text(text = localizedResources.getString(R.string.warning_low_confidence), color = Color(0xFFC62828))
            }
            if (uncertainty > 0.25f) {
                Text(text = localizedResources.getString(R.string.uncertainty_warning), color = Color(0xFFE65100))
            }
        }
    }
}
