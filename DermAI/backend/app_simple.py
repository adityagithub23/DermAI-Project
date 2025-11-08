"""
Simple Mock ML Backend for SkinSense
This version works without requiring a trained TensorFlow model.
Returns realistic-looking placeholder predictions.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import os
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Disease classes
DISEASE_CLASSES = [
    'melanoma',
    'nevus',
    'basal_cell_carcinoma',
    'actinic_keratosis',
    'benign_keratosis',
    'dermatofibroma',
    'vascular_lesion'
]

def generate_realistic_prediction():
    """Generate a realistic-looking prediction"""
    # Randomly select a disease (weighted towards more common ones)
    weights = [0.1, 0.4, 0.15, 0.1, 0.15, 0.05, 0.05]  # nevus is most common
    disease = random.choices(DISEASE_CLASSES, weights=weights)[0]
    
    # Generate confidence based on disease type
    if disease in ['melanoma', 'basal_cell_carcinoma']:
        confidence = random.uniform(0.65, 0.95)  # Higher confidence for serious conditions
    else:
        confidence = random.uniform(0.75, 0.98)
    
    # Generate all predictions with realistic distribution
    all_predictions = []
    remaining_prob = 1.0 - confidence
    
    for d in DISEASE_CLASSES:
        if d == disease:
            prob = confidence
        else:
            # Distribute remaining probability
            prob = random.uniform(0, remaining_prob * 0.3)
            remaining_prob -= prob
        all_predictions.append({
            'disease': d,
            'confidence': prob,
            'percentage': prob * 100
        })
    
    # Normalize to sum to 1
    total = sum(p['confidence'] for p in all_predictions)
    for p in all_predictions:
        p['confidence'] = p['confidence'] / total
        p['percentage'] = (p['confidence'] / total) * 100
    
    # Sort by confidence
    all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
    top_prediction = all_predictions[0]
    
    # Determine risk level
    if top_prediction['disease'] in ['melanoma', 'basal_cell_carcinoma']:
        if top_prediction['confidence'] > 0.8:
            risk_level = 'HIGH'
        elif top_prediction['confidence'] > 0.6:
            risk_level = 'MODERATE'
        else:
            risk_level = 'LOW'
    else:
        if top_prediction['confidence'] > 0.9:
            risk_level = 'MODERATE'
        elif top_prediction['confidence'] > 0.7:
            risk_level = 'LOW'
        else:
            risk_level = 'VERY_LOW'
    
    return {
        'disease': top_prediction['disease'],
        'confidence': top_prediction['confidence'],
        'percentage': top_prediction['percentage'],
        'risk_level': risk_level,
        'all_predictions': all_predictions
    }

@app.route('/')
def home():
    return jsonify({
        'message': 'DermAI Mock ML Backend',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': True,
        'mode': 'mock (no TensorFlow required)'
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_disease():
    """Predict skin disease from uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
        # Read and validate image
        image_bytes = file.read()
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            return jsonify({'success': False, 'error': 'Invalid image file'}), 400
        
        # Generate prediction
        prediction_data = generate_realistic_prediction()
        
        # Get recommendation
        recommendations = get_recommendation(prediction_data['disease'], prediction_data['risk_level'])
        
        return jsonify({
            'success': True,
            'prediction': {
                'disease': prediction_data['disease'],
                'confidence': prediction_data['confidence'],
                'percentage': prediction_data['percentage'],
                'risk_level': prediction_data['risk_level']
            },
            'all_predictions': prediction_data['all_predictions'],
            'recommendation': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def get_recommendation(disease, risk_level):
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

if __name__ == '__main__':
    print("=" * 60)
    print("DermAI Mock ML Backend")
    print("=" * 60)
    print("Mode: Mock (no TensorFlow model required)")
    print("Port: 5002")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5002)

