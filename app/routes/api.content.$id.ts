/**
 * Individual Content Entry API Routes
 * 
 * Provides REST API endpoints for individual content entry operations
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { ContentService } from "~/services/content";

// ============================================================================
// GET /api/content/:id - Get specific content entry
// ============================================================================

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json({
      success: false,
      error: 'Content entry ID is required'
    }, { status: 400 });
  }

  try {
    const entry = await ContentService.getContentEntryById(id);

    if (!entry) {
      return json({
        success: false,
        error: 'Content entry not found'
      }, { status: 404 });
    }

    return json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error fetching content entry:', error);
    return json({
      success: false,
      error: 'Failed to fetch content entry'
    }, { status: 500 });
  }
}

// ============================================================================
// PUT /api/content/:id - Update content entry
// DELETE /api/content/:id - Delete content entry
// ============================================================================

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json({
      success: false,
      error: 'Content entry ID is required'
    }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action: actionType, ...data } = body;

    switch (request.method) {
      case 'PUT':
        if (actionType === 'update_entry') {
          return await ContentService.updateContentEntry(id, data)
            .then(result => json({
              success: true,
              data: result,
              message: 'Content entry updated successfully'
            }))
            .catch(error => json({
              success: false,
              error: error.message
            }, { status: 400 }));
        }
        break;

      case 'DELETE':
        await ContentService.deleteContentEntry(id);
        return json({
          success: true,
          message: 'Content entry deleted successfully'
        });

      default:
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing content entry request:', error);
    return json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}
