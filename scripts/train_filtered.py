import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import os
import json
import shutil

# Configuration
DATA_DIR = r"c:\Users\Rohan MR\Documents\plantdisease\plantvillage dataset\color"
# We will create a temporary directory for the filtered dataset to make loading easier with image_dataset_from_directory
FILTERED_DATA_DIR = r"c:\Users\Rohan MR\Documents\plantdisease\plantvillage_filtered"
MODEL_SAVE_PATH = r"c:\Users\Rohan MR\Documents\plantdisease\models\plant_disease_model.h5"
CLASS_INDICES_PATH = r"c:\Users\Rohan MR\Documents\plantdisease\models\class_indices.json"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 3 # A bit more training since dataset is smaller

# The 5 selected plants
SELECTED_PLANTS = ["Apple", "Tomato", "Potato", "Corn_(maize)", "Grape"]

def prepare_filtered_dataset():
    print(f"Preparing filtered dataset for: {SELECTED_PLANTS}...")
    
    if os.path.exists(FILTERED_DATA_DIR):
        shutil.rmtree(FILTERED_DATA_DIR)
    os.makedirs(FILTERED_DATA_DIR)

    # List all classes
    all_classes = os.listdir(DATA_DIR)
    
    count = 0
    for class_name in all_classes:
        # Check if class belongs to one of the selected plants
        # Class names are like 'Apple___Black_rot', 'Tomato___healthy'
        plant_name = class_name.split("___")[0]
        
        if plant_name in SELECTED_PLANTS:
            src = os.path.join(DATA_DIR, class_name)
            dst = os.path.join(FILTERED_DATA_DIR, class_name)
            # Symlink would be faster but requires admin rights on Windows often, 
            # so we'll copy (slower but safer) or just use a custom generator.
            # Actually, let's try to use a custom generator or just copy. 
            # Copying 5 plants might take a moment but it's robust.
            # Let's try creating a list of valid files and passing it? 
            # No, image_dataset_from_directory is easiest with folders.
            # Let's just copy. It's about 20-30k images, might take 1-2 mins.
            print(f"Copying {class_name}...")
            shutil.copytree(src, dst)
            count += 1
            
    print(f"Copied {count} disease classes to {FILTERED_DATA_DIR}")

def train():
    # 1. Prepare Data
    if not os.path.exists(FILTERED_DATA_DIR):
        prepare_filtered_dataset()
    else:
        print("Filtered dataset directory exists, skipping copy (delete 'plantvillage_filtered' to force recopy).")

    print("Loading data...")
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        FILTERED_DATA_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        FILTERED_DATA_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )

    class_names = train_ds.class_names
    print(f"Found {len(class_names)} classes: {class_names}")

    # Save class indices
    class_indices = {name: i for i, name in enumerate(class_names)}
    with open(CLASS_INDICES_PATH, 'w') as f:
        json.dump(class_indices, f)
    print(f"Saved class indices to {CLASS_INDICES_PATH}")

    # Prefetch
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

    # Model
    print("Building model...")
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = preprocess_input(inputs)
    
    base_model = MobileNetV2(input_tensor=x, input_shape=IMG_SIZE + (3,), include_top=False, weights='imagenet')
    base_model.trainable = False 

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.2)(x)
    predictions = Dense(len(class_names), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(optimizer=Adam(learning_rate=0.0001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    # Train
    print(f"Starting training for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        verbose=1
    )

    # Save
    print(f"Saving model to {MODEL_SAVE_PATH}...")
    model.save(MODEL_SAVE_PATH)
    print("Done! App is ready with new model.")

if __name__ == "__main__":
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    train()
