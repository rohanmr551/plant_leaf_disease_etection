package com.example.plantdisease

import android.content.Context
import android.graphics.Bitmap
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import org.tensorflow.lite.DataType
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ImageProcessor
import org.tensorflow.lite.support.image.ops.NormalizeOp
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer
import java.nio.ByteBuffer

const val MODEL_FILE = "plant_disease_multitask_int8.tflite"

data class DiagnosisResult(
    val diseaseIndex: Int,
    val diseaseName: String,
    val severityIndex: Int,
    val severityName: String,
    val confidence: Float,
    val uncertainty: Float,
)

class TFLitePlantDiseaseClassifier(private val context: Context) {
    private val interpreter: Interpreter by lazy {
        val modelBuffer = FileUtil.loadMappedFile(context, MODEL_FILE)
        Interpreter(modelBuffer)
    }

    private val diseaseLabels by lazy { context.resources.getStringArray(R.array.disease_labels) }
    private val severityLabels by lazy { context.resources.getStringArray(R.array.severity_labels) }
    private val imageProcessor = ImageProcessor.Builder()
        .add(NormalizeOp(0f, 255f))
        .build()

    fun classify(bitmap: Bitmap): DiagnosisResult {
        val preparedBitmap = bitmap.preprocessForModel()
        var tensorImage = TensorImage(DataType.FLOAT32)
        tensorImage.load(preparedBitmap)
        tensorImage = imageProcessor.process(tensorImage)
        val inputBuffer: ByteBuffer = tensorImage.buffer
        inputBuffer.rewind()

        val diseaseOutput = Array(1) { FloatArray(diseaseLabels.size) }
        val severityOutput = Array(1) { FloatArray(severityLabels.size) }
        val outputs = mutableMapOf<Int, Any>(0 to diseaseOutput, 1 to severityOutput)

        interpreter.runForMultipleInputsOutputs(arrayOf(inputBuffer), outputs)

        val diseaseProbs = diseaseOutput[0]
        val severityProbs = severityOutput[0]
        val diseaseIndex = diseaseProbs.indices.maxByOrNull { diseaseProbs[it] } ?: 0
        val severityIndex = severityProbs.indices.maxByOrNull { severityProbs[it] } ?: 0
        val confidence = diseaseProbs[diseaseIndex].coerceIn(0f, 1f)
        val uncertainty = 1f - confidence

        return DiagnosisResult(
            diseaseIndex = diseaseIndex,
            diseaseName = diseaseLabels.getOrElse(diseaseIndex) { "Unknown" },
            severityIndex = severityIndex,
            severityName = severityLabels.getOrElse(severityIndex) { "Unknown" },
            confidence = confidence,
            uncertainty = uncertainty,
        )
    }

    fun close() {
        interpreter.close()
    }
}
