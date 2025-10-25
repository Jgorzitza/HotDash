/**
 * Content Management API Routes
 *
 * Provides REST API endpoints for content management functionality
 */
import { ContentService } from "~/services/content";
// ============================================================================
// GET /api/content - Get content entries with filtering
// ============================================================================
export async function loader({ request }) {
    const url = new URL(request.url);
    const content_type_id = url.searchParams.get('content_type_id');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');
    try {
        const result = await ContentService.getContentEntries({
            content_type_id: content_type_id || undefined,
            status: status || undefined,
            limit,
            offset,
            search: search || undefined
        });
        return Response.json({
            success: true,
            data: result.entries,
            pagination: {
                total: result.total,
                limit,
                offset,
                hasMore: offset + limit < result.total
            }
        });
    }
    catch (error) {
        console.error('Error fetching content entries:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch content entries'
        }, { status: 500 });
    }
}
// ============================================================================
// POST /api/content - Create new content entry
// ============================================================================
export async function action({ request }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        const body = await request.json();
        const { action: actionType, ...data } = body;
        switch (actionType) {
            case 'create_entry':
                return await ContentService.createContentEntry(data)
                    .then(result => Response.json({
                    success: true,
                    data: result,
                    message: 'Content entry created successfully'
                }))
                    .catch(error => Response.json({
                    success: false,
                    error: error.message
                }, { status: 400 }));
            case 'create_content_type':
                return await ContentService.createContentType(data)
                    .then(result => Response.json({
                    success: true,
                    data: result,
                    message: 'Content type created successfully'
                }))
                    .catch(error => Response.json({
                    success: false,
                    error: error.message
                }, { status: 400 }));
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error processing content request:', error);
        return Response.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.content.js.map