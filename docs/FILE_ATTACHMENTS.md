# File Attachment Feature for Chat

## Overview

The chat interface now supports file attachments, enabling multimodal RAG queries with:
- 📄 **PDF documents** (converted to images for vision models or extracted as text)
- 🖼️ **Images** (JPEG, PNG, GIF, WebP)
- 📝 **Text files** (TXT, DOC, DOCX)

## How It Works

### Frontend (dcktrp-client)

1. **MessageInput Component** (`components/chat/MessageInput.tsx`)
   - Paperclip button to attach files
   - Visual file preview with file name, size, and remove option
   - Supports multiple file attachments
   - File type icons (image vs document)

2. **Chat API** (`lib/api/chat.ts`)
   - Automatically detects when files are attached
   - Sends FormData instead of JSON when files are present
   - FormData structure:
     ```
     query_params: JSON string with all query parameters
     files: Multiple file objects
     ```

3. **API Proxy** (`app/api/query/stream/route.ts`)
   - Handles both JSON and FormData requests
   - Forwards multipart requests to backend
   - Preserves file boundaries and content types

### Backend (dcktrp-rag)

1. **Query Routes** (`ragsystem/api/routers/query_routes.py`)
   - Both `/query` and `/query/stream` endpoints support file uploads
   - File processing:
     - **PDFs**: Converted to images using PyMuPDF (up to 20 pages)
     - **Images**: Base64-encoded for vision API
     - **Text files**: Extracted and appended to query
   - Multimodal content structure sent to LLM:
     ```python
     [
       {"type": "text", "text": "user query + file content"},
       {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
     ]
     ```

## Supported File Types

| File Type | Max Size | Processing Method |
|-----------|----------|-------------------|
| PDF | No limit | Converted to images (PyMuPDF) or text extraction (PyPDF2) |
| Images (JPEG, PNG, GIF, WebP) | No limit | Base64-encoded for vision models |
| Text (TXT, DOC, DOCX) | 10KB per file | UTF-8 decoded and appended to query |

## Usage

### For End Users

1. Click the **📎 Paperclip** icon in the chat input
2. Select one or more files
3. Review attached files (they appear above the input)
4. Type your question (optional if files are self-explanatory)
5. Click **Send** or press Enter

### For Developers

**Client-side:**
```typescript
// MessageInput callback
const handleSendMessage = async (content: string, files?: File[]) => {
    await chatApi.streamQuery(
        {
            query: content,
            mode: 'mix',
            // ... other params
        },
        onChunk,
        onError,
        onComplete,
        files  // Pass files here
    );
};
```

**API Request:**
```javascript
// FormData structure when files are present
const formData = new FormData();
formData.append('query_params', JSON.stringify({
    query: "What's in this document?",
    mode: "mix",
    stream: true,
    // ... other parameters
}));

// Add files
files.forEach(file => {
    formData.append('files', file);
});

// Send to /query/stream
fetch('/query/stream', {
    method: 'POST',
    body: formData,  // No Content-Type header needed
});
```

## LLM Requirements

**Important**: File attachments (especially images and PDFs converted to images) require a **vision-capable LLM**. Compatible models include:

- ✅ **GPT-4o** / **GPT-4o-mini** (OpenAI)
- ✅ **GPT-4 Vision** (OpenAI)
- ✅ **Claude 3** (Anthropic)
- ✅ **Gemini Pro Vision** (Google)
- ❌ **GPT-3.5-turbo** (text-only, no vision support)
- ❌ **Local Ollama models** (most don't support vision)

### Configuration

To use file attachments, ensure your `.env` file has a vision-capable model:

```bash
# Recommended configuration
LLM_BINDING=openai
LLM_MODEL=gpt-4o-mini  # or gpt-4o
LLM_BINDING_HOST=https://api.openai.com/v1
LLM_BINDING_API_KEY=your_api_key
```

### Technical Details

### File Processing Pipeline

1. **Upload**: Files uploaded through MessageInput component
2. **Route Selection**:
   - **Text-only queries**: Use Next.js API proxy (`/query/stream`)
   - **Queries with files**: Bypass proxy, call backend directly (`${BACKEND_URL}/query/stream`)
3. **FormData Creation**: Client creates FormData with query params + files
4. **Backend Processing**:
   - PDFs → Images (PyMuPDF) or Text (PyPDF2)
   - Images → Base64 encoding
   - Text → UTF-8 decoding
5. **Multimodal Array**: Structured content array for LLM
6. **LLM Processing**: Vision model analyzes text + images together
7. **Streaming Response**: Results streamed back to client

**Why bypass the proxy for files?**
- Next.js API routes can have issues parsing multipart FormData boundaries
- Direct backend calls ensure proper file transmission
- Text-only queries still benefit from proxy features (CORS, auth forwarding)

### Error Handling

- **Unsupported file types**: Logged and skipped with a note in context
- **PDF processing failures**: Falls back to text extraction
- **Image encoding errors**: Logged and skipped
- **Text decoding errors**: File noted as "could not read"

### Limitations

- PDF processing limited to **20 pages** to avoid payload size issues
- Text files truncated at **10,000 characters**
- Vision models may have token/image limits (check LLM provider docs)

## Testing

### Manual Test

1. Start the backend: `ragsystem-server`
2. Start the client: `pnpm dev`
3. Navigate to chat page
4. Attach a test image or PDF
5. Ask: "What do you see in this file?"
6. Verify response includes file content analysis

### Test Files

Good test files:
- Simple image with text (screenshot)
- Short PDF (1-3 pages)
- Text file with specific content

### Troubleshooting

**Files not uploading:**
- Check browser console for errors
- Verify file types are in the accept list
- Check network tab for FormData structure

**Backend errors:**
- Ensure PyMuPDF or PyPDF2 is installed
- Check if LLM model supports vision
- Verify API key has access to vision models

**No response about file content:**
- Confirm using vision-capable model
- Check backend logs for file processing messages
- Verify multimodal_content is being sent to LLM

## Future Enhancements

- [ ] File size limit warnings
- [ ] Drag-and-drop file upload
- [ ] Image/PDF preview thumbnails
- [ ] Support for more file types (Excel, PowerPoint)
- [ ] Progress indicators for large files
- [ ] File upload to knowledge base option
