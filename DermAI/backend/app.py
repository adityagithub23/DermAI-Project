from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import json
import logging
from datetime import datetime
import cv2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DermAIPredictor:
    def __init__(self, model_path='models/dermai_model.h5', model_info_path='models/model_info.json'):
        self.model_path = model_path
        self.model_info_path = model_info_path
        self.model = None
        self.model_info = None
        self.img_size = (224, 224)
        
        # Load model and info
        self.load_model()
        self.load_model_info()
    
    def load_model(self):
        """Load the trained model"""
        try:
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info("Model loaded successfully")
            else:
                logger.error(f"Model file not found: {self.model_path}")
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def load_model_info(self):
        """Load model information"""
        try:
            if os.path.exists(self.model_info_path):
                with open(self.model_info_path, 'r') as f:
                    self.model_info = json.load(f)
                logger.info("Model info loaded successfully")
            else:
                logger.warning("Model info file not found, using defaults")
                self.model_info = {
                    'class_names': [
                        'melanoma', 'nevus', 'basal_cell_carcinoma', 
                        'actinic_keratosis', 'benign_keratosis', 
                        'dermatofibroma', 'vascular_lesion'
                    ]
                }
        except Exception as e:
            logger.error(f"Error loading model info: {str(e)}")
            self.model_info = {
                'class_names': [
                    'melanoma', 'nevus', 'basal_cell_carcinoma', 
                    'actinic_keratosis', 'benign_keratosis', 
                    'dermatofibroma', 'vascular_lesion'
                ]
            }
    
    def preprocess_image(self, image):
        """Preprocess image for prediction"""
        try:
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image
            image = image.resize(self.img_size)
            
            # Convert to array and normalize
            image_array = np.array(image) / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def predict(self, image):
        """Make prediction on image"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Make prediction
            predictions = self.model.predict(processed_image)
            probabilities = predictions[0]
            
            # Get class names
            class_names = self.model_info['class_names']
            
            # Create results
            results = []
            for i, prob in enumerate(probabilities):
                results.append({
                    'disease': class_names[i],
                    'confidence': float(prob),
                    'percentage': float(prob * 100)
                })
            
            # Sort by confidence
            results = sorted(results, key=lambda x: x['confidence'], reverse=True)
            
            # Get top prediction
            top_prediction = results[0]
            
            # Determine risk level based on confidence and disease type
            risk_level = self.determine_risk_level(top_prediction['disease'], top_prediction['confidence'])
            
            return {
                'success': True,
                'prediction': {
                    'disease': top_prediction['disease'],
                    'confidence': top_prediction['confidence'],
                    'percentage': top_prediction['percentage'],
                    'risk_level': risk_level
                },
                'all_predictions': results,
                'recommendation': self.get_recommendation(top_prediction['disease'], risk_level),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def determine_risk_level(self, disease, confidence):
        """Determine risk level based on disease and confidence"""
        high_risk_diseases = ['melanoma', 'basal_cell_carcinoma']
        
        if disease in high_risk_diseases:
            if confidence > 0.8:
                return 'HIGH'
            elif confidence > 0.6:
                return 'MODERATE'
            else:
                return 'LOW'
        else:
            if confidence > 0.9:
                return 'MODERATE'
            elif confidence > 0.7:
                return 'LOW'
            else:
                return 'VERY_LOW'
    
    def get_recommendation(self, disease, risk_level):
        """Get recommendation based on prediction"""
        recommendations = {
            'HIGH': "⚠️ HIGH RISK: Please consult a dermatologist immediately. This condition requires urgent medical attention.",
            'MODERATE': "⚡ MODERATE RISK: Schedule an appointment with a dermatologist within a week for proper evaluation.",
            'LOW': "✅ LOW RISK: Monitor the condition and consult a doctor if symptoms worsen or persist.",
            'VERY_LOW': "✅ VERY LOW RISK: Continue regular skin monitoring. Consult a doctor if you notice any changes."
        }
        
        disease_info = {
            'melanoma': "A serious form of skin cancer that can spread to other parts of the body.",
            'nevus': "A common type of mole that is usually benign.",
            'basal_cell_carcinoma': "The most common type of skin cancer, usually slow-growing.",
            'actinic_keratosis': "Rough, scaly patches that may develop into skin cancer if left untreated.",
            'benign_keratosis': "Non-cancerous skin growths that are usually harmless.",
            'dermatofibroma': "A benign skin nodule that typically doesn't require treatment.",
            'vascular_lesion': "Blood vessel abnormalities that are usually benign."
        }
        
        return {
            'risk_message': recommendations.get(risk_level, recommendations['LOW']),
            'disease_info': disease_info.get(disease, "Please consult a healthcare professional for proper diagnosis."),
            'general_advice': "This AI prediction is for informational purposes only and should not replace professional medical advice."
        }

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize predictor
predictor = None

def init_predictor():
    """Initialize the predictor"""
    global predictor
    try:
        predictor = DermAIPredictor()
        logger.info("DermAI Predictor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize predictor: {str(e)}")
        predictor = None

# Initialize predictor on startup
init_predictor()

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'DermAI Backend API',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': predictor is not None
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info')
def model_info():
    """Get model information"""
    if predictor is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'success': True,
        'model_info': predictor.model_info,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_disease():
    """Predict skin disease from uploaded image"""
    try:
        # Check if model is loaded
        if predictor is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        
        if file_extension not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Please upload an image file.'}), 400
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Make prediction
        result = predictor.predict(image)
        
        # Save uploaded image (optional)
        if result['success']:
            upload_dir = 'uploads'
            os.makedirs(upload_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"prediction_{timestamp}.{file_extension}"
            filepath = os.path.join(upload_dir, filename)
            
            # Save image
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            result['saved_image'] = filename
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error occurred during prediction',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Predict multiple images at once"""
    try:
        if predictor is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        results = []
        
        for i, file in enumerate(files):
            try:
                if file.filename == '':
                    continue
                
                # Process each image
                image_bytes = file.read()
                image = Image.open(io.BytesIO(image_bytes))
                
                result = predictor.predict(image)
                result['file_index'] = i
                result['filename'] = file.filename
                
                results.append(result)
                
            except Exception as e:
                results.append({
                    'success': False,
                    'error': str(e),
                    'file_index': i,
                    'filename': file.filename
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in batch predict endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error occurred during batch prediction',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5001)