const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Prediction = require('../models/Prediction');
const { protect } = require('../middleware/auth');

// Log route registration
console.log('✅ Report routes registered');

// @route   GET /api/reports/:id/pdf
// @desc    Generate PDF report for a prediction
// @access  Private
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('patientId', 'firstName lastName email')
      .populate('sharedWithDoctors.doctorId', 'firstName lastName specialization');

    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prediction not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && prediction.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (req.user.role === 'doctor') {
      const isShared = prediction.sharedWithDoctors.some(
        share => {
          const doctorId = share.doctorId?._id?.toString() || share.doctorId?.toString() || share.doctorId;
          return doctorId === req.user.id;
        }
      );
      if (!isShared) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized. This report has not been shared with you.' 
        });
      }
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `DermAI_Report_${prediction._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('🩺 DermAI', { align: 'center' });
    doc.fontSize(12).text('Your Skin, Our AI – Diagnose with Confidence', { align: 'center', font: 'Courier', italic: true });
    doc.fontSize(14).text('Skin Disease Prediction Report', { align: 'center' });
    doc.moveDown();

    // Patient Information
    doc.fontSize(16).text('Patient Information', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${prediction.patientId.firstName} ${prediction.patientId.lastName}`);
    doc.text(`Email: ${prediction.patientId.email}`);
    doc.moveDown();

    // Prediction Details
    doc.fontSize(16).text('Prediction Results', { underline: true });
    doc.fontSize(14).fillColor('blue').text(`Predicted Disease: ${prediction.prediction.disease.replace(/_/g, ' ').toUpperCase()}`, { continued: false });
    doc.fillColor('black').fontSize(12);
    doc.text(`Confidence Score: ${prediction.prediction.percentage.toFixed(1)}%`, { indent: 20 });
    
    // Risk level with color coding
    const riskColor = prediction.prediction.riskLevel === 'HIGH' ? 'red' : 
                     prediction.prediction.riskLevel === 'MODERATE' ? 'orange' : 'green';
    doc.fillColor(riskColor).fontSize(12);
    doc.text(`Risk Level: ${prediction.prediction.riskLevel.replace('_', ' ')}`, { indent: 20 });
    doc.fillColor('black');
    doc.moveDown();

    if (prediction.symptoms) {
      doc.fontSize(16).text('Symptoms', { underline: true });
      doc.fontSize(12).text(prediction.symptoms);
      doc.moveDown();
    }

    // All Predictions
    doc.fontSize(16).text('All Predictions', { underline: true });
    doc.fontSize(12);
    prediction.allPredictions.forEach((pred, index) => {
      doc.text(`${index + 1}. ${pred.disease.replace(/_/g, ' ')}: ${pred.percentage.toFixed(1)}%`);
    });
    doc.moveDown();

    // Recommendations & Precautions
    if (prediction.recommendation) {
      doc.fontSize(16).text('Medical Recommendations & Precautions', { underline: true });
      doc.fontSize(12);
      doc.moveDown(0.5);
      
      if (prediction.recommendation.riskMessage) {
        doc.fontSize(12).fillColor('red').text('Risk Assessment:', { continued: false });
        doc.fillColor('black').fontSize(11).text(prediction.recommendation.riskMessage, { indent: 20 });
        doc.moveDown();
      }
      if (prediction.recommendation.diseaseInfo) {
        doc.fontSize(12).fillColor('blue').text('Condition Information:', { continued: false });
        doc.fillColor('black').fontSize(11).text(prediction.recommendation.diseaseInfo, { indent: 20 });
        doc.moveDown();
      }
      if (prediction.recommendation.generalAdvice) {
        doc.fontSize(12).fillColor('green').text('General Advice:', { continued: false });
        doc.fillColor('black').fontSize(11).text(prediction.recommendation.generalAdvice, { indent: 20 });
        doc.moveDown();
      }
      
      // Precautions section
      doc.moveDown();
      doc.fontSize(12).fillColor('orange').text('Precautions:', { underline: true });
      doc.fillColor('black').fontSize(11);
      doc.text('• Monitor the affected area for any changes in size, color, or texture', { indent: 20 });
      doc.text('• Avoid excessive sun exposure and use appropriate sunscreen', { indent: 20 });
      doc.text('• Do not attempt to treat the condition without professional medical advice', { indent: 20 });
      doc.text('• Schedule an appointment with a dermatologist for proper evaluation', { indent: 20 });
      doc.moveDown();
    }

    // Shared Doctors
    if (prediction.sharedWithDoctors.length > 0) {
      doc.fontSize(16).text('Shared With Doctors', { underline: true });
      doc.fontSize(12);
      prediction.sharedWithDoctors.forEach((share, index) => {
        const doctor = share.doctorId;
        doc.text(`${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`);
      });
      doc.moveDown();
    }

    // Footer
    doc.fontSize(10);
    doc.text(`Report Generated: ${new Date(prediction.createdAt).toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(8);
    doc.text('🩺 DermAI - Your Skin, Our AI – Diagnose with Confidence', { align: 'center', italic: true });
    doc.moveDown();
    doc.fontSize(10);
    doc.text('⚠️ IMPORTANT DISCLAIMER', { align: 'center', bold: true });
    doc.text('This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified dermatologist for proper medical evaluation.', { align: 'center' });

    doc.end();

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;

