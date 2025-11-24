import streamlit as st
import tensorflow as tf
from PIL import Image
import numpy as np
import json
import time

# Config
MODEL_PATH = r"c:\Users\Rohan MR\Documents\plantdisease\models\plant_disease_model.h5"
CLASS_INDICES_PATH = r"c:\Users\Rohan MR\Documents\plantdisease\models\class_indices.json"

st.set_page_config(
    page_title="Plant Disease Detector",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main {
        padding-top: 2rem;
    }
    .stAlert {
        margin-top: 1rem;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🌿 Plant Leaf Disease Detection")
st.markdown("---")

@st.cache_resource
def load_model(class_count):
    # Rebuild model architecture to avoid serialization issues
    IMG_SIZE = (224, 224)
    
    # Base Model
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = preprocess_input(inputs)
    
    base_model = tf.keras.applications.MobileNetV2(input_tensor=x, include_top=False, weights='imagenet')
    base_model.trainable = False 

    # Custom Head
    x = base_model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    predictions = tf.keras.layers.Dense(class_count, activation='softmax')(x)

    model = tf.keras.models.Model(inputs=base_model.input, outputs=predictions)
    
    # Load weights
    model.load_weights(MODEL_PATH)
    return model

@st.cache_data
def load_class_indices():
    with open(CLASS_INDICES_PATH, 'r') as f:
        return json.load(f)

def predict(image, model, class_indices, top_k=3):
    # Preprocess
    img = image.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) # Create batch axis
    # Note: preprocess_input is already part of the model graph now, 
    # but we need to be careful. 
    # In train_fast.py: x = preprocess_input(inputs) -> It's IN the model.
    # So we should NOT preprocess again if we pass it to the model input which expects raw image?
    # Wait, in train_fast.py:
    # inputs = Input()
    # x = preprocess_input(inputs)
    # model = Model(inputs, ...)
    # So the model expects RAW images (0-255).
    
    # However, in the previous app.py predict function:
    # img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    # This was double preprocessing if the model already had it?
    # Let's check train_model.py again.
    # train_model.py: 
    # inputs = Input()
    # x = preprocess_input(inputs)
    # model = Model(inputs...)
    # So the model handles preprocessing.
    
    # In the PREVIOUS app.py (the one that failed):
    # It did: img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    # AND loaded the model.
    # If the loaded model ALSO had the preprocessing layer, it would be applied TWICE.
    # Actually, the error `Unknown layer: TrueDivide` suggests the preprocessing layer (which does division) was in the saved model.
    
    # So, for this new `predict` function:
    # We are rebuilding the model WITH the preprocessing layer.
    # So we should pass raw image data (0-255) to `model.predict`.
    # We should NOT call preprocess_input manually here.
    
    pass # Just a comment for myself, continuing code...

    # Predict
    predictions = model.predict(img_array)[0]
    
    # Get top k predictions
    top_indices = predictions.argsort()[-top_k:][::-1]
    top_confidences = predictions[top_indices]
    
    # Map index to class name
    index_to_class = {v: k for k, v in class_indices.items()}
    top_classes = [index_to_class[i] for i in top_indices]
    
    return top_classes, top_confidences

# Sidebar
with st.sidebar:
    st.header("Settings")
    confidence_threshold = st.slider("Confidence Threshold", 0.0, 1.0, 0.5, 0.05)
    
    st.markdown("---")
    st.header("About")
    st.info(
        "This app uses a **MobileNetV2** model trained on the **PlantVillage** dataset "
        "to detect 38 different plant disease classes."
    )
    st.markdown("Built with TensorFlow & Streamlit.")

# Main Interface
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Input Image")
    uploaded_file = st.file_uploader("Choose a leaf image...", type=["jpg", "png", "jpeg"])
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption='Uploaded Image', use_column_width=True)

with col2:
    st.subheader("Analysis Results")
    
    if uploaded_file is not None:
        # Check if model exists
        try:
            with st.spinner("Analyzing image..."):
                class_indices = load_class_indices()
                model = load_model(len(class_indices))
                
                start_time = time.time()
                top_classes, top_confidences = predict(image, model, class_indices)
                end_time = time.time()
            
            # Primary Prediction
            primary_class = top_classes[0]
            primary_conf = top_confidences[0]
            
            if primary_conf >= confidence_threshold:
                st.success(f"**Prediction:** {primary_class}")
                st.metric("Confidence", f"{primary_conf:.2%}")
                
                # Top 3 Breakdown
                st.markdown("### Top Predictions")
                for cls, conf in zip(top_classes, top_confidences):
                    st.write(f"**{cls}**: {conf:.2%}")
                    st.progress(float(conf))
            else:
                st.warning(f"Low confidence prediction ({primary_conf:.2%}). Try another image.")
                
            st.caption(f"Inference Time: {end_time - start_time:.4f} seconds")
            
        except Exception as e:
            st.error("Model not ready yet.")
            st.warning("Training is likely still in progress. Please wait for the model to be saved.")
            with st.expander("See error details"):
                st.write(e)
    else:
        st.info("Please upload an image to start analysis.")

