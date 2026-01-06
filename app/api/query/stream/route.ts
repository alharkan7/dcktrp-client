import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        const authHeader = request.headers.get('authorization');
        const userIdHeader = request.headers.get('x-user-id');
        const apiKeyHeader = request.headers.get('x-api-key');
        const contentType = request.headers.get('content-type');

        let body: string | FormData;
        const headers: Record<string, string> = {
            'Authorization': authHeader || '',
            ...(userIdHeader ? { 'X-User-ID': userIdHeader } : {}),
            ...(apiKeyHeader ? { 'X-API-Key': apiKeyHeader } : {}),
        };

        // Check if this is a FormData request (file upload)
        if (contentType?.includes('multipart/form-data')) {
            // For FormData, we need to pass it through directly
            body = await request.formData();
            // Don't set Content-Type for FormData - fetch will handle it with boundary
        } else {
            // For JSON requests
            body = await request.text();
            headers['Content-Type'] = 'application/json';
        }

        // Forward to backend
        const response = await fetch(`${backendUrl}/query/stream`, {
            method: 'POST',
            headers,
            body,
        });

        // Return the streaming response as-is
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Query stream proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Stream failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
