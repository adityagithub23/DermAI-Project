# import os
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
# from sklearn.metrics import classification_report, confusion_matrix
# import matplotlib.pyplot as plt
# import seaborn as sns
# import json

# class DermAIModelTrainer:
#     def __init__(self, data_dir='../data', model_dir='models'):
#         self.data_dir = data_dir
#         self.model_dir = model_dir
#         self.img_size = (224, 224)
#         self.batch_size = 32
#         self.epochs = 50
#         self.num_classes = 7
        
#         # Disease classes
#         self.class_names = [
#             'melanoma', 'nevus', 'basal_cell_carcinoma', 
#             'actinic_keratosis', 'benign_keratosis', 
#             'dermatofibroma', 'vascular_lesion'
#         ]
        
#         # Create model directory if it doesn't exist
#         os.makedirs(self.model_dir, exist_ok=True)
    
#     def create_data_generators(self):
#         """Create data generators with augmentation"""
#         print("Creating data generators...")
        
#         # Data augmentation for training
#         train_datagen = ImageDataGenerator(
#             rescale=1./255,
#             rotation_range=30,
#             width_shift_range=0.2,
#             height_shift_range=0.2,
#             shear_range=0.2,
#             zoom_range=0.2,
#             horizontal_flip=True,
#             vertical_flip=True,
#             brightness_range=[0.8, 1.2],
#             fill_mode='nearest',
#             validation_split=0.2
#         )
        
#         # Only rescaling for validation
#         val_datagen = ImageDataGenerator(
#             rescale=1./255,
#             validation_split=0.2
#         )
        
#         # Training generator
#         self.train_generator = train_datagen.flow_from_directory(
#             os.path.join(self.data_dir, 'train'),
#             target_size=self.img_size,
#             batch_size=self.batch_size,
#             class_mode='categorical',
#             subset='training',
#             shuffle=True
#         )
        
#         # Validation generator
#         self.validation_generator = val_datagen.flow_from_directory(
#             os.path.join(self.data_dir, 'train'),
#             target_size=self.img_size,
#             batch_size=self.batch_size,
#             class_mode='categorical',
#             subset='validation',
#             shuffle=False
#         )
        
#         print(f"Training samples: {self.train_generator.samples}")
#         print(f"Validation samples: {self.validation_generator.samples}")
#         print(f"Classes found: {list(self.train_generator.class_indices.keys())}")
        
#         return self.train_generator, self.validation_generator
    
#     def build_model(self):
#         """Build CNN model architecture"""
#         print("Building CNN model...")
        
#         model = Sequential([
#             # First Convolutional Block
#             Conv2D(32, (3, 3), activation='relu', input_shape=(*self.img_size, 3)),
#             BatchNormalization(),
#             Conv2D(32, (3, 3), activation='relu'),
#             MaxPooling2D(2, 2),
#             Dropout(0.25),
            
#             # Second Convolutional Block
#             Conv2D(64, (3, 3), activation='relu'),
#             BatchNormalization(),
#             Conv2D(64, (3, 3), activation='relu'),
#             MaxPooling2D(2, 2),
#             Dropout(0.25),
            
#             # Third Convolutional Block
#             Conv2D(128, (3, 3), activation='relu'),
#             BatchNormalization(),
#             Conv2D(128, (3, 3), activation='relu'),
#             MaxPooling2D(2, 2),
#             Dropout(0.25),
            
#             # Fourth Convolutional Block
#             Conv2D(256, (3, 3), activation='relu'),
#             BatchNormalization(),
#             Conv2D(256, (3, 3), activation='relu'),
#             MaxPooling2D(2, 2),
#             Dropout(0.25),
            
#             # Fully Connected Layers
#             Flatten(),
#             Dense(512, activation='relu'),
#             BatchNormalization(),
#             Dropout(0.5),
#             Dense(256, activation='relu'),
#             BatchNormalization(),
#             Dropout(0.5),
#             Dense(self.num_classes, activation='softmax')
#         ])
        
#         # Compile model
#         model.compile(
#             optimizer=Adam(learning_rate=0.001),
#             loss='categorical_crossentropy',
#             metrics=['accuracy']
#         )
        
#         print("Model architecture:")
#         model.summary()
        
#         return model
    
#     def train_model(self, model, train_gen, val_gen):
#         """Train the model with callbacks"""
#         print("Starting model training...")
        
#         # Callbacks
#         callbacks = [
#             EarlyStopping(
#                 monitor='val_accuracy',
#                 patience=10,
#                 restore_best_weights=True,
#                 verbose=1
#             ),
#             ModelCheckpoint(
#                 os.path.join(self.model_dir, 'best_model.h5'),
#                 monitor='val_accuracy',
#                 save_best_only=True,
#                 verbose=1
#             ),
#             ReduceLROnPlateau(
#                 monitor='val_loss',
#                 factor=0.2,
#                 patience=5,
#                 min_lr=1e-7,
#                 verbose=1
#             )
#         ]
        
#         # Calculate steps
#         steps_per_epoch = train_gen.samples // self.batch_size
#         validation_steps = val_gen.samples // self.batch_size
        
#         # Train model
#         history = model.fit(
#             train_gen,
#             epochs=self.epochs,
#             steps_per_epoch=steps_per_epoch,
#             validation_data=val_gen,
#             validation_steps=validation_steps,
#             callbacks=callbacks,
#             verbose=1
#         )
        
#         return history
    
#     def plot_training_history(self, history):
#         """Plot training history"""
#         print("Plotting training history...")
        
#         fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
#         # Plot accuracy
#         ax1.plot(history.history['accuracy'], label='Training Accuracy')
#         ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
#         ax1.set_title('Model Accuracy')
#         ax1.set_xlabel('Epoch')
#         ax1.set_ylabel('Accuracy')
#         ax1.legend()
#         ax1.grid(True)
        
#         # Plot loss
#         ax2.plot(history.history['loss'], label='Training Loss')
#         ax2.plot(history.history['val_loss'], label='Validation Loss')
#         ax2.set_title('Model Loss')
#         ax2.set_xlabel('Epoch')
#         ax2.set_ylabel('Loss')
#         ax2.legend()
#         ax2.grid(True)
        
#         plt.tight_layout()
#         plt.savefig(os.path.join(self.model_dir, 'training_history.png'))
#         plt.show()
    
#     def evaluate_model(self, model, val_gen):
#         """Evaluate model performance"""
#         print("Evaluating model...")
        
#         # Get predictions
#         val_gen.reset()
#         predictions = model.predict(val_gen, verbose=1)
#         y_pred = np.argmax(predictions, axis=1)
#         y_true = val_gen.classes
        
#         # Classification report
#         report = classification_report(
#             y_true, y_pred,
#             target_names=self.class_names,
#             output_dict=True
#         )
        
#         print("\nClassification Report:")
#         print(classification_report(y_true, y_pred, target_names=self.class_names))
        
#         # Confusion matrix
#         cm = confusion_matrix(y_true, y_pred)
#         plt.figure(figsize=(10, 8))
#         sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
#                    xticklabels=self.class_names,
#                    yticklabels=self.class_names)
#         plt.title('Confusion Matrix')
#         plt.xlabel('Predicted')
#         plt.ylabel('Actual')
#         plt.tight_layout()
#         plt.savefig(os.path.join(self.model_dir, 'confusion_matrix.png'))
#         plt.show()
        
#         return report
    
#     def save_model_info(self, model, report):
#         """Save model information"""
#         print("Saving model information...")
        
#         model_info = {
#             'model_name': 'DermAI_CNN_v1.0',
#             'input_shape': list(self.img_size) + [3],
#             'num_classes': self.num_classes,
#             'class_names': self.class_names,
#             'accuracy': float(report['accuracy']),
#             'macro_avg_precision': float(report['macro avg']['precision']),
#             'macro_avg_recall': float(report['macro avg']['recall']),
#             'macro_avg_f1': float(report['macro avg']['f1-score']),
#             'class_metrics': {
#                 class_name: {
#                     'precision': float(report[class_name]['precision']),
#                     'recall': float(report[class_name]['recall']),
#                     'f1-score': float(report[class_name]['f1-score'])
#                 }
#                 for class_name in self.class_names
#             }
#         }
        
#         # Save model info
#         with open(os.path.join(self.model_dir, 'model_info.json'), 'w') as f:
#             json.dump(model_info, f, indent=2)
        
#         # Save final model
#         model.save(os.path.join(self.model_dir, 'dermai_model.h5'))
        
#         print(f"Model saved successfully!")
#         print(f"Final Accuracy: {model_info['accuracy']:.4f}")
    
#     def run_training_pipeline(self):
#         """Run complete training pipeline"""
#         print("=" * 50)
#         print("DermAI Model Training Pipeline")
#         print("=" * 50)
        
#         try:
#             # Create data generators
#             train_gen, val_gen = self.create_data_generators()
            
#             # Build model
#             model = self.build_model()
            
#             # Train model
#             history = self.train_model(model, train_gen, val_gen)
            
#             # Plot training history
#             self.plot_training_history(history)
            
#             # Load best model
#             best_model = tf.keras.models.load_model(os.path.join(self.model_dir, 'best_model.h5'))
            
#             # Evaluate model
#             report = self.evaluate_model(best_model, val_gen)
            
#             # Save model and info
#             self.save_model_info(best_model, report)
            
#             print("=" * 50)
#             print("Training completed successfully!")
#             print("=" * 50)
            
#         except Exception as e:
#             print(f"Error during training: {str(e)}")
#             raise

# if __name__ == "__main__":
#     # Initialize trainer
#     trainer = DermAIModelTrainer()
    
#     # Run training pipeline
#     trainer.run_training_pipeline()

import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1' 
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import json
from pathlib import Path

class DermAIModelTrainer:
    def __init__(self, data_dir=None, model_dir=None):
        # Base project directory (parent of backend/)
        PROJECT_DIR = Path(__file__).parent.parent

        # Data directory
        if data_dir is None:
            self.data_dir = PROJECT_DIR / "data"  # data/train and data/test
        else:
            self.data_dir = Path(data_dir)

        # Model directory
        if model_dir is None:
            self.model_dir = PROJECT_DIR / "backend" / "models"
        else:
            self.model_dir = Path(model_dir)

        self.img_size = (224, 224)
        self.batch_size = 8
        self.epochs = 20
        self.num_classes = 7

        # Disease classes
        self.class_names = [
            'melanoma', 'nevus', 'basal_cell_carcinoma',
            'actinic_keratosis', 'benign_keratosis',
            'dermatofibroma', 'vascular_lesion'
        ]

        # Create model directory if it doesn't exist
        os.makedirs(self.model_dir, exist_ok=True)

    def create_data_generators(self):
        print("Creating data generators...")

        # Training augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=30,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest',
            validation_split=0.2
        )

        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=0.2
        )

        self.train_generator = train_datagen.flow_from_directory(
            self.data_dir / 'train',
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )

        self.validation_generator = val_datagen.flow_from_directory(
            self.data_dir / 'train',
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )

        print(f"Training samples: {self.train_generator.samples}")
        print(f"Validation samples: {self.validation_generator.samples}")
        print(f"Classes found: {list(self.train_generator.class_indices.keys())}")

        return self.train_generator, self.validation_generator

    def build_model(self):
        print("Building CNN model...")

        model = Sequential([
            Conv2D(32, (3,3), activation='relu', input_shape=(*self.img_size, 3)),
            BatchNormalization(),
            Conv2D(32, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Dropout(0.25),

            Conv2D(64, (3,3), activation='relu'),
            BatchNormalization(),
            Conv2D(64, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Dropout(0.25),

            Conv2D(128, (3,3), activation='relu'),
            BatchNormalization(),
            Conv2D(128, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Dropout(0.25),

            Conv2D(256, (3,3), activation='relu'),
            BatchNormalization(),
            Conv2D(256, (3,3), activation='relu'),
            MaxPooling2D(2,2),
            Dropout(0.25),

            Flatten(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(self.num_classes, activation='softmax')
        ])

        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        model.summary()
        return model

    def train_model(self, model, train_gen, val_gen):
        print("Starting model training...")

        callbacks = [
            EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True, verbose=1),
            ModelCheckpoint(os.path.join(self.model_dir, 'best_model.h5'), monitor='val_accuracy', save_best_only=True, verbose=1),
            ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=1e-7, verbose=1)
        ]

        steps_per_epoch = train_gen.samples // self.batch_size
        validation_steps = val_gen.samples // self.batch_size

        history = model.fit(
            train_gen,
            epochs=self.epochs,
            steps_per_epoch=steps_per_epoch,
            validation_data=val_gen,
            validation_steps=validation_steps,
            callbacks=callbacks,
            verbose=1
        )

        return history

    def plot_training_history(self, history):
        print("Plotting training history...")
        fig, (ax1, ax2) = plt.subplots(1,2, figsize=(12,4))

        ax1.plot(history.history['accuracy'], label='Training Accuracy')
        ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)

        ax2.plot(history.history['loss'], label='Training Loss')
        ax2.plot(history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)

        plt.tight_layout()
        plt.savefig(os.path.join(self.model_dir, 'training_history.png'))
        plt.show()

    def evaluate_model(self, model, val_gen):
        print("Evaluating model...")
        val_gen.reset()
        predictions = model.predict(val_gen, verbose=1)
        y_pred = np.argmax(predictions, axis=1)
        y_true = val_gen.classes

        report = classification_report(y_true, y_pred, target_names=self.class_names, output_dict=True)
        print(classification_report(y_true, y_pred, target_names=self.class_names))

        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(10,8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=self.class_names, yticklabels=self.class_names)
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(os.path.join(self.model_dir, 'confusion_matrix.png'))
        plt.show()

        return report

    def save_model_info(self, model, report):
        print("Saving model information...")
        model_info = {
            'model_name': 'DermAI_CNN_v1.0',
            'input_shape': list(self.img_size) + [3],
            'num_classes': self.num_classes,
            'class_names': self.class_names,
            'accuracy': float(report['accuracy']),
            'macro_avg_precision': float(report['macro avg']['precision']),
            'macro_avg_recall': float(report['macro avg']['recall']),
            'macro_avg_f1': float(report['macro avg']['f1-score']),
            'class_metrics': {class_name: {'precision': float(report[class_name]['precision']),
                                           'recall': float(report[class_name]['recall']),
                                           'f1-score': float(report[class_name]['f1-score'])} for class_name in self.class_names}
        }

        with open(os.path.join(self.model_dir, 'model_info.json'), 'w') as f:
            json.dump(model_info, f, indent=2)

        model.save(os.path.join(self.model_dir, 'dermai_model.h5'))
        print("Model saved successfully!")
        print(f"Final Accuracy: {model_info['accuracy']:.4f}")

    def run_training_pipeline(self):
        print("="*50)
        print("DermAI Model Training Pipeline")
        print("="*50)
        try:
            train_gen, val_gen = self.create_data_generators()
            model = self.build_model()
            history = self.train_model(model, train_gen, val_gen)
            self.plot_training_history(history)
            best_model = tf.keras.models.load_model(os.path.join(self.model_dir, 'best_model.h5'))
            report = self.evaluate_model(best_model, val_gen)
            self.save_model_info(best_model, report)
            print("="*50)
            print("Training completed successfully!")
            print("="*50)
        except Exception as e:
            print(f"Error during training: {e}")
            raise


if __name__ == "__main__":
    trainer = DermAIModelTrainer()
    trainer.run_training_pipeline()
