import { useState } from 'react'

const Help = () => {
  const [openSection, setOpenSection] = useState(null)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Get Started as Patient" on the home page or go to the Patient Signup page. Fill in your details including name, email, password, and optional information like phone number and date of birth. Click "Create Account" to register.'
        },
        {
          q: 'Do I need to pay to use DermAI?',
          a: 'No, DermAI is free to use for patients. You can upload images, get predictions, and track your medical history at no cost. Doctors may charge consultation fees if you choose to share reports with them.'
        },
        {
          q: 'What image formats are supported?',
          a: 'We support common image formats including JPG, PNG, GIF, and BMP. Images should be clear and well-lit, with the skin lesion visible. Maximum file size is 10MB.'
        }
      ]
    },
    {
      category: 'Predictions',
      questions: [
        {
          q: 'How accurate are the AI predictions?',
          a: 'Our AI predictions are based on advanced machine learning models trained on thousands of images. However, accuracy depends on image quality, lighting, and the complexity of the condition. Always consult a qualified dermatologist for professional diagnosis.'
        },
        {
          q: 'What does the confidence score mean?',
          a: 'The confidence score indicates how certain the AI is about its prediction. Higher scores suggest the AI is more confident, but this does not necessarily mean the diagnosis is correct. Always seek professional medical advice.'
        },
        {
          q: 'What should I do if I get a high-risk prediction?',
          a: 'If you receive a high-risk prediction, please consult a qualified dermatologist as soon as possible. The AI prediction is not a substitute for professional medical evaluation.'
        }
      ]
    },
    {
      category: 'Sharing Reports',
      questions: [
        {
          q: 'How do I share a report with a doctor?',
          a: 'After getting a prediction, scroll down to the "Share Report with Doctor" section. Select a doctor from the dropdown list and click "Share". The doctor will then be able to view your report in their dashboard.'
        },
        {
          q: 'Can I share reports with multiple doctors?',
          a: 'Yes, you can share the same report with multiple doctors. Each doctor you select will receive access to view the report.'
        },
        {
          q: 'How do doctors see shared reports?',
          a: 'Doctors log into their dashboard where they can see all reports that patients have shared with them. They can view the images, predictions, and download PDF reports.'
        }
      ]
    },
    {
      category: 'Account & Privacy',
      questions: [
        {
          q: 'Is my medical information secure?',
          a: 'Yes, we take data security seriously. All information is encrypted and stored securely. Only you and the doctors you choose to share reports with can access your medical data.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Currently, account deletion features are being developed. Please contact support if you need to delete your account. Your data can be removed upon request.'
        },
        {
          q: 'Who can see my predictions?',
          a: 'Only you can see your predictions by default. You have full control over which doctors can view your reports through the sharing feature.'
        }
      ]
    },
    {
      category: 'For Doctors',
      questions: [
        {
          q: 'How do I register as a doctor?',
          a: 'Click on "Register as Doctor" on the home page. Fill in your professional information including specialization, license number (optional), years of experience, and consultation fees. Once registered, patients can share reports with you.'
        },
        {
          q: 'Do I need to verify my credentials?',
          a: 'Currently, we accept registrations from all medical professionals. We recommend verifying credentials for production use. Doctors are responsible for providing accurate information.'
        },
        {
          q: 'How do I view patient reports?',
          a: 'When patients share reports with you, they will appear in your doctor dashboard. You can view images, predictions, and download PDF reports for your records.'
        }
      ]
    }
  ]

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🩺 DermAI</h1>
          <p className="text-2xl font-semibold mb-2 italic">Your Skin, Our AI – Diagnose with Confidence</p>
          <p className="text-xl text-blue-100">Help Center & FAQ</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#getting-started" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
              <div className="text-2xl mb-2">🚀</div>
              <p className="font-semibold text-gray-900">Getting Started</p>
            </a>
            <a href="#predictions" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
              <div className="text-2xl mb-2">🔬</div>
              <p className="font-semibold text-gray-900">Predictions</p>
            </a>
            <a href="#sharing" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
              <div className="text-2xl mb-2">📤</div>
              <p className="font-semibold text-gray-900">Sharing Reports</p>
            </a>
          </div>
        </div>

        {/* FAQ Sections */}
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} id={section.category.toLowerCase().replace(/\s+/g, '-')} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.category}</h2>
            <div className="space-y-4">
              {section.questions.map((faq, faqIndex) => {
                const isOpen = openSection === `${sectionIndex}-${faqIndex}`
                return (
                  <div key={faqIndex} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(`${sectionIndex}-${faqIndex}`)}
                      className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900">{faq.q}</span>
                      <span className="text-blue-600">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 pt-2 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default Help

