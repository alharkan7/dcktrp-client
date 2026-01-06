import { QueryRequest, StreamChunk } from '@/types';
import { storage } from '../utils/storage';

const getBackendUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';
};

export const chatApi = {
    /**
     * Stream a query to the RAG system with automatic conversation management
     * The server will automatically create a conversation if not provided and save messages
     * Supports file attachments (images, PDFs, text files)
     * 
     * Note: File attachments bypass the Next.js proxy and call the backend directly
     */
    async streamQuery(
        request: QueryRequest,
        onChunk: (chunk: StreamChunk) => void,
        onError: (error: string) => void,
        onComplete: () => void,
        files?: File[]
    ): Promise<void> {
        try {
            // Get user_id from storage for SSO authentication
            const userId = storage.getUserId();
            const apiKey = process.env.NEXT_PUBLIC_RAGSYSTEM_API_KEY || '';

            let url: string;
            let body: FormData | string;
            const headers: Record<string, string> = {
                ...(userId ? { 'X-User-ID': userId } : {}),
                ...(apiKey ? { 'X-API-Key': apiKey } : {}),
            };

            // If files are provided, use FormData and call backend directly
            if (files && files.length > 0) {
                const formData = new FormData();

                // Add query parameters as JSON string
                formData.append('query_params', JSON.stringify({
                    ...request,
                    stream: true,
                }));

                // Add files
                files.forEach((file) => {
                    formData.append('files', file);
                });

                body = formData;
                url = `${getBackendUrl()}/query/stream`;
                // Note: Don't set Content-Type header for FormData, browser will set it with boundary
            } else {
                // Use JSON for text-only queries through proxy
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({
                    ...request,
                    stream: true,
                });
                url = '/query/stream'; // Use proxy for text-only
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Response body is null');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const chunk: StreamChunk = JSON.parse(line);
                            onChunk(chunk);

                            if (chunk.error) {
                                onError(chunk.error);
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }

            onComplete();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            onError(errorMessage);
        }
    },
};
