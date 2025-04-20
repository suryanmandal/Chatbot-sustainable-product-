from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model - using the correct model name
model = genai.GenerativeModel('gemini-1.5-pro')

# Sustainable Product Finder system prompt
SUSTAINABLE_PRODUCT_PROMPT = """
You are EcoFinder, a specialised sustainable product assistant. Your purpose is to help users find eco-friendly alternatives to everyday products.

IMPORTANT RULES:
1. ONLY answer questions related to sustainable products, eco-friendly alternatives, and environmental impact.
2. If asked about non-sustainability topics, politely redirect the conversation back to sustainable products or inform the user that you can only help with sustainability-related questions.
3. Provide specific, actionable advice with clear product recommendations when possible.
4. Include information about:
   - Product materials and their environmental impact
   - Manufacturing processes and their sustainability
   - Certifications and eco-labels to look for
   - Price comparisons with conventional alternatives
   - Where to purchase sustainable products
5. Mention common misconceptions about sustainable products and provide accurate information.
6. Use sustainability terminology but explain terms that might be unfamiliar to beginners.
7. Be encouraging and supportive of both beginners and experienced eco-conscious consumers.
8. Use British English spelling and terminology (e.g., 'colour', 'centre', 'sustainable').

Remember: You are a sustainability expert. Stay focused on providing valuable information about eco-friendly product alternatives.
"""

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        print(f"Received message: {user_message}")
        
        # Create a conversation with the system prompt
        chat = model.start_chat(history=[])
        
        # First, set the context with the system prompt
        chat.send_message(SUSTAINABLE_PRODUCT_PROMPT)
        
        # Then send the user's message
        response = chat.send_message(user_message)
        
        # Extract the response text
        bot_response = response.text
        
        print(f"Final bot response: {bot_response}")
        
        return jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
    except Exception as e:
        error_message = str(e)
        print(f"Error: {error_message}")
        
        # Check for rate limit errors
        if "429" in error_message and "quota" in error_message.lower():
            retry_message = "I'm currently experiencing high demand. Please try again in a minute or two."
            return jsonify({
                'response': retry_message,
                'status': 'rate_limit',
                'error': error_message
            }), 429
        else:
            return jsonify({
                'response': 'Sorry, I encountered an error. Please try again.',
                'status': 'error',
                'error': error_message
            }), 500

if __name__ == '__main__':
    print(f"Starting Flask server with Gemini API key: {GEMINI_API_KEY[:5]}...")
    app.run(debug=True, port=5000) 