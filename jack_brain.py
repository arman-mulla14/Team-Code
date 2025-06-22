import sys
import json
from difflib import SequenceMatcher

# General Conversation Knowledge Base
CONVERSATION_BASE = [
    {
        "question": "Hi",
        "answer": "Hello! How can I help you today?"
    },
    {
        "question": "Hello",
        "answer": "Hey there! What can I assist you with?"
    },
    {
        "question": "What's your name?",
        "answer": "I'm Jack, your programming buddy!"
    },
    {
        "question": "How are you?",
        "answer": "I'm great, thanks for asking! How about you?"
    },
    {
        "question": "What can you do?",
        "answer": "I can help you with programming, HTML, CSS, and more!"
    },
    {
        "question": "Thank you",
        "answer": "You're welcome!"
    },
    {
        "question": "Thanks",
        "answer": "No problem!"
    },
    {
        "question": "Bye",
        "answer": "Goodbye! Come back anytime you need help."
    },
    {
        "question": "See you",
        "answer": "See you soon! Keep coding."
    },
    {
        "question": "What is your purpose?",
        "answer": "I'm here to help you learn and solve problems!"
    }
]

# HTML/CSS Knowledge Base
HTML_CSS_BASE = [
    {
        "question": "What is <!DOCTYPE html>?",
        "answer": "`<!DOCTYPE html>` declares the HTML version. It helps browsers render the page correctly."
    },
    {
        "question": "How to link a CSS file in HTML?",
        "answer": "Use the `<link rel=\"stylesheet\" href=\"style.css\">` inside the `<head>` tag."
    },
    {
        "question": "How to create a hyperlink in HTML?",
        "answer": "Use the `<a href=\"https://example.com\">Link</a>` tag."
    },
    {
        "question": "How to insert an image in HTML?",
        "answer": "Use the `<img src=\"image.jpg\" alt=\"description\">` tag."
    },
    {
        "question": "What is the purpose of the alt attribute in images?",
        "answer": "It provides alternative text for the image if it cannot be displayed."
    },
    {
        "question": "How to create a table in HTML?",
        "answer": "Use `<table>`, `<tr>` for rows, and `<td>` for cells."
    },
    {
        "question": "How to make a text input field in HTML?",
        "answer": "Use `<input type=\"text\">`."
    },
    {
        "question": "What is the difference between id and class in HTML?",
        "answer": "`id` is unique, `class` can be used on multiple elements."
    },
    {
        "question": "How to add a comment in HTML?",
        "answer": "Use `<!-- This is a comment -->`."
    },
    {
        "question": "What is the use of <meta> tag in HTML?",
        "answer": "It provides metadata like character set, description, keywords, etc."
    },
    {
        "question": "How to change text color in CSS?",
        "answer": "Use the `color` property like `color: red;`."
    },
    {
        "question": "How to center a div using Flexbox?",
        "answer": "Use `display: flex; justify-content: center; align-items: center;`."
    },
    {
        "question": "How to apply a background color in CSS?",
        "answer": "Use `background-color: blue;`."
    },
    {
        "question": "What does `position: absolute;` do?",
        "answer": "It positions the element relative to the nearest positioned ancestor."
    },
    {
        "question": "How to add padding in CSS?",
        "answer": "Use the `padding` property like `padding: 10px;`."
    },
    {
        "question": "How to set the font in CSS?",
        "answer": "Use the `font-family` property like `font-family: Arial, sans-serif;`."
    },
    {
        "question": "What is the difference between em and rem units?",
        "answer": "`em` is relative to the parent, `rem` is relative to the root element."
    },
    {
        "question": "How to add a border in CSS?",
        "answer": "Use the `border` property like `border: 1px solid black;`."
    },
    {
        "question": "What is a media query in CSS?",
        "answer": "It's used to apply styles based on device characteristics."
    },
    {
        "question": "How to hide an element in CSS?",
        "answer": "Use `display: none;` or `visibility: hidden;`."
    }
]

def similar(a, b):
    """Calculate string similarity ratio"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_match(prompt, knowledge_base):
    """Find the best matching question from the knowledge base"""
    best_match = None
    highest_ratio = 0
    
    for item in knowledge_base:
        ratio = similar(prompt, item["question"])
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = item
    
    # Only return a match if it's reasonably similar (threshold: 0.6)
    if highest_ratio > 0.6:
        return best_match
    return None

def get_response(prompt):
    # Check if it's a name introduction
    name_pattern = r"(my name is|i am|you can call me) ([a-z]+)"
    import re
    name_match = re.search(name_pattern, prompt.lower())
    if name_match:
        return {
            'message': f"Nice to meet you, {name_match.group(2).capitalize()}! I'm Jack, your programming buddy. What would you like to know about web development?",
            'type': 'info'
        }
    
    # First check for general conversation
    conv_match = find_best_match(prompt, CONVERSATION_BASE)
    if conv_match:
        return {
            'message': conv_match["answer"],
            'type': 'info'
        }
    
    # Then check for HTML/CSS knowledge
    html_css_match = find_best_match(prompt, HTML_CSS_BASE)
    if html_css_match:
        return {
            'message': html_css_match["answer"],
            'type': 'code' if '`' in html_css_match["answer"] else 'info'
        }
    
    # Default response for unknown questions
    return {
        'message': "Hey! I'm Jack, your programming buddy! I can help you with HTML tags, CSS properties, and general programming stuff. What would you like to know?",
        'type': 'info'
    }

if __name__ == "__main__":
    # Read input from stdin (which will be sent from Node.js server)
    input_data = sys.stdin.read()
    prompt = json.loads(input_data)['prompt']
    
    response = get_response(prompt)
    sys.stdout.write(json.dumps(response))
    sys.stdout.flush() 