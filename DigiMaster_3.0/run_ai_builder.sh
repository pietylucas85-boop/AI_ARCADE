#!/bin/bash
# DigiMaster AI Builder Script
# Use this to send the prompt to Gemini 3 Pro or Fara 7B via terminal

echo "🚀 DigiMaster 3.0 - AI Build Assistant"
echo "======================================"
echo ""
echo "Choose your AI model:"
echo "1) Gemini 3 Pro (via Google AI Studio API)"
echo "2) Fara 7B (local via Ollama)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "Using Gemini 3 Pro..."
    echo ""
    
    # Read the prompt file
    PROMPT=$(cat AI_BUILD_PROMPT.md)
    
    # Use Google AI CLI or API
    # Option A: If you have gcloud CLI
    # gcloud ai models predict gemini-3-pro --prompt="$PROMPT"
    
    # Option B: Direct API call with curl
    API_KEY="AIzaSyDdoUpj8QoRA2v3K4H_1ZoZUAXiUKtvn4M"
    
    curl -X POST \
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$API_KEY" \
      -H 'Content-Type: application/json' \
      -d "{
        \"contents\": [{
          \"parts\": [{
            \"text\": $(cat AI_BUILD_PROMPT.md | jq -Rs .)
          }]
        }],
        \"generationConfig\": {
          \"temperature\": 0.7,
          \"maxOutputTokens\": 8000
        }
      }" | jq -r '.candidates[0].content.parts[0].text' > BUILD_OUTPUT.md
    
    echo ""
    echo "✅ Response saved to BUILD_OUTPUT.md"
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "Using Fara 7B (local via Ollama)..."
    echo ""
    
    # Check if Ollama is running
    if ! command -v ollama &> /dev/null; then
        echo "❌ Ollama not found. Please install from https://ollama.ai"
        exit 1
    fi
    
    # Send prompt to Fara 7B
    cat AI_BUILD_PROMPT.md | ollama run fara:7b > BUILD_OUTPUT.md
    
    echo ""
    echo "✅ Response saved to BUILD_OUTPUT.md"
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "📄 Review the output and copy the code into your project!"
echo ""
